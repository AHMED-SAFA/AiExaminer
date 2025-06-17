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
from .serializers import ExamCreateSerializer, ExamDetailSerializer
from rest_framework.views import APIView
from django.conf import settings
from datetime import datetime
from .supabase_client import SupabaseStorage
import tempfile
import requests
import pytz
import PyPDF2
import os
import json
import re
import html

GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class CreateExamView(APIView):
    """Simple view to create an exam"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExamCreateSerializer(data=request.data)
        if serializer.is_valid():
            exam = serializer.save(created_by=request.user)
            print(f"Exam created: {exam.title} by {request.user.username}") 
            return Response(
                {
                    "status": "Exam created successfully",
                    "exam_id": exam.id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserExamListView(generics.ListAPIView):
    """View to list all exams for the authenticated user"""
    permission_classes = [IsAuthenticated]
    serializer_class = ExamDetailSerializer

    def get_queryset(self):
        return Exam.objects.filter(created_by=self.request.user).order_by("-created_at")


class GenerateAnswerOptionsView(APIView):
    """View to generate options and answers for exam questions"""
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
            print(f"Extracted texts: {text[:10]}")

            return text
        except Exception as e:
            print(f"PDF extraction error: {str(e)}")
            raise

    def extract_text_from_file(self, exam):
        """Extract text from a file stored in Supabase"""
        try:
            storage = SupabaseStorage()
            file_content = storage.download_file(
                bucket_name=settings.SUPABASE_INPUT_PDF_BUCKET,
                file_path=exam.pdf_file_path
            )
            
            if not file_content:
                raise ValueError("Could not download file from Supabase")
            
            file_ext = os.path.splitext(exam.pdf_file_name)[1].lower()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            try:
                if file_ext == ".pdf":
                    with open(temp_path, "rb") as file:
                        return self.extract_text_from_pdf(file)
                elif file_ext == ".txt":
                    with open(temp_path, "r", encoding="utf-8") as file:
                        return file.read()
                else:
                    raise ValueError(f"Unsupported file format: {file_ext}")
            finally:
                os.unlink(temp_path)
                
        except Exception as e:
            print(f"Error extracting text from Supabase file: {str(e)}")
            raise

    def analyze_questions(self, exam_content):
        """Analyze the exam content to determine its format"""
        try:
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

            response = self.generate_with_groq(prompt)
            analysis = response.strip().lower()

            if "questions_with_options_answers" in analysis:
                return "questions_with_options_answers"
            elif "questions_with_options" in analysis:
                return "questions_with_options"
            elif "questions_with_answers" in analysis:
                return "questions_with_answers"
            else:
                return "questions_only"

        except Exception as e:
            return "questions_only"

    def extract_questions(self, exam_content):
        """Extract questions using Groq API"""
        try:
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

            response = self.generate_with_groq(prompt)
            response_text = response.strip()

            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            print(f"Response texts from extract questions: {json_match}")

            if json_match:
                json_str = json_match.group(1)
                questions_data = json.loads(json_str)
                return questions_data.get("questions", [])
            else:
                raise ValueError("Could not find valid JSON in the response")

        except json.JSONDecodeError:
            return self.fallback_question_extraction(response_text)
        except Exception:
            return []

    def generate_options_and_answers(self, question_text, options_count):
        """Generate options using Groq API"""
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

            response = self.generate_with_groq(prompt)
            response_text = response.strip()
            print(f"response texts from generate options answer {response_text}")

            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                options_data = json.loads(json_str)

                options = options_data.get("options", [])
                if len(options) != options_count:
                    print(f"Warning: Expected {options_count} options but got {len(options)}")

                correct_count = sum(1 for opt in options if opt.get("is_correct"))
                if correct_count != 1:
                    print(f"Warning: Expected 1 correct option but got {correct_count}")
                    # Fix: ensure exactly one correct answer
                    if correct_count == 0 and options:
                        options[0]["is_correct"] = True
                    elif correct_count > 1:
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

    def extract_questions_with_options(self, exam_content):
        """Extract questions and their options using Groq API"""
        try:
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

            response = self.generate_with_groq(prompt)
            response_text = response.strip()

            json_match = re.search(r"({.*})", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                questions_data = json.loads(json_str)
                return questions_data.get("questions", [])
            else:
                raise ValueError("Could not find valid JSON in the response")

        except Exception as e:
            print(f"Error extracting questions with options: {str(e)}")
            return []

    def identify_correct_answers(self, question_text, options_list):
        """Identify the correct answer from options using Groq API"""
        try:
            options_text = "\n".join(
                [f"{i+1}. {opt['option_text']}" for i, opt in enumerate(options_list)]
            )

            prompt = f"""Given this question and options, identify which option is correct.
            
            Question: {question_text}
            
            Options:
            {options_text}
            
            Respond with only the number (1, 2, 3, etc.) of the correct option."""

            response = self.generate_with_groq(prompt)
            correct_number = int(response.strip())
            return correct_number - 1

        except Exception as e:
            print(f"Error identifying correct answer: {str(e)}")
            return 0

    def fallback_question_extraction(self, text):
        """Extract questions manually if JSON parsing fails"""
        try:
            questions = []
            numbered_questions = re.findall(r"\d+\.\s*([^\n]+\?)", text)
            question_marks = re.findall(r"([^.!?\n]+\?)", text)
            
            all_questions = set(numbered_questions + question_marks)
            return [{"text": q.strip()} for q in all_questions if len(q.strip()) > 10]
        except Exception as e:
            print(f"Fallback extraction failed: {str(e)}")
            return []

    def clean_text_for_pdf(self, text):
        """Clean and prepare text for PDF generation"""
        if not text:
            return ""

        text = html.unescape(text)
        text = " ".join(text.split())
        
        # Handle special characters
        text = text.replace("\u2019", "'")
        text = text.replace("\u201c", '"')
        text = text.replace("\u201d", '"')
        text = text.replace("\u2013", "-")
        text = text.replace("\u2014", "--")

        return text

    def generate_output_pdf(self, exam, questions):
        """Generate a formatted PDF with questions and answers"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_path = temp_file.name
            
            doc = SimpleDocTemplate(
                temp_path,
                pagesize=letter,
                leftMargin=50,
                rightMargin=50,
                topMargin=50,
                bottomMargin=50,
            )

            # Define styles
            styles = getSampleStyleSheet()
            
            title_style = ParagraphStyle(
                "TitleStyle",
                parent=styles['Title'],
                fontSize=16,
                alignment=1,
                spaceAfter=12,
                textColor=colors.black,
            )

            question_style = ParagraphStyle(
                "QuestionStyle",
                parent=styles['Normal'],
                fontSize=12,
                fontName="Helvetica-Bold",
                leading=16,
                spaceAfter=8,
                textColor=colors.black,
            )

            option_style = ParagraphStyle(
                "OptionStyle",
                parent=styles['Normal'],
                fontSize=11,
                leftIndent=20,
                leading=14,
                spaceAfter=4,
                textColor=colors.black,
            )

            correct_option_style = ParagraphStyle(
                "CorrectOptionStyle",
                parent=option_style,
                fontName="Helvetica-Bold",
                textColor=colors.green,
            )

            info_style = ParagraphStyle(
                "InfoStyle",
                parent=styles['Normal'],
                fontSize=10,
                leading=12,
                textColor=colors.blue,
            )

            # Build content
            content = []

            # Add title
            title_text = f"Exam: {exam.title}"
            title_text = self.clean_text_for_pdf(title_text)
            content.append(Paragraph(title_text, title_style))
            content.append(Spacer(1, 12))

            # Add exam format info
            has_options = questions.first().has_options if questions.exists() else False
            format_text = "Format: Multiple Choice Questions" if has_options else "Format: Question and Answer"
            format_text = self.clean_text_for_pdf(format_text)
            content.append(Paragraph(format_text, info_style))
            content.append(Spacer(1, 12))

            # Add questions and options
            for i, question in enumerate(questions, 1):
                clean_question_text = self.clean_text_for_pdf(question.question_text)
                question_text = f"Q{i}. {clean_question_text}"

                content.append(Paragraph(question_text, question_style))
                content.append(Spacer(1, 8))

                # Handle options if they exist
                options = question.options.all()
                if options.exists():
                    for j, option in enumerate(options, 1):
                        clean_option_text = self.clean_text_for_pdf(option.option_text)
                        option_text = f"{chr(64+j)}. {clean_option_text}"

                        if option.is_correct:
                            option_text = f"{option_text} ✓"
                            content.append(Paragraph(option_text, correct_option_style))
                        else:
                            content.append(Paragraph(option_text, option_style))

                content.append(Spacer(1, 15))

            # Add footer
            generation_time = datetime.now(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S UTC")
            footer_text = f"Generated on: {generation_time}"
            total_q_text = f"Total Questions: {questions.count()}"

            footer_text = self.clean_text_for_pdf(footer_text)
            total_q_text = self.clean_text_for_pdf(total_q_text)

            content.append(Spacer(1, 20))
            content.append(Paragraph(footer_text, info_style))
            content.append(Paragraph(total_q_text, info_style))

            # Build PDF
            doc.build(content)

            # Upload to Supabase
            storage = SupabaseStorage()
            output_filename = f"exam_{exam.id}_processed_{int(time.time())}.pdf"

            with open(temp_path, 'rb') as pdf_file:
                result = storage.upload_file(
                    file=pdf_file,
                    bucket_name=settings.SUPABASE_OUTPUT_PDF_BUCKET,
                    file_path=output_filename
                )
        
            # Clean up temporary file
            os.unlink(temp_path)
            
            if result:
                exam.output_pdf_url = result['url']
                exam.output_pdf_path = result['path']
                exam.output_pdf_name = output_filename
                exam.save()
                return result['url']
            else:
                return None

        except Exception as e:
            print(f"Error generating output PDF: {str(e)}")
            return None

    def generate_with_groq(self, prompt, max_retries=3):
        """Generate content using Groq API"""
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": False,
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(GROQ_API_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                print(data)
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Groq API attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)

    def post(self, request):
        exam_id = request.data.get("exam_id")

        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

        if exam.answers_generated and exam.options_generated:
            return Response(
                {"message": "Options and answers are already generated for this exam"},
                status=status.HTTP_200_OK,
            )

        try:
            exam.processing_status = "processing"
            exam.save()

            # Extract text from file
            exam_content = self.extract_text_from_file(exam)

            if not exam_content or len(exam_content.strip()) < 10:
                exam.processing_status = "failed"
                exam.save()
                return Response(
                    {"error": "Could not extract sufficient content from the file"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Analyze content format
            content_format = self.analyze_questions(exam_content)

            questions_created = 0
            options_created = 0
            answers_generated = 0

            with transaction.atomic():
                # Extract questions if they don't exist
                if exam.questions.count() == 0:
                    if content_format in ["questions_with_options", "questions_with_options_answers"]:
                        questions_data = self.extract_questions_with_options(exam_content)
                        if not questions_data:
                            questions_data = self.extract_questions(exam_content)
                    else:
                        questions_data = self.extract_questions(exam_content)

                    if not questions_data:
                        raise ValueError("No questions could be extracted from the document")

                    for question_data in questions_data:
                        has_options = content_format in ["questions_with_options", "questions_with_options_answers"]
                        question = Question.objects.create(
                            exam=exam,
                            question_text=question_data["text"],
                            has_options=has_options,
                        )
                        questions_created += 1

                        # Create options if provided
                        if "options" in question_data and question_data["options"]:
                            for option_data in question_data["options"]:
                                Option.objects.create(
                                    question=question,
                                    option_text=option_data["text"],
                                    is_correct=False,
                                    is_ai_generated=False,
                                )
                                options_created += 1

                # Process each question based on format
                questions = exam.questions.all()
                for question in questions:
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
                                if option_data["is_correct"]:
                                    answers_generated += 1

                            question.has_options = True
                            question.save()

                    elif content_format in ["questions_with_answers", "questions_with_options"]:
                        options = list(question.options.all())
                        
                        # Generate options if none exist
                        if not options:
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
                        else:
                            # Identify correct answers for existing options
                            if not any(opt.is_correct for opt in options):
                                options_list = [{"option_text": opt.option_text} for opt in options]
                                correct_index = self.identify_correct_answers(
                                    question.question_text, options_list
                                )
                                
                                if 0 <= correct_index < len(options):
                                    options[correct_index].is_correct = True
                                    options[correct_index].save()
                                    answers_generated += 1

                    elif content_format == "questions_with_options_answers":
                        # Verify correct answers are marked
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

                # Generate output PDF
                output_pdf_path = self.generate_output_pdf(exam, questions)

                # Update exam status
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
            exam = get_object_or_404(Exam, pk=exam_id, created_by=request.user)

            # Delete files from Supabase
            # storage = SupabaseStorage()
            
            # if exam.pdf_file_path:
            #     storage.delete_file(settings.SUPABASE_INPUT_PDF_BUCKET, exam.pdf_file_path)
            
            # if exam.output_pdf_path:
            #     storage.delete_file(settings.SUPABASE_OUTPUT_PDF_BUCKET, exam.output_pdf_path)

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