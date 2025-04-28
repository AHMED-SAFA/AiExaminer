from rest_framework import serializers
from create_exam_app.models import ExamSession


class ExamSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer for exam session with exam details"""
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    output_pdf = serializers.CharField(source='exam.output_pdf', read_only=True)
    minus_marking_value = serializers.CharField(source='exam.minus_marking_value', read_only=True)
    each_question_marks = serializers.CharField(source='exam.each_question_marks', read_only=True)
    total_marks = serializers.FloatField(source='exam.total_marks', read_only=True)
    duration = serializers.IntegerField(source='exam.duration', read_only=True)
    completion_date = serializers.DateTimeField(source='end_time', format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = ExamSession
        fields = [
            'id',
            'exam_title',
            "each_question_marks",
            "minus_marking_value",
            "output_pdf",
            'total_marks',
            'duration',
            "unanswered",
            'completion_date',
            'is_completed',
            'corrected_ans',
            'wrong_ans',
            'score',
        ]
