from django.urls import path
from .views import (
    StartExamView,
    SubmitAnswerView,
    CompleteExamView,
    ExamDetailView,
    ExamQuestionsView,
    ProcessExamPDFView,
    UserExamSessionsView,
)

urlpatterns = [
    path(
        "sessions/<int:user_id>/",
        UserExamSessionsView.as_view(),
        name="user-exam-sessions",
    ),
    path("start-session/", StartExamView.as_view(), name="start-session"),
    path("submit-answer/", SubmitAnswerView.as_view(), name="submit-answer"),
    path(
        "complete-session/<int:pk>/",
        CompleteExamView.as_view(),
        name="complete-session",
    ),
    path("<int:pk>/", ExamDetailView.as_view(), name="exam-detail"),
    path(
        "<int:exam_id>/questions/", ExamQuestionsView.as_view(), name="exam-questions"
    ),
    path("process-pdf/", ProcessExamPDFView.as_view(), name="process-pdf"),
]
