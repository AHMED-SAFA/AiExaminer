# serializers.py
from rest_framework import serializers
from .models import Exam, Question, Option, ExamSession, UserAnswer
import magic


class ExamCreateSerializer(serializers.ModelSerializer):
    """Serializer for exam creation with validation"""

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "pdf_file",
            "duration",
            "total_marks",
            "minus_marking",
            "minus_marking_value",
            "mcq_options_count",
            "created_at",
            "output_pdf",
            "question_count" 
        ]
        read_only_fields = ["id", "created_at"]

    def validate_pdf_file(self, value):
        """Validate PDF file type and size"""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")

        # Check file type
        file_type = magic.from_buffer(value.read(1024), mime=True)
        value.seek(0)

        if file_type not in ["application/pdf", "text/plain"]:
            raise serializers.ValidationError("Only PDF and text files are accepted")

        return value

    def validate_mcq_options_count(self, value):
        """Validate MCQ options count is between 2-6"""
        if value < 2 or value > 6:
            raise serializers.ValidationError(
                "MCQ options count must be between 2 and 6"
            )
        return value

    def validate_duration(self, value):
        """Validate exam duration is reasonable"""
        if value < 5 or value > 180:
            raise serializers.ValidationError(
                "Exam duration must be between 5 and 180 minutes"
            )
        return value

    def validate_minus_marking_value(self, value):
        """Validate minus marking value"""
        if value < 0 or value > 1:
            raise serializers.ValidationError(
                "Minus marking value must be between 0 and 1"
            )
        return value


class OptionSerializer(serializers.ModelSerializer):
    """Serializer for MCQ options"""

    class Meta:
        model = Option
        fields = ["id", "option_text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for exam questions with options"""

    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "question_text", "marks", "explanation", "options",]


class ExamDetailSerializer(serializers.ModelSerializer):
    """Serializer for exam details with questions"""

    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "duration",
            "total_marks",
            "minus_marking",
            "minus_marking_value",
            "mcq_options_count",
            "created_at",
            "is_processed",
            "processing_status",
            "questions",
            "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class UserAnswerSerializer(serializers.ModelSerializer):
    """Serializer for user exam answers"""

    class Meta:
        model = UserAnswer
        fields = ["id", "question", "selected_option"]

    def validate(self, data):
        """Validate the selected option belongs to the question"""
        if "selected_option" in data and data["selected_option"]:
            if data["selected_option"].question.id != data["question"].id:
                raise serializers.ValidationError(
                    {
                        "selected_option": "Selected option does not belong to this question"
                    }
                )
        return data


class ExamSessionSerializer(serializers.ModelSerializer):
    """Serializer for exam session"""

    answers = UserAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ExamSession
        fields = [
            "id",
            "exam",
            "start_time",
            "end_time",
            "is_completed",
            "score",
            "answers",
        ]
        read_only_fields = ["id", "start_time", "score"]
