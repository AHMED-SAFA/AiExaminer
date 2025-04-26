from django.urls import path
from .views import (
    UserExamListView,
    StartExamView,
    SubmitAnswerView,
    CompleteExamView,
    CreateExamView,
    GenerateAnswerOptionsView,
)


urlpatterns = [
    path("exams-list/", UserExamListView.as_view(), name="user-exams-list"),
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
    path(
        "generate-options-answers/",
        GenerateAnswerOptionsView.as_view(),
        name="generate-options-answers",
    ),
]
