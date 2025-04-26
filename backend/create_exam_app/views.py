# from rest_framework import viewsets, status, generics
# from rest_framework.response import Response
# from rest_framework.decorators import action
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from django.db import transaction
# from django.utils import timezone
# from .models import Exam, Question, Option, ExamSession, UserAnswer
# from .serializers import (
#     ExamCreateSerializer,
#     ExamDetailSerializer,
#     UserAnswerSerializer,
#     ExamSessionSerializer,
# )
# from .tasks import process_exam_document
# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework import generics


# class CreateExamView(APIView):
#     """Simple view to create an exam"""

#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = ExamCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             exam = serializer.save(created_by=request.user)

#             try:
#                 return Response(
#                     {
#                         "status": "Exam created and processed successfully",
#                         "exam_id": exam.id,
#                     },
#                     status=status.HTTP_201_CREATED,
#                 )
#             except Exception as e:
#                 return Response(
#                     {"error": f"Error processing exam: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 )

#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST,
#         )


# class UserExamListView(generics.ListAPIView):
#     """View to list all exams for the authenticated user"""
#     permission_classes = [IsAuthenticated]
#     serializer_class = ExamDetailSerializer

#     def get_queryset(self):
#         """Return exams created by the current user"""
#         return Exam.objects.filter(created_by=self.request.user).order_by('-created_at')

# class StartExamView(generics.CreateAPIView):
#     """View to start an exam session"""

#     permission_classes = [IsAuthenticated]
#     serializer_class = ExamSessionSerializer

#     def create(self, request, *args, **kwargs):
#         exam_id = request.data.get("exam")
#         exam = get_object_or_404(Exam, pk=exam_id)

#         # Check if exam processing is complete
#         if not exam.is_processed or exam.processing_status != "completed":
#             return Response(
#                 {"error": "This exam is not ready yet"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Check if user already has an active session for this exam
#         existing_session = ExamSession.objects.filter(
#             user=request.user, exam=exam, is_completed=False
#         ).first()

#         if existing_session:
#             serializer = self.get_serializer(existing_session)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         # Create new session
#         session = ExamSession.objects.create(user=request.user, exam=exam)

#         serializer = self.get_serializer(session)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)


# class SubmitAnswerView(generics.CreateAPIView):
#     """View to submit an answer during an exam"""

#     permission_classes = [IsAuthenticated]
#     serializer_class = UserAnswerSerializer

#     def create(self, request, *args, **kwargs):
#         session_id = request.data.get("session")
#         question_id = request.data.get("question")
#         option_id = request.data.get("selected_option")

#         session = get_object_or_404(ExamSession, pk=session_id, user=request.user)

#         # Check if exam is still in progress
#         if session.is_completed:
#             return Response(
#                 {"error": "This exam session has already been completed"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         question = get_object_or_404(Question, pk=question_id, exam=session.exam)

#         if option_id:
#             option = get_object_or_404(Option, pk=option_id, question=question)
#             is_correct = option.is_correct
#         else:
#             option = None
#             is_correct = None

#         # Create or update answer
#         answer, created = UserAnswer.objects.update_or_create(
#             session=session,
#             question=question,
#             defaults={"selected_option": option, "is_correct": is_correct},
#         )

#         return Response(
#             {"status": "Answer recorded", "is_correct": is_correct},
#             status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
#         )


# class CompleteExamView(generics.UpdateAPIView):
#     """View to complete an exam and calculate score"""

#     permission_classes = [IsAuthenticated]
#     serializer_class = ExamSessionSerializer

#     def update(self, request, *args, **kwargs):
#         session_id = kwargs["pk"]
#         session = get_object_or_404(ExamSession, pk=session_id, user=request.user)

#         if session.is_completed:
#             return Response(
#                 {"error": "This exam session has already been completed"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         with transaction.atomic():
#             # Calculate score
#             correct_answers = session.answers.filter(is_correct=True).count()
#             total_questions = session.exam.questions.count()
#             answered_questions = session.answers.count()

#             # Calculate raw score
#             raw_score = correct_answers

#             # Apply minus marking if enabled
#             if session.exam.minus_marking:
#                 wrong_answers = session.answers.filter(is_correct=False).count()
#                 penalty = wrong_answers * session.exam.minus_marking_value
#                 raw_score -= penalty

#             # Calculate final score based on total marks
#             if total_questions > 0:
#                 final_score = (raw_score / total_questions) * session.exam.total_marks
#             else:
#                 final_score = 0

#             # Update session
#             session.is_completed = True
#             session.end_time = timezone.now()
#             session.score = max(0, final_score)  # Ensure score is not negative
#             session.save()

