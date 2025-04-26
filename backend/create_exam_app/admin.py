from django.contrib import admin
from django.utils.html import format_html
from .models import Exam, Question, Option, ExamSession, UserAnswer

class OptionInline(admin.TabularInline):
    model = Option
    extra = 0
    min_num = 2
    fields = ("option_text", "is_correct")
    ordering = ("id",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "short_question_text", "exam", "marks", "from_pdf")
    list_filter = ("exam", "from_pdf", "marks")
    search_fields = ("question_text", "exam__title")
    inlines = [OptionInline]
    list_per_page = 20

    def short_question_text(self, obj):
        return (
            f"{obj.question_text[:50]}..."
            if len(obj.question_text) > 50
            else obj.question_text
        )

    short_question_text.short_description = "Question Text"


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ("question_text", "marks", "from_pdf")
    readonly_fields = ("from_pdf",)
    show_change_link = True


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "creator_with_link",
        "duration",
        "total_marks",
        "created_at",
        "processing_status",
        "is_processed",
        "output_pdf",
        "question_count",
    )
    list_filter = ("is_processed", "processing_status", "created_at", "minus_marking")
    search_fields = ("title", "created_by__username")
    readonly_fields = ("pdf_preview", "processing_status", "is_processed")
    fieldsets = (
        (None, {"fields": ("title", "created_by", "pdf_file", "pdf_preview")}),
        (
            "Configuration",
            {
                "fields": (
                    "duration",
                    "total_marks",
                    "minus_marking",
                    "minus_marking_value",
                    "mcq_options_count",
                    "output_pdf",
                    "question_count",
                )
            },
        ),
        ("Status", {"fields": ("is_processed", "processing_status")}),
    )
    inlines = [QuestionInline]
    list_per_page = 20

    def creator_with_link(self, obj):
        from django.urls import reverse
        from django.utils.html import escape

        url = reverse("admin:auth_app_user_change", args=[obj.created_by.id])
        return format_html('<a href="{}">{}</a>', url, escape(obj.created_by.username))

    creator_with_link.short_description = "Created By"

    def pdf_preview(self, obj):
        if obj.pdf_file:
            return format_html(
                '<a href="{}" target="_blank">View PDF</a>', obj.pdf_file.url
            )
        return "-"

    pdf_preview.short_description = "PDF Preview"


class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ("question", "selected_option", "is_correct")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):
    list_display = ("exam", "user", "start_time", "duration", "is_completed", "score")
    list_filter = ("exam", "is_completed", "start_time")
    search_fields = ("user__username", "exam__title")
    readonly_fields = ("duration",)
    inlines = [UserAnswerInline]
    list_per_page = 20

    def duration(self, obj):
        if obj.end_time:
            delta = obj.end_time - obj.start_time
            minutes = delta.total_seconds() / 60
            return f"{minutes:.1f} mins"
        return "-"

    duration.short_description = "Duration Taken"


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = (
        "session_info",
        "short_question",
        "selected_option_text",
        "is_correct",
    )
    list_filter = ("is_correct", "session__exam")
    search_fields = (
        "session__user__username",
        "question__question_text",
        "selected_option__option_text",
    )
    readonly_fields = ("session", "question", "selected_option", "is_correct")
    list_per_page = 30

    def session_info(self, obj):
        return f"{obj.session.user.username} - {obj.session.exam.title}"

    session_info.short_description = "Session"

    def short_question(self, obj):
        return (
            f"{obj.question.question_text[:50]}..."
            if len(obj.question.question_text) > 50
            else obj.question.question_text
        )

    short_question.short_description = "Question"

    def selected_option_text(self, obj):
        return (
            obj.selected_option.option_text[:50] + "..." if obj.selected_option else "-"
        )

    selected_option_text.short_description = "Selected Answer"
