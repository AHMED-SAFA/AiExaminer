import time
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from .models import Exam, Question, Option
from .serializers import (
    ExamCreateSerializer,
    ExamDetailSerializer,
)
from rest_framework.views import APIView
import google.generativeai as genai
from django.conf import settings
import PyPDF2
import os
import json
import re
import requests

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")
DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


class CreateExamView(APIView):
    """Simple view to create an exam"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExamCreateSerializer(data=request.data)
        if serializer.is_valid():
            exam = serializer.save(created_by=request.user)

            try:
                return Response(
                    {
                        "status": "Exam created and processed successfully",
                        "exam_id": exam.id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response(
                    {"error": f"Error processing exam: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserExamListView(generics.ListAPIView):
    """View to list all exams for the authenticated user"""

    permission_classes = [IsAuthenticated]
    serializer_class = ExamDetailSerializer

    def get_queryset(self):
        """Return exams created by the current user"""
        return Exam.objects.filter(created_by=self.request.user).order_by("-created_at")


class GenerateAnswerOptionsView(APIView):
    """View to generate options and answers for exam questions using Gemini"""

    permission_classes = [IsAuthenticated]

    def extract_text_from_pdf(self, pdf_file):
        """Extract text content from a PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""

            if not text.strip():
                raise ValueError("No readable text found in PDF")

            print(f"Extracted text from PDF (first 100 chars): {text[:100]}")
            return text
        except Exception as e:
            print(f"PDF extraction error: {str(e)}")
            raise

    def extract_text_from_file(self, file_path):
        """Extract text from a file (PDF or TXT)"""
        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == ".pdf":
            with open(file_path, "rb") as file:
                return self.extract_text_from_pdf(file)
        elif file_ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")

    def detect_language(self, text_sample):
        """Detect if text is primarily in Bangla, English, or mixed"""

        try:
            prompt = f"""Analyze this text and determine its language.
            
            Text sample:
            {text_sample[:1000]}
            
            Respond with one of these exact options:
            - "english" - if the content is primarily in English
            - "bangla" - if the content is primarily in Bangla/Bengali
            - "mixed" - if the content contains substantial amounts of both Bangla and English
            
            Return only one of these three values without any additional text."""

            response = model.generate_content(prompt)
            language = response.text.strip().lower()

            print(f"Language detection result: {language}")

            if "bangla" in language:
                return "bangla"
            elif "mixed" in language:
                return "mixed"
            else:
                return "english"

        except Exception as e:
            print(f"Error detecting language: {str(e)}")
            return "english"

    def analyze_questions(self, exam_content):
        """Analyze the exam content to determine if it contains options or answers and detect language"""
        try:
            # Limit content length but ensure we have enough context
            content_sample = exam_content[:5000]

            # First detect language
            language = self.detect_language(content_sample)

            # Then analyze format
            prompt = f"""Analyze this exam content and determine its format.
            
            Content sample:
            {content_sample}
            
            Respond with one of these exact options:
            - "questions_only" - if the content contains just questions without options or answers
            - "questions_with_options" - if questions have multiple choice options
            - "questions_with_answers" - if questions have answers but not formatted as options
            - "questions_with_options_answers" - if questions have both answers and options
            
            Return only one of these four values without any additional text."""

            response = model.generate_content(prompt)
            analysis = response.text.strip().lower()

            print(f"Content format analysis: {analysis}")
            print(f"Content language: {language}")

            # Return both format and language
            format_result = "questions_only"
            if "questions_with_options_answers" in analysis:
                format_result = "questions_with_options_answers"
            elif "questions_with_options" in analysis:
                format_result = "questions_with_options"
            elif "questions_with_answers" in analysis:
                format_result = "questions_with_answers"

            return format_result, language

        except Exception as e:
            print(f"Error analyzing questions: {str(e)}")
            return "questions_only", "english"

    def extract_questions(self, exam_content, language):
        """Extract questions using Gemini with robust error handling and language support"""
        try:
            # Limit content but take enough to capture multiple questions
            content_sample = exam_content[:7000]

            language_instruction = ""
            if language == "bangla":
                language_instruction = "Extract the questions while preserving the original Bangla language."
            elif language == "mixed":
                language_instruction = "Extract the questions, preserving both Bangla and English text as they appear."

            prompt = f"""Extract all questions from this exam content.
            
            The questions might be numbered or bulleted. Randomize the serials of questions.
            Try to identify each distinct question.
            {language_instruction}
            Format your response as strict JSON with this structure:
            {{
                "questions": [
                    {{"text": "First question text"}},
                    {{"text": "Second question text"}},
                    ...
                ]
            }}
            
            Include ONLY the JSON in your response, with no additional text, 
            explanations or markdown formatting.
            
            Content:
            {content_sample}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Debug the response
            print(f"Extract questions raw response: {response_text[:200]}...")

            # Try to find JSON in the response (looking for { ... })
            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                questions_data = json.loads(json_str)
                return questions_data.get("questions", [])
            else:
                raise ValueError("Could not find valid JSON in the response")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            print(f"Response that couldn't be parsed: {response_text}")
            # Fallback: Try to extract questions manually
            return self.fallback_question_extraction(response_text)
        except Exception as e:
            print(f"Error extracting questions: {str(e)}")
            return []

    def fallback_question_extraction(self, text):
        """Extract questions manually if JSON parsing fails"""
        try:
            questions = []
            # Pattern for numbered questions
            numbered_questions = re.findall(r"\d+\.\s*([^\n]+\?)", text)

            # Pattern for questions ending with question marks
            question_marks = re.findall(r"([^.!?\n]+\?)", text)

            # Combine and deduplicate
            all_questions = set(numbered_questions + question_marks)

            return [{"text": q.strip()} for q in all_questions if len(q.strip()) > 10]
        except Exception as e:
            print(f"Fallback extraction failed: {str(e)}")
            return []

    def generate_options_and_answers(self, question_text, options_count, language):
        """Generate options using Gemini with improved prompt for reliable JSON and language support"""
        try:
            language_instruction = ""
            if language == "bangla":
                language_instruction = (
                    "Create the options in Bangla language to match the question."
                )
            elif language == "mixed":
                # Check if the question is primarily Bangla or English
                if self.detect_language(question_text) == "bangla":
                    language_instruction = (
                        "Create the options in Bangla language to match the question."
                    )
                else:
                    language_instruction = "Create the options in the same language as the question (either English or Bangla)."

            prompt = f"""Create exactly {options_count} multiple choice options for 
            this question with one correct answer. Randomize the correct options or 
            answer.
            
            Question: {question_text}
            
            {language_instruction}

            Format your response as strict JSON with this structure:
            {{
                "options": [
                    {{"text": "first option text", "is_correct": true or false}},
                    {{"text": "second option text", "is_correct": true or false}},
                    ...
                ]
            }}
            
            Requirements:
            1. Exactly one option (Set randomly among {options_count} options)
            must be marked as correct (is_correct: true)
            2. All other options must be marked as incorrect (is_correct: false)
            3. Include exactly {options_count} options total
            4. Return ONLY the JSON with no explanations or additional text
            
            Your formatted JSON response:"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Debug
            print(f"Options generation raw response: {response_text[:200]}...")

            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                options_data = json.loads(json_str)

                # Validate the response
                options = options_data.get("options", [])
                if len(options) != options_count:
                    print(
                        f"Warning: Expected {options_count} options but got {len(options)}"
                    )

                correct_count = sum(1 for opt in options if opt.get("is_correct"))
                if correct_count != 1:
                    print(f"Warning: Expected 1 correct option but got {correct_count}")
                    # Fix: ensure exactly one correct answer
                    if correct_count == 0 and options:
                        options[0]["is_correct"] = True
                    elif correct_count > 1:
                        # Keep only the first correct answer
                        found_correct = False
                        for opt in options:
                            if opt.get("is_correct"):
                                if found_correct:
                                    opt["is_correct"] = False
                                else:
                                    found_correct = True

                return options
            else:
                raise ValueError("Could not find valid JSON in the response")

        except Exception as e:
            print(f"Error generating options: {str(e)}")
            return []

    def extract_questions_with_options(self, exam_content, language):
        """Extract questions and their options using Gemini with language support"""
        try:
            content_sample = exam_content[:10000]

            language_instruction = ""
            if language == "bangla":
                language_instruction = "Extract the questions and options while preserving the original Bangla language."
            elif language == "mixed":
                language_instruction = "Extract the questions and options, preserving both Bangla and English text as they appear."

            prompt = f"""Extract all questions and all their multiple choice options from 
            this exam content.
            
            {language_instruction}
            
            Format your response as strict JSON with this structure:
            {{
                "questions": [
                    {{
                        "text": "Question text",
                        "options": [
                            {{"text": "Option 1"}},
                            {{"text": "Option 2"}},
                            {{"text": "Option 3"}},
                            {{"text": "Option 4"}},
                            ...
                        ]
                    }},
                    ...
                ]
            }}
            
            Include ONLY the JSON in your response, with no additional text or markdown formatting.
            
            Content:
            {content_sample}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Debug the response
            print(
                f"Extract questions with options raw response: {response_text[:200]}..."
            )

            # Try to find JSON in the response (looking for { ... })
            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                questions_data = json.loads(json_str)
                return questions_data.get("questions", [])
            else:
                raise ValueError("Could not find valid JSON in the response")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            print(f"Response that couldn't be parsed: {response_text}")
            return []
        except Exception as e:
            print(f"Error extracting questions with options: {str(e)}")
            return []

    def generate_with_deepseek(self, prompt, max_retries=3):
        """Generate content using DeepSeek API"""
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 4000,
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    DEEPSEEK_API_URL, headers=headers, json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"DeepSeek API attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)  # Wait before retrying

    def post(self, request):

        exam_id = request.data.get("exam_id")

        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

        # Check if the exam is already processed
        if exam.answers_generated and exam.options_generated:
            return Response(
                {"message": "Options and answers are already generated for this exam"},
                status=status.HTTP_200_OK,
            )

        try:
            # Update exam status
            exam.processing_status = "processing"
            exam.save()

            # Extract text from the PDF/file
            file_path = exam.pdf_file.path
            exam_content = self.extract_text_from_file(file_path)

            if not exam_content or len(exam_content.strip()) < 10:
                exam.processing_status = "failed"
                exam.save()
                return Response(
                    {"error": "Could not extract sufficient content from the file"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Analyze the content to determine if it has options or answers and detect language
            content_format, language = self.analyze_questions(exam_content)
            print(f"Detected content format: {content_format}")
            print(f"Detected language: {language}")

            # Save language information to exam
            exam.language = language
            exam.save()

            # Initialize tracking variables
            questions_created = 0
            options_created = 0
            answers_generated = 0

            with transaction.atomic():
                # Extract questions from content if they don't exist yet
                if exam.questions.count() == 0:
                    # For formats with options, use special extraction method
                    if content_format in [
                        "questions_with_options",
                        "questions_with_options_answers",
                    ]:
                        questions_data = self.extract_questions_with_options(
                            exam_content, language
                        )

                        if not questions_data:
                            # Fall back to regular extraction
                            questions_data = self.extract_questions(
                                exam_content, language
                            )

                        if not questions_data:
                            raise ValueError(
                                "No questions could be extracted from the document"
                            )

                        for question_data in questions_data:
                            # Create question
                            question = Question.objects.create(
                                exam=exam,
                                question_text=question_data["text"],
                                has_options=True,
                            )
                            questions_created += 1

                            # If options are provided in the extracted data, create them
                            if "options" in question_data and question_data["options"]:
                                for option_data in question_data["options"]:
                                    Option.objects.create(
                                        question=question,
                                        option_text=option_data["text"],
                                        is_correct=False,  # Will identify correct answer later
                                        is_ai_generated=False,  # These are extracted, not AI-generated
                                    )
                                    options_created += 1
                    else:
                        # For non-option formats, use regular extraction
                        questions_data = self.extract_questions(exam_content, language)

                        if not questions_data:
                            raise ValueError(
                                "No questions could be extracted from the document"
                            )

                        for question_data in questions_data:
                            # Create question
                            Question.objects.create(
                                exam=exam,
                                question_text=question_data["text"],
                                has_options=False,
                            )
                            questions_created += 1

                # Handle each question based on content format
                questions = exam.questions.all()
                for question in questions:
                    # For each question, detect its specific language (as individual questions might vary)
                    question_language = (
                        self.detect_language(question.question_text)
                        if language == "mixed"
                        else language
                    )

                    # Case 1: If format is questions_only, generate both options and answers
                    if content_format == "questions_only":
                        options_data = self.generate_options_and_answers(
                            question.question_text,
                            exam.mcq_options_count,
                            question_language,
                        )

                        if options_data:
                            for option_data in options_data:
                                Option.objects.create(
                                    question=question,
                                    option_text=option_data["text"],
                                    is_correct=option_data["is_correct"],
                                    is_ai_generated=True,
                                )
                                options_created += 1

                            question.has_options = True
                            question.save()

                    # Case 2: If format is questions_with_answers, generate options that include
                    # the answer
                    elif content_format == "questions_with_answers":
                        options_data = self.generate_options_and_answers(
                            question.question_text,
                            exam.mcq_options_count,
                            question_language,
                        )

                        if options_data:
                            for option_data in options_data:
                                Option.objects.create(
                                    question=question,
                                    option_text=option_data["text"],
                                    is_correct=option_data["is_correct"],
                                    is_ai_generated=True,
                                )
                                options_created += 1

                            question.has_options = True
                            question.save()

                    # Case 3: If format is questions_with_options, ensure options are extracted
                    # and generate answers
                    elif content_format == "questions_with_options":
                        options = list(question.options.all())

                        # If no options exist yet, try to extract them directly for this question
                        if not options:
                            language_instruction = ""
                            if question_language == "bangla":
                                language_instruction = "Extract the options in Bangla language as they appear in the question."
                            elif question_language == "mixed":
                                language_instruction = "Extract the options preserving both Bangla and English text as they appear."

                            prompt = f"""Extract the multiple choice options for this question:
                            
                            Question: {question.question_text}
                            
                            {language_instruction}
                            
                            Format your response as strict JSON with this structure:
                            {{
                                "options": [
                                    {{"text": "Option 1"}},
                                    {{"text": "Option 2"}},
                                    {{"text": "Option 3"}},
                                    {{"text": "Option 4"}},
                                    ...
                                ]
                            }}
                            
                            Include ONLY the JSON in your response."""

                            try:
                                response = model.generate_content(prompt)
                                response_text = response.text.strip()

                                json_match = re.search(
                                    r"({.*})", response_text, re.DOTALL
                                )
                                if json_match:
                                    json_str = json_match.group(1)
                                    options_data = json.loads(json_str)

                                    # Create options in database
                                    for option_data in options_data.get("options", []):
                                        Option.objects.create(
                                            question=question,
                                            option_text=option_data["text"],
                                            is_correct=False,  # Will identify correct answer later
                                            is_ai_generated=False,
                                        )
                                        options_created += 1

                                    # Refresh options list
                                    options = list(question.options.all())
                                    question.has_options = True
                                    question.save()
                            except Exception as e:
                                print(
                                    f"Error extracting options for question: {str(e)}"
                                )

                        # Now identify correct answer for the options
                        if options and not any(opt.is_correct for opt in options):
                            # Use AI to identify the correct answer
                            options_list = [
                                {"option_text": opt.option_text} for opt in options
                            ]

                            correct_index = self.identify_correct_answers(
                                question.question_text,
                                options_list,
                            )

                            # Mark the correct option
                            if 0 <= correct_index < len(options):
                                options[correct_index].is_correct = True
                                options[correct_index].save()
                                answers_generated += 1

                        # If still no options, generate them along with answers
                        if not options:
                            print(
                                f"No options found or extracted for question '{question.question_text}', generating new ones"
                            )
                            options_data = self.generate_options_and_answers(
                                question.question_text,
                                exam.mcq_options_count,
                                question_language,
                            )

                            if options_data:
                                for option_data in options_data:
                                    Option.objects.create(
                                        question=question,
                                        option_text=option_data["text"],
                                        is_correct=option_data["is_correct"],
                                        is_ai_generated=True,
                                    )
                                    options_created += 1
                                    if option_data["is_correct"]:
                                        answers_generated += 1

                                question.has_options = True
                                question.save()

                    # Case 4: If format is questions_with_options_answers, just save what's
                    # already there
                    elif content_format == "questions_with_options_answers":
                        # Double check that options and correct answers are properly saved
                        options = list(question.options.all())
                        if options and not any(opt.is_correct for opt in options):
                            correct_index = self.identify_correct_answers(
                                question.question_text,
                                [{"option_text": opt.option_text} for opt in options],
                            )
                            if 0 <= correct_index < len(options):
                                options[correct_index].is_correct = True
                                options[correct_index].save()
                                answers_generated += 1

                # Generate output PDF with questions and answers
                output_pdf_path = self.generate_output_pdf(exam, questions)

                # Update exam statistics and status
                exam.question_count = questions.count()
                exam.processing_status = "Generated"
                exam.is_processed = True
                exam.options_generated = True
                exam.answers_generated = True
                exam.output_pdf = output_pdf_path
                exam.save()

            return Response(
                {
                    "message": "Successfully processed exam content",
                    "content_format": content_format,
                    "language": language,
                    "stats": {
                        "questions_processed": questions.count(),
                        "questions_created": questions_created,
                        "options_created": options_created,
                        "answers_generated": answers_generated,
                        "output_pdf": output_pdf_path,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # Update exam status to failed
            exam.processing_status = "failed"
            exam.save()

            return Response(
                {"error": f"Error processing exam content: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteExamView(APIView):
    """View to delete an exam"""

    permission_classes = [IsAuthenticated]

    def delete(self, request, exam_id):
        try:
            # Get the exam and verify ownership
            exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

            # Delete associated files
            if exam.pdf_file:
                if os.path.exists(exam.pdf_file.path):
                    os.remove(exam.pdf_file.path)

            if exam.output_pdf:
                if os.path.exists(exam.output_pdf.path):
                    os.remove(exam.output_pdf.path)

            # Delete the exam (this will cascade delete related questions and options)
            exam.delete()

            return Response(
                {"message": "Exam deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except Exam.DoesNotExist:
            return Response(
                {"error": "Exam not found or you don't have permission to delete it"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": f"Error deleting exam: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