#         serializer = self.get_serializer(session)
#         return Response(serializer.data)


import time
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from .models import Exam, Question, Option, ExamSession, UserAnswer
from .serializers import (
    ExamCreateSerializer,
    ExamDetailSerializer,
    UserAnswerSerializer,
    ExamSessionSerializer,
)
from rest_framework.views import APIView
import google.generativeai as genai
import openai
from django.conf import settings
import PyPDF2
import io
import os
import json
import re

# Configure OpenAI,gemini API
openai.api_key = settings.OPENAI_API_KEY
genai.configure(api_key=settings.GEMINI_API_KEY)
# model = genai.GenerativeModel('gemini-1.0-pro-001')
# model = genai.GenerativeModel('text-bison-001')
model = genai.GenerativeModel("gemini-1.5-flash")


class CreateExamView(APIView):
    """Simple view to create an exam"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExamCreateSerializer(data=request.data)
        if serializer.is_valid():
            exam = serializer.save(created_by=request.user)

            try:
                return Response(
                    {
                        "status": "Exam created and processed successfully",
                        "exam_id": exam.id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response(
                    {"error": f"Error processing exam: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserExamListView(generics.ListAPIView):
    """View to list all exams for the authenticated user"""

    permission_classes = [IsAuthenticated]
    serializer_class = ExamDetailSerializer

    def get_queryset(self):
        """Return exams created by the current user"""
        return Exam.objects.filter(created_by=self.request.user).order_by("-created_at")


class GenerateAnswerOptionsView(APIView):
    """View to generate options and answers for exam questions using Gemini"""

    permission_classes = [IsAuthenticated]

    def extract_text_from_pdf(self, pdf_file):
        """Extract text content from a PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""  # Handle None returns
            
            if not text.strip():
                raise ValueError("No readable text found in PDF")
                
            print(f"Extracted text from PDF (first 100 chars): {text[:100]}")
            return text
        except Exception as e:
            print(f"PDF extraction error: {str(e)}")
            raise

    def extract_text_from_file(self, file_path):
        """Extract text from a file (PDF or TXT)"""
        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == ".pdf":
            with open(file_path, "rb") as file:
                return self.extract_text_from_pdf(file)
        elif file_ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")

    def analyze_questions(self, exam_content):
        """Analyze the exam content to determine if it contains options or answers"""
        try:
            # Limit content length but ensure we have enough context
            content_sample = exam_content[:5000]
            
            prompt = f"""Analyze this exam content and determine its format.
            
            Content sample:
            {content_sample}
            
            Respond with one of these exact options:
            - "questions_only" - if the content contains just questions without options or answers
            - "with_options" - if questions have multiple choice options
            - "with_answers" - if questions have answers but not formatted as options
            
            Return only one of these three values without any additional text."""

            response = model.generate_content(prompt)
            analysis = response.text.strip().lower()
            
            print(f"Content format analysis: {analysis}")
            
            if "with_options" in analysis:
                return "with_options"
            elif "with_answers" in analysis:
                return "with_answers"
            else:
                return "questions_only"
                
        except Exception as e:
            print(f"Error analyzing questions: {str(e)}")
            return "questions_only"  # Default to questions only on error

    def extract_questions(self, exam_content):
        """Extract questions using Gemini with robust error handling"""
        try:
            # Limit content but take enough to capture multiple questions
            content_sample = exam_content[:7000]
            
            prompt = f"""Extract all questions from this exam content.
            
            The questions might be numbered or bulleted. Try to identify each distinct question.
            Format your response as strict JSON with this structure:
            {{
                "questions": [
                    {{"text": "First question text"}},
                    {{"text": "Second question text"}},
                    ...
                ]
            }}
            
            Include ONLY the JSON in your response, with no additional text, explanations or markdown formatting.
            
            Content:
            {content_sample}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Debug the response
            print(f"Extract questions raw response: {response_text[:200]}...")
            
            # Try to find JSON in the response (looking for { ... })
            json_match = re.search(r'({.*})', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                questions_data = json.loads(json_str)
                return questions_data.get("questions", [])
            else:
                raise ValueError("Could not find valid JSON in the response")
                
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            print(f"Response that couldn't be parsed: {response_text}")
            # Fallback: Try to extract questions manually
            return self.fallback_question_extraction(response_text)
        except Exception as e:
            print(f"Error extracting questions: {str(e)}")
            return []

    def fallback_question_extraction(self, text):
        """Extract questions manually if JSON parsing fails"""
        try:
            # Look for question patterns like numbered questions or questions with "?"
            questions = []
            # Pattern for numbered questions
            numbered_questions = re.findall(r'\d+\.\s*([^\n]+\?)', text)
            
            # Pattern for questions ending with question marks
            question_marks = re.findall(r'([^.!?\n]+\?)', text)
            
            # Combine and deduplicate
            all_questions = set(numbered_questions + question_marks)
            
            return [{"text": q.strip()} for q in all_questions if len(q.strip()) > 10]
        except Exception as e:
            print(f"Fallback extraction failed: {str(e)}")
            return []

    def generate_options_and_answers(self, question_text, options_count):
        """Generate options using Gemini with improved prompt for reliable JSON"""
        try:
            prompt = f"""Create exactly {options_count} multiple choice options for this question with one correct answer.
            
            Question: {question_text}

            Format your response as strict JSON with this structure:
            {{
                "options": [
                    {{"text": "first option text", "is_correct": false}},
                    {{"text": "second option text", "is_correct": true}},
                    ...
                ]
            }}
            
            Requirements:
            1. Exactly one option must be marked as correct (is_correct: true)
            2. All other options must be marked as incorrect (is_correct: false)
            3. Include exactly {options_count} options total
            4. Return ONLY the JSON with no explanations or additional text
            
            Your formatted JSON response:"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Debug
            print(f"Options generation raw response: {response_text[:200]}...")
            
            json_match = re.search(r'({.*})', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                options_data = json.loads(json_str)
                
                # Validate the response
                options = options_data.get("options", [])
                if len(options) != options_count:
                    print(f"Warning: Expected {options_count} options but got {len(options)}")
                
                correct_count = sum(1 for opt in options if opt.get("is_correct"))
                if correct_count != 1:
                    print(f"Warning: Expected 1 correct option but got {correct_count}")
                    # Fix: ensure exactly one correct answer
                    if correct_count == 0 and options:
                        options[0]["is_correct"] = True
                    elif correct_count > 1:
                        # Keep only the first correct answer
                        found_correct = False
                        for opt in options:
                            if opt.get("is_correct"):
                                if found_correct:
                                    opt["is_correct"] = False
                                else:
                                    found_correct = True
                
                return options
            else:
                raise ValueError("Could not find valid JSON in the response")
                
        except Exception as e:
            print(f"Error generating options: {str(e)}")
            return []

    def identify_correct_answers(self, question_text, options):
        """Identify correct answer using Gemini"""
        try:
            options_text = "\n".join(
                [f"{idx+1}. {opt['option_text']}" for idx, opt in enumerate(options)]
            )

            prompt = f"""Question: {question_text}

            Options:
            {options_text}

            Which option number is correct? Respond with ONLY the number (1, 2, 3, etc.)."""

            response = model.generate_content(prompt)
            answer_text = response.text.strip()
            
            print(f"Correct answer identification response: {answer_text}")
            
            # Extract the number
            match = re.search(r"\d+", answer_text)
            if match:
                correct_index = int(match.group()) - 1
                if 0 <= correct_index < len(options):
                    return correct_index
            
            # Default to first option if parsing fails
            return 0
        except Exception as e:
            print(f"Error identifying correct answer: {str(e)}")
            return 0

    def generate_output_pdf(self, exam, questions):
        """Generate a formatted PDF with questions, options and answers"""
        try:            
            # Create output directory if it doesn't exist
            output_dir = os.path.join(settings.MEDIA_ROOT, "exam_outputs")
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate output filename
            output_filename = f"exam_{exam.id}_processed_{int(time.time())}.pdf"
            output_path = os.path.join(output_dir, output_filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Define custom styles
            title_style = ParagraphStyle(
                'Title', 
                parent=styles['Heading1'],
                fontSize=16,
                alignment=1  # Center alignment
            )
            
            question_style = ParagraphStyle(
                'Question',
                parent=styles['Normal'],
                fontSize=12,
                fontName='Helvetica-Bold'
            )
            
            option_style = ParagraphStyle(
                'Option',
                parent=styles['Normal'],
                fontSize=11,
                leftIndent=20
            )
            
            correct_style = ParagraphStyle(
                'CorrectOption',
                parent=option_style,
                textColor=colors.green
            )
            
            # Build content
            content = []
            
            # Add title
            content.append(Paragraph(f"Exam: {exam.title}", title_style))
            content.append(Spacer(1, 12))
            
            # Add questions and options
            for i, question in enumerate(questions, 1):
                # Question text
                content.append(Paragraph(f"Q{i}. {question.question_text}", question_style))
                content.append(Spacer(1, 6))
                
                # Options
                options = question.options.all()
                for j, option in enumerate(options, 1):
                    option_text = f"{chr(64+j)}. {option.option_text}"
                    if option.is_correct:
                        content.append(Paragraph(f"{option_text} ✓", correct_style))
                    else:
                        content.append(Paragraph(option_text, option_style))
                
                content.append(Spacer(1, 12))
            
            # Build PDF
            doc.build(content)
            
            # Return relative path for database storage
            relative_path = os.path.join("exam_outputs", output_filename)
            return relative_path
            
        except Exception as e:
            print(f"Error generating output PDF: {str(e)}")
            return None

    def post(self, request):
        exam_id = request.data.get("exam_id")

        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

        # Check if the exam is already processed
        if exam.answers_generated and exam.options_generated:
            return Response(
                {"message": "Options and answers are already generated for this exam"},
                status=status.HTTP_200_OK,
            )

        try:
            # Update exam status
            exam.processing_status = "processing"
            exam.save()

            # Extract text from the PDF/file
            file_path = exam.pdf_file.path
            exam_content = self.extract_text_from_file(file_path)

            if not exam_content or len(exam_content.strip()) < 10:
                exam.processing_status = "failed"
                exam.save()
                return Response(
                    {"error": "Could not extract sufficient content from the file"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Analyze the content to determine if it has options or answers
            content_format = self.analyze_questions(exam_content)
            print(f"Detected content format: {content_format}")
            
            # Initialize tracking variables
            questions_created = 0
            options_created = 0

            with transaction.atomic():
                # If no questions exist yet, extract them first
                if exam.questions.count() == 0:
                    # Extract questions from content
                    questions_data = self.extract_questions(exam_content)
                    
                    if not questions_data:
                        raise ValueError("No questions could be extracted from the document")

                    for question_data in questions_data:
                        # Create question
                        Question.objects.create(
                            exam=exam,
                            question_text=question_data["text"],
                            has_options=(content_format == "with_options"),
                        )
                        questions_created += 1

                # Process each question
                questions = exam.questions.all()
                for question in questions:
                    # Skip if question already has options and we detected options in the content
                    if question.has_options and content_format == "with_options":
                        continue

                    # Generate options for questions
                    if content_format != "with_options" or not question.has_options:
                        # Generate options for the question
                        options_data = self.generate_options_and_answers(
                            question.question_text, exam.mcq_options_count
                        )

                        # If options were successfully generated
                        if options_data:
                            # Create options in the database
                            for option_data in options_data:
                                Option.objects.create(
                                    question=question,
                                    option_text=option_data["text"],
                                    is_correct=option_data["is_correct"],
                                    is_ai_generated=True,
                                )
                                options_created += 1
                            
                            question.has_options = True
                            question.save()
                    else:
                        # If options exist but correct answer isn't identified
                        options = list(question.options.all())
                        if options and not any(opt.is_correct for opt in options):
                            correct_index = self.identify_correct_answers(
                                question.question_text,
                                [{"option_text": opt.option_text} for opt in options],
                            )
                            # Mark the correct option
                            if 0 <= correct_index < len(options):
                                options[correct_index].is_correct = True
                                options[correct_index].save()
                
                # Generate output PDF with questions and answers
                output_pdf_path = self.generate_output_pdf(exam, questions)
                
                # Update exam statistics
                exam.question_count = questions.count()

            # Update exam status
            exam.processing_status = "completed"
            exam.is_processed = True
            exam.options_generated = True
            exam.answers_generated = True
            exam.save()

            return Response({
                "message": "Successfully generated options and answers for the exam",
                "stats": {
                    "questions_processed": questions.count(),
                    "questions_created": questions_created,
                    "options_created": options_created,
                    "output_pdf": output_pdf_path
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Update exam status to failed
            exam.processing_status = "failed"
            exam.save()

            return Response(
                {"error": f"Error generating options and answers: {str(e)}"},
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
        if not exam.is_processed or exam.processing_status != "completed":
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
    """View to complete an exam and calculate score"""

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
            # Calculate score
            correct_answers = session.answers.filter(is_correct=True).count()
            total_questions = session.exam.questions.count()
            answered_questions = session.answers.count()

            # Calculate raw score
            raw_score = correct_answers

            # Apply minus marking if enabled
            if session.exam.minus_marking:
                wrong_answers = session.answers.filter(is_correct=False).count()
                penalty = wrong_answers * session.exam.minus_marking_value
                raw_score -= penalty

            # Calculate final score based on total marks
            if total_questions > 0:
                final_score = (raw_score / total_questions) * session.exam.total_marks
            else:
                final_score = 0

            # Update session
            session.is_completed = True
            session.end_time = timezone.now()
            session.score = max(0, final_score)  # Ensure score is not negative
            session.save()

        serializer = self.get_serializer(session)
        return Response(serializer.data)
