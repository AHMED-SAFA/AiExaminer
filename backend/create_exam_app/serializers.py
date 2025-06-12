from rest_framework import serializers
from .models import Exam, Question, Option, ExamSession, UserAnswer
import filetype 

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
            "each_question_marks",
            "minus_marking",
            "minus_marking_value",
            "mcq_options_count",
            "created_at",
            "output_pdf",
            "question_count",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_pdf_file(self, value):
        """Validate PDF file type and size"""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")

        # Get the file extension and content type
        file_name = value.name.lower()
        content_type = value.content_type.lower()

        # List of allowed extensions and content types
        allowed_extensions = ['.pdf', '.txt']
        allowed_content_types = [
            'application/pdf',
            'text/plain',
            'application/x-pdf',
            'application/acrobat',
            'application/vnd.pdf',
        ]

        # Check file extension
        if not any(file_name.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError("Only PDF and text files are accepted")

        # Check content type
        if content_type not in allowed_content_types:
            raise serializers.ValidationError("Invalid file type. Only PDF and text files are accepted")

        try:
            # For PDF files, verify the file header
            if file_name.endswith('.pdf'):
                # Read first few bytes to check PDF signature
                file_header = value.read(5)
                value.seek(0)  # Reset file pointer to beginning
                
                # Check if file starts with PDF signature (%PDF-)
                if not file_header.startswith(b'%PDF-'):
                    raise serializers.ValidationError("Invalid PDF file format")

        except Exception as e:
            raise serializers.ValidationError(f"Error validating file: {str(e)}")

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
        fields = [
            "id",
            "question_text",
            "marks",
            "explanation",
            "options",
        ]


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
            "each_question_marks",
            "minus_marking",
            "minus_marking_value",
            "mcq_options_count",
            "created_at",
            "is_processed",
            "processing_status",
            "questions",
            "question_count",
            "output_pdf",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class UserAnswerSerializer(serializers.ModelSerializer):
    """Serializer for user exam answers"""

    status = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = UserAnswer
        fields = ["id", "question", "selected_option", "is_correct", "status"]

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
            "corrected_ans",
            "wrong_ans",
            "score",
            "answers",
        ]
        read_only_fields = ["id", "start_time", "score"]