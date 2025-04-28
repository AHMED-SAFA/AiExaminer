from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from create_exam_app.models import Exam, Question, Option, ExamSession, UserAnswer
from create_exam_app.serializers import (
    ExamDetailSerializer,
    QuestionSerializer,
    ExamSessionSerializer,
    UserAnswerSerializer,
)
from .serializers import ExamSessionDetailSerializer
from rest_framework.views import APIView
import google.generativeai as genai
import openai
from django.conf import settings
import PyPDF2
import json
import re

openai.api_key = settings.OPENAI_API_KEY
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


class ExamDetailView(generics.RetrieveAPIView):
    """View to get a single exam's details"""

    permission_classes = [IsAuthenticated]
    serializer_class = ExamDetailSerializer

    def get_queryset(self):
        return Exam.objects.all()


class ExamQuestionsView(APIView):
    """View to get questions for an exam"""

    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = get_object_or_404(Exam, pk=exam_id)

        # Check if the exam has been processed
        if not exam.is_processed or exam.processing_status != "Generated":
            return Response(
                {"error": "This exam has not been fully processed yet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get questions with options
        questions = exam.questions.all().prefetch_related("options")

        # Serialize questions
        serializer = QuestionSerializer(questions, many=True)

        return Response(serializer.data)


class ProcessExamPDFView(APIView):
    """View to process exam PDF content using Gemini"""

    permission_classes = [IsAuthenticated]

    def extract_questions_from_pdf(self, pdf_path):
        """Extract questions from PDF using Gemini API"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_path)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""

            if not text.strip():
                raise ValueError("No readable text found in PDF")

            # Use Gemini to extract questions and options
            prompt = f"""Extract all questions and their multiple choice options from this exam content.
            For each question, identify the correct answer if possible.
            
            Format your response as strict JSON with this structure:
            {{
                "questions": [
                    {{
                        "text": "Question text here",
                        "options": [
                            {{"text": "Option A", "is_correct": false}},
                            {{"text": "Option B", "is_correct": true}},
                            {{"text": "Option C", "is_correct": false}},
                            {{"text": "Option D", "is_correct": false}}
                        ]
                    }},
                    // More questions...
                ]
            }}
            
            Content from PDF:
            {text[:5000]}  # Limit text to 5000 chars to avoid token limit
            """

            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Extract JSON
            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                data = json.loads(json_str)
                return data.get("questions", [])

            return []

        except Exception as e:
            print(f"Error processing PDF: {str(e)}")
            return []

    def post(self, request):
        exam_id = request.data.get("exam_id")
        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

        try:
            exam.processing_status = "processing"
            exam.save()

            # Process PDF
            pdf_path = exam.output_pdf.path
            questions_data = self.extract_questions_from_pdf(pdf_path)

            if not questions_data:
                raise ValueError("Failed to extract questions from PDF")

            # Create questions and options in database
            with transaction.atomic():
                for q_data in questions_data:
                    # Create question
                    question = Question.objects.create(
                        exam=exam, question_text=q_data["text"], has_options=True
                    )

                    # Create options
                    for opt_data in q_data.get("options", []):
                        Option.objects.create(
                            question=question,
                            option_text=opt_data["text"],
                            is_correct=opt_data.get("is_correct", False),
                            is_ai_generated=True,
                        )

                # Update exam status
                exam.question_count = len(questions_data)
                exam.processing_status = "Generated"
                exam.is_processed = True
                exam.options_generated = True
                exam.answers_generated = True
                exam.save()

            return Response(
                {
                    "message": "Successfully processed exam PDF",
                    "question_count": len(questions_data),
                }
            )

        except Exception as e:
            # Update exam status to failed
            exam.processing_status = "failed"
            exam.save()

            return Response(
                {"error": f"Error processing exam PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StartExamView(generics.CreateAPIView):
    """View to start an exam session"""

    permission_classes = [IsAuthenticated]
    serializer_class = ExamSessionSerializer

    def create(self, request, *args, **kwargs):
        exam_id = request.data.get("exam")
        exam = get_object_or_404(Exam, pk=exam_id)

        # Check if exam processing is complete
        if not exam.is_processed or exam.processing_status != "Generated":
            return Response(
                {"error": "This exam is not ready yet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user already has an active session for this exam
        existing_session = ExamSession.objects.filter(
            user=request.user, exam=exam, is_completed=False
        ).first()

        if existing_session:
            serializer = self.get_serializer(existing_session)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new session
        session = ExamSession.objects.create(user=request.user, exam=exam)

        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmitAnswerView(generics.CreateAPIView):
    """View to submit an answer during an exam"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserAnswerSerializer

    def create(self, request, *args, **kwargs):
        session_id = request.data.get("session")
        question_id = request.data.get("question")
        option_id = request.data.get("selected_option")

        session = get_object_or_404(ExamSession, pk=session_id, user=request.user)

        # Check if exam is still in progress
        if session.is_completed:
            return Response(
                {"error": "This exam session has already been completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        question = get_object_or_404(Question, pk=question_id, exam=session.exam)

        if option_id:
            option = get_object_or_404(Option, pk=option_id, question=question)
            is_correct = option.is_correct
        else:
            option = None
            is_correct = None

        # Create or update answer
        answer, created = UserAnswer.objects.update_or_create(
            session=session,
            question=question,
            defaults={"selected_option": option, "is_correct": is_correct},
        )

        return Response(
            {"status": "Answer recorded", "is_correct": is_correct},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

class CompleteExamView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSessionSerializer

    def update(self, request, *args, **kwargs):
        session_id = kwargs["pk"]
        session = get_object_or_404(ExamSession, pk=session_id, user=request.user)

        if session.is_completed:
            return Response(
                {"error": "This exam session has already been completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Get all questions for this exam
            all_questions = session.exam.questions.all()
            total_questions = all_questions.count()
            
            # Get user's answers for this session
            user_answers = session.answers.all()
            answered_question_ids = set(answer.question_id for answer in user_answers)
            
            # Calculate correct and wrong answers
            correct_answers = user_answers.filter(is_correct=True).count()
            wrong_answers = user_answers.filter(is_correct=False).count()
            
            # Find unanswered questions (questions without any answer)
            unanswered_questions = total_questions - len(answered_question_ids)
            
            # Calculate raw score
            raw_score = correct_answers * session.exam.each_question_marks

            # Apply minus marking if enabled
            if session.exam.minus_marking:
                penalty = wrong_answers * session.exam.minus_marking_value
                raw_score -= penalty
                final_score = raw_score
            else:
                final_score = raw_score

            # Update session
            session.is_completed = True
            session.corrected_ans = correct_answers
            session.wrong_ans = wrong_answers
            session.unanswered = unanswered_questions
            session.end_time = timezone.now()
            session.score = max(0, final_score)
            session.save()

            # Create UserAnswer records for unanswered questions
            unanswered_question_ids = set(q.id for q in all_questions) - answered_question_ids
            for question_id in unanswered_question_ids:
                UserAnswer.objects.create(
                    session=session,
                    question_id=question_id,
                    selected_option=None,
                    is_correct=None
                )

        serializer = self.get_serializer(session)
        return Response(serializer.data)

class UserExamSessionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSessionDetailSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return (
            ExamSession.objects.select_related("exam")
            .filter(user_id=user_id, is_completed=True)
            .order_by("-end_time")
        )
