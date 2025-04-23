from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExamViewSet,
    StartExamView,
    SubmitAnswerView,
    CompleteExamView,
    CreateExamView,
)

router = DefaultRouter()
router.register(r"exams", ExamViewSet, basename="exam")

urlpatterns = [
    path("", include(router.urls)),
    path("create-exam/", CreateExamView.as_view(), name="create-exam"), 
    path("exam-sessions/start/", StartExamView.as_view(), name="start-exam"),
    path(
        "exam-sessions/submit-answer/", SubmitAnswerView.as_view(), name="submit-answer"
    ),
    path(
        "exam-sessions/<int:pk>/complete/",
        CompleteExamView.as_view(),
        name="complete-exam",
    ),
]
