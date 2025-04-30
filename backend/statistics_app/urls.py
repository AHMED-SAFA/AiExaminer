from django.urls import path
from .views import ExamStatisticsView, ExamDetailStatisticsView, GenerateAISuggestions

urlpatterns = [
    path('statistics/', ExamStatisticsView.as_view(), name='exam_statistics'),
    path('<int:exam_id>/statistics/', ExamDetailStatisticsView.as_view(), name='exam_detail_statistics'),
    path('generate-suggestions/', GenerateAISuggestions.as_view(), name='exam_generate_suggestions'),
]