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
import openai
from django.conf import settings
import PyPDF2
from datetime import datetime
import pytz
import os
import json
import re

openai.api_key = settings.OPENAI_API_KEY
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


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

    def analyze_questions(self, exam_content):
        """Analyze the exam content to determine if it contains options or answers"""
        try:
            # Limit content length but ensure we have enough context
            content_sample = exam_content[:5000]

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

            if "questions_with_options_answers" in analysis:
                return "questions_with_options_answers"
            elif "questions_with_options" in analysis:
                return "questions_with_options"
            elif "questions_with_answers" in analysis:
                return "questions_with_answers"
            else:
                return "questions_only"

        except Exception as e:
            print(f"Error analyzing questions: {str(e)}")
            return "questions_only"

    def extract_questions(self, exam_content):
        """Extract questions using Gemini with robust error handling"""
        try:
            # Limit content but take enough to capture multiple questions
            content_sample = exam_content[:7000]

            prompt = f"""Extract all questions from this exam content.
            
            The questions might be numbered or bulleted. Randomize the serials of questions.
            Try to identify each distinct question.
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

    def generate_options_and_answers(self, question_text, options_count):
        """Generate options using Gemini with improved prompt for reliable JSON"""
        try:
            prompt = f"""Create exactly {options_count} multiple choice options for 
            this question with one correct answer. Randomize the correct options or 
            answer.
            
            Question: {question_text}

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

    def identify_correct_answers(self, question_text, options):
        """Identify correct answer using Gemini with improved reliability"""
        try:
            if not options:
                print("No options provided to identify_correct_answers")
                return 0

            # Format options for the prompt
            options_text = "\n".join(
                [f"{idx+1}. {opt['option_text']}" for idx, opt in enumerate(options)]
            )

            prompt = f"""Question: {question_text}

            Options:
            {options_text}

            Based on your knowledge, which option number contains the correct answer?
            Respond with ONLY the number (1, 2, 3, etc.) of the correct option.
            Do not include any explanation or additional text in your response."""

            response = model.generate_content(prompt)
            answer_text = response.text.strip()

            print(f"Correct answer identification response: {answer_text}")

            # Extract the number
            match = re.search(r"\d+", answer_text)
            if match:
                correct_index = int(match.group()) - 1
                if 0 <= correct_index < len(options):
                    return correct_index
                else:
                    print(f"Index {correct_index} out of range (0-{len(options)-1})")
                    return 0

            # Alternate approach using likelihood scores from the model
            scores = []

            for idx, opt in enumerate(options):
                try:
                    alt_prompt = f"""Question: {question_text}
                    Is this answer correct? {opt['option_text']}
                    Respond with only 'yes' or 'no'."""

                    resp = model.generate_content(alt_prompt)
                    resp_text = resp.text.strip().lower()

                    if "yes" in resp_text:
                        scores.append((idx, 1.0))
                    elif "no" in resp_text:
                        scores.append((idx, 0.0))
                    else:
                        scores.append((idx, 0.5))  # Uncertain
                except Exception:
                    scores.append((idx, 0.5))  # Default to uncertain on error

            # Sort by confidence score
            scores.sort(key=lambda x: x[1], reverse=True)

            if scores:
                return scores[0][0]  # Return index with highest score

            # Default to first option if all methods fail
            print("All methods failed, defaulting to first option")
            return 0

        except Exception as e:
            print(f"Error identifying correct answer: {str(e)}")
            return 0

    def generate_output_pdf(self, exam, questions):
        """Generate a formatted PDF with questions and answers based on content format"""
        try:
            # Create output directory if it doesn't exist
            output_dir = os.path.join(settings.MEDIA_ROOT, "exam_outputs")
            os.makedirs(output_dir, exist_ok=True)

            # Generate output filename
            output_filename = f"exam_{exam.id}_processed_{int(time.time())}.pdf"
            output_path = os.path.join(output_dir, output_filename)

            # Create PDF document
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            styles = getSampleStyleSheet()

            # Define custom styles
            title_style = ParagraphStyle(
                "Title",
                parent=styles["Heading1"],
                fontSize=16,
                alignment=1,  # Center alignment
            )

            question_style = ParagraphStyle(
                "Question",
                parent=styles["Normal"],
                fontSize=12,
                fontName="Helvetica-Bold",
            )

            option_style = ParagraphStyle(
                "Option", parent=styles["Normal"], fontSize=11, leftIndent=20
            )

            correct_style = ParagraphStyle(
                "CorrectOption", parent=option_style, textColor=colors.green
            )

            answer_style = ParagraphStyle(
                "Answer",
                parent=styles["Normal"],
                fontSize=11,
                textColor=colors.blue,
                leftIndent=20,
                fontName="Helvetica-Bold",
            )

            # Build content
            content = []

            # Add title
            content.append(Paragraph(f"Exam: {exam.title}", title_style))
            content.append(Spacer(1, 12))

            # Add exam format info
            format_text = f"Format: {'Multiple Choice Exam' if exam.questions.first().has_options else 'Question and Answer Exam'}"
            content.append(Paragraph(format_text, styles["Normal"]))
            content.append(Spacer(1, 12))

            # Add questions and options
            for i, question in enumerate(questions, 1):
                # Question text
                content.append(
                    Paragraph(f"Q{i}. {question.question_text}", question_style)
                )
                content.append(Spacer(1, 6))

                # Handle options if they exist
                options = question.options.all()
                if options.exists():
                    for j, option in enumerate(options, 1):
                        option_text = f"{chr(64+j)}. {option.option_text}"
                        if option.is_correct:
                            content.append(Paragraph(f"{option_text} ✓", correct_style))
                        else:
                            content.append(Paragraph(option_text, option_style))

                # Add a space after each question
                content.append(Spacer(1, 12))

            # Add footer with generation info
            generation_time = datetime.now(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S GMT")
            content.append(
                Paragraph(f"Generated on: {generation_time}", styles["Normal"])
            )
            content.append(
                Paragraph(f"Total Questions: {questions.count()}", styles["Normal"])
            )

            # Build PDF
            doc.build(content)

            # Return relative path for database storage
            relative_path = f"exam_outputs/{output_filename}"

            return relative_path

        except Exception as e:
            print(f"Error generating output PDF: {str(e)}")
            return None

    def extract_questions_with_options(self, exam_content):
        """Extract questions and their options using Gemini"""
        try:
            # Limit content but take enough to capture multiple questions with options
            content_sample = exam_content[:10000]

            prompt = f"""Extract all questions and all their multiple choice options from 
            this exam content.
            
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

            # Analyze the content to determine if it has options or answers
            content_format = self.analyze_questions(exam_content)
            print(f"Detected content format: {content_format}")

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
                            exam_content
                        )

                        if not questions_data:
                            # Fall back to regular extraction
                            questions_data = self.extract_questions(exam_content)

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
                        questions_data = self.extract_questions(exam_content)

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
                    # Case 1: If format is questions_only, generate both options and answers --ok
                    if content_format == "questions_only":
                        options_data = self.generate_options_and_answers(
                            question.question_text, exam.mcq_options_count
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
                    # the answer --ok
                    elif content_format == "questions_with_answers":
                        options_data = self.generate_options_and_answers(
                            question.question_text, exam.mcq_options_count
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
                    # and generate answers --ok
                    elif content_format == "questions_with_options":
                        options = list(question.options.all())

                        # If no options exist yet, try to extract them directly for this question
                        if not options:
                            prompt = f"""Extract the multiple choice options for this question:
                            
                            Question: {question.question_text}
                            
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
                                question.question_text, exam.mcq_options_count
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
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exam.DoesNotExist:
            return Response(
                {"error": "Exam not found or you don't have permission to delete it"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error deleting exam: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )