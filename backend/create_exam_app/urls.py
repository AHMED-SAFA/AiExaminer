from django.urls import path
from .views import (
    UserExamListView,
    CreateExamView,
    GenerateAnswerOptionsView,
    DeleteExamView,
)


urlpatterns = [
    path("exams-list/", UserExamListView.as_view(), name="user-exams-list"),
    path("create-exam/", CreateExamView.as_view(), name="create-exam"),
    path(
        "generate-options-answers/",
        GenerateAnswerOptionsView.as_view(),
        name="generate-options-answers",
    ),
     path('delete-exam/<int:exam_id>/', DeleteExamView.as_view(), name='delete-exam'),
]
