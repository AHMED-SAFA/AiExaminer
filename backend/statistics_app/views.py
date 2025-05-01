from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
import google.generativeai as genai
from django.conf import settings
from create_exam_app.models import Exam, ExamSession, UserAnswer


genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


class ExamStatisticsView(APIView):
    """
    API view to get statistics for all exams
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter exams created by the requesting user
        exams = Exam.objects.filter(created_by=request.user)

        # Calculate statistics for each exam
        exam_stats = []
        for exam in exams:
            sessions = ExamSession.objects.filter(exam=exam)

            # Calculate average score
            avg_score = sessions.aggregate(Avg("score"))["score__avg"] or 0

            # Count sessions
            sessions_count = sessions.count()

            # Calculate completion rate
            completed_sessions = sessions.filter(is_completed=True).count()
            completion_rate = (
                (completed_sessions / sessions_count * 100) if sessions_count > 0 else 0
            )

            exam_stats.append(
                {
                    "id": exam.id,
                    "title": exam.title,
                    "question_count": exam.question_count or 0,
                    "sessions_count": sessions_count,
                    "average_score": avg_score,
                    "completion_rate": completion_rate,
                    "created_at": exam.created_at,
                    "created_by": exam.created_by.username,
                }
            )

        return Response(exam_stats)


class ExamDetailStatisticsView(APIView):
    """
    API view to get detailed statistics for a specific exam
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
        sessions = ExamSession.objects.filter(exam=exam)
        questions = exam.questions.all()

        # Basic exam information
        exam_data = {
            "id": exam.id,
            "title": exam.title,
            "question_count": exam.question_count or questions.count(),
            "sessions_count": sessions.count(),
            "average_score": sessions.aggregate(Avg("score"))["score__avg"] or 0,
            "created_at": exam.created_at,
        }

        # Calculate completion rate
        completed_sessions = sessions.filter(is_completed=True).count()
        exam_data["completion_rate"] = (
            (completed_sessions / sessions.count() * 100) if sessions.count() > 0 else 0
        )

        # Average answer distribution
        answer_stats = {}
        for session in sessions:
            correct = UserAnswer.objects.filter(
                session=session, status=UserAnswer.AnswerStatus.CORRECT
            ).count()
            wrong = UserAnswer.objects.filter(
                session=session, status=UserAnswer.AnswerStatus.WRONG
            ).count()
            unanswered = UserAnswer.objects.filter(
                session=session, status=UserAnswer.AnswerStatus.UNANSWERED
            ).count()

            if "correct" not in answer_stats:
                answer_stats["correct"] = 0
                answer_stats["wrong"] = 0
                answer_stats["unanswered"] = 0

            answer_stats["correct"] += correct
            answer_stats["wrong"] += wrong
            answer_stats["unanswered"] += unanswered

        sessions_count = max(1, sessions.count())  # Avoid division by zero

        exam_data["average_correct"] = answer_stats.get("correct", 0) / sessions_count
        exam_data["average_wrong"] = answer_stats.get("wrong", 0) / sessions_count
        exam_data["average_unanswered"] = (
            answer_stats.get("unanswered", 0) / sessions_count
        )

        # Question difficulty analysis
        question_stats = []
        for question in questions:
            total_answers = UserAnswer.objects.filter(question=question).count()
            if total_answers > 0:
                correct_answers = UserAnswer.objects.filter(
                    question=question, status=UserAnswer.AnswerStatus.CORRECT
                ).count()

                attempted_answers = (
                    UserAnswer.objects.filter(question=question)
                    .exclude(status=UserAnswer.AnswerStatus.UNANSWERED)
                    .count()
                )

                question_stats.append(
                    {
                        "question_id": question.id,
                        "correct_percentage": (correct_answers / total_answers) * 100,
                        "attempt_percentage": (attempted_answers / total_answers) * 100,
                    }
                )

        exam_data["question_stats"] = question_stats

        # Time distribution
        time_segments = []

        # Get the exam duration in minutes
        duration = exam.duration
        segment_size = max(1, duration // 10)  # Create about 10 segments

        for i in range(0, duration + segment_size, segment_size):
            end = min(i + segment_size, duration)
            segment_label = f"{i}-{end} min"

            # Count sessions completed within this time segment
            completions = 0
            for session in sessions.filter(is_completed=True):
                if session.start_time and session.end_time:
                    session_duration = (
                        session.end_time - session.start_time
                    ).total_seconds() / 60
                    if i <= session_duration < end:
                        completions += 1

            time_segments.append(
                {"time_segment": segment_label, "completions": completions}
            )

        exam_data["time_distribution"] = time_segments

        return Response(exam_data)


class GenerateAISuggestions(APIView):
    """
    API view to generate AI-powered suggestions for exam improvement
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam_id = request.data.get("examId")
        stats = request.data.get("stats", {})

        if not exam_id or not stats:
            return Response(
                {"error": "Missing required data"}, status=status.HTTP_400_BAD_REQUEST,
            )

        # Check sessions_count using dictionary access
        if not stats.get('sessions_count', 0):
            return Response(
                {"error": "Participate in exam at least 1 time"}, 
                status=status.HTTP_400_BAD_REQUEST
            )  
        

        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)

        try:
            # Format the statistics for the prompt
            prompt = f"""
            You are an expert in exam analysis and learning optimization. Your task is to 
            analyze exam statistics and provide concise, data-driven recommendations to improve 
            student performance and learning strategies.

            Instructions:

            Analyze the provided exam statistics.

            Focus on key weaknesses (e.g., low correct answers, high unanswered questions, time management).

            Provide 3-5 actionable suggestions—prioritizing the most impactful changes.

            Keep responses short, clear, and practical (bullet points preferred).

            Exam Data:

            Title: {stats.get('title', 'Unknown')}

            Total Questions: {stats.get('question_count', 0)}

            Attempts: {stats.get('sessions_count', 0)}

            Avg. Score: {stats.get('average_score', 0):.2f}%

            Completion Rate: {stats.get('completion_rate', 0):.2f}%

            Answer Distribution:

            Correct: {stats.get('average_correct', 0):.2f}

            Wrong: {stats.get('average_wrong', 0):.2f}

            Unanswered: {stats.get('average_unanswered', 0):.2f}

            Question Stats: {self._format_question_stats(stats.get('question_stats', []))}

            Output Format:

            Top Weaknesses: [Identify 1–2 key issues from the data, e.g., "High unanswered questions suggest time pressure."]

            Performance Tips:

            [Suggestion 1: Focus on weak topics, e.g., "Review [Topic X]—lowest correct answer rate."]

            [Suggestion 2: Active learning, e.g., "Use practice quizzes for high-error questions."]

            Time Management:

            [Tip: e.g., "Simulate timed exams to improve pacing."]

            Example Response (if data shows high unanswered questions):

            Time Management:

            example: Skip time-consuming questions first; return later.
            """

            # Generate suggestions with the AI model
            response = model.generate_content(prompt)
            suggestions = response.text

            return Response({"suggestions": suggestions})

        except Exception as e:
            return Response(
                {"error":  {str(e)}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _format_question_stats(self, question_stats):
        """Format question statistics for the AI prompt"""
        if not question_stats:
            return "No question statistics available."

        result = ""
        for i, stat in enumerate(question_stats):
            result += (
                f"Question {i+1}: {stat.get('correct_percentage', 0):.2f}% correct, "
            )
            result += f"{stat.get('attempt_percentage', 0):.2f}% attempted\n"

        return result
