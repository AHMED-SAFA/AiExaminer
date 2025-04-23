from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Exam, Question, Option, ExamSession, UserAnswer
from .serializers import (
    ExamCreateSerializer,
    ExamDetailSerializer,
    UserAnswerSerializer,
    ExamSessionSerializer,
)
from .tasks import process_exam_document
from rest_framework import status
from rest_framework.views import APIView


class CreateExamView(APIView):
    """Simple view to create an exam"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExamCreateSerializer(data=request.data)
        if serializer.is_valid():
            exam = serializer.save(created_by=request.user)

            try:
                # Process document synchronously
                process_exam_document(exam.id)
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

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamViewSet(viewsets.ModelViewSet):
    """ViewSet for exam CRUD operations"""

    permission_classes = [IsAuthenticated]
    serializer_class = ExamDetailSerializer

    def get_queryset(self):
        """Return exams created by current user"""
        return Exam.objects.filter(created_by=self.request.user)

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == "create":
            return ExamCreateSerializer
        return ExamDetailSerializer

    def perform_create(self, serializer):
        """Set the exam creator to current user and process document"""
        exam = serializer.save(created_by=self.request.user)

        try:
            # Process document synchronously
            process_exam_document(exam.id)
            return Response(
                {"status": "Exam created and processed successfully"},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": f"Error processing exam: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def regenerate_questions(self, request, pk=None):
        """Endpoint to regenerate questions for an exam"""
        exam = self.get_object()

        # Update status to reprocessing
        exam.is_processed = False
        exam.processing_status = "processing"
        exam.save()

        # Delete existing questions
        exam.questions.all().delete()

        try:
            # Process document synchronously
            process_exam_document(exam.id)
            return Response(
                {"status": "Questions regenerated successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"Error regenerating questions: {str(e)}"},
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
