<div align="center">
<h1>AiExaminer</h1>  
<p>An innovative platform leveraging artificial intelligence to automate exam creation and analysis.</p>
</div> 


## 📑 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
- [Configuration](#configuration)
- [Code Examples](#code-examples)
- [Contributing](#contributing)

## 🔍 Project Overview
AI Examiner is an innovative platform that leverages artificial intelligence to automate the exam creation process. Educators can upload course materials (PDFs or text files), and the system automatically generates questions, multiple-choice options, and correct answers using DeepSeek AI. The platform also provides comprehensive analytics on exam performance and student learning patterns.

## ✨ Key Features

### ✅ AI-Powered Exam Generation
- Automatically detects question formats (questions only, with options, with answers, or both)
- Generates high-quality multiple-choice options
- Generates Ai insight about the examinee
- Identifies and marks correct answers

### 📊 Comprehensive Analytics
- Detailed exam statistics and performance metrics
- AI-generated improvement suggestions

### 🔒 Secure & Reliable
- JWT authentication
- Password reset and change functionality
- Firebase social authentication
- Data encryption

## For Authentication details:
   ```
     https://github.com/AHMED-SAFA/Complete-Auth.git
   ```

## 🛠️ Technology Stack

### Backend
- Django REST Framework
- PostgreSQL database: Powerful relational database integration via psycopg2 with Django ORM support.
- JWT Authentication: Secure token-based authentication using djangorestframework-simplejwt.
- Firebase Social Authentication
- ReportLab for PDF generation: Generate professional-grade PDF documents using ReportLab and PyPDF2.
- Rich file processing support with Python-Magic, PyMuPDF, and reportlab.
- Django REST Framework (DRF): Robust API development with built-in serialization, authentication, and viewsets.


### AI Integration
- DeepSeek API for question/answer generation.
- Gemini API for generating exam insights.
- Advanced NLP processing

## ⚙️ Installation

### Prerequisites
- Python 3.9+
- PostgreSQL 12+


## 🔧 Configuration

# settings.py
```python

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=2),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
}


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"    # Replace with your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")

# Custom user model
AUTH_USER_MODEL = "auth_app.User"

# Password reset link expiration (10 minutes)
PASSWORD_RESET_TIMEOUT = 600
```

## 💻 Code Examples

### Create Exam View:

```python
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
```


### PDF Generation
```python
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
            alignment=1,
        )

        # Build content
        content = []
        # Add title and questions with options
        # ... (content building)
        
        # Build PDF
        doc.build(content)
        return f"exam_outputs/{output_filename}"

    except Exception as e:
        print(f"Error generating output PDF: {str(e)}")
        return None
```



## AI Model Integration

### ✅ AI-Powered Exam Generation (DeepSeek)

- Leverages DeepSeek API to generate high-quality MCQ questions and answers:
- Analyzes the given PDF or TEXT file.
- Detects Bangla, English, or Mixed language in the file.
- Auto-generates plausible options.
- Identifies and marks correct answers.

```python
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
```
## AI-Powered Answer/Option Generation

```python
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

        # Process JSON response and return options
        json_match = re.search(r"({.*})", response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            options_data = json.loads(json_str)
            return options_data.get("options", [])
        else:
            raise ValueError("Could not find valid JSON in the response")

    except Exception as e:
        print(f"Error generating options: {str(e)}")
        return []
```

## AI-Driven Performance Suggestions (Gemini):

Uses Google's Gemini 1.5 Flash model to analyze exam performance and suggest actionable improvements.

Prompt dynamically adapts based on:

- Avg. correct, wrong, and unanswered answers
- Question-wise stats (difficulty, attempts)
- Time distribution patterns
- Completion rates and scores

```python
import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

response = model.generate_content(prompt)
suggestions = response.text

```

```python
class GenerateAISuggestions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam_id = request.data.get("examId")
        stats = request.data.get("stats", {})

        if not exam_id or not stats or not stats.get("sessions_count"):
            return Response({"error": "Invalid or insufficient data"}, status=400)

        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)

        prompt = f"""
        Analyze the following exam data and provide 3–5 concise improvement suggestions.

        Title: {stats.get('title')}
        Avg. Score: {stats.get('average_score')}%
        Completion Rate: {stats.get('completion_rate')}%
        Correct: {stats.get('average_correct')}, Wrong: {stats.get('average_wrong')}, Unanswered: {stats.get('average_unanswered')}
        """

        try:
            response = model.generate_content(prompt)
            return Response({"suggestions": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

```

![ai insight](https://github.com/user-attachments/assets/49fc7a71-7c0e-4167-8c68-3d48ce7a2bb5)



## 📈 Statistics


### 1. Bar Charts
- Compares average scores and attempts across different exams
- Visualizes when students complete the exam

![image](https://github.com/user-attachments/assets/052178da-bee4-4cc8-afb1-8eccaf6615cf)


### 2. Line Charts
- Alternative view for comparing exam metrics over time

### 3. Pie Charts
- Shows breakdown of correct, wrong, and unanswered questions

![image](https://github.com/user-attachments/assets/cf981d09-0df8-4378-84bc-00e8ddf45a7f)

  
### 4. Radar Charts
- Advanced analytics showing multiple performance metrics in a spider/radar format

![image](https://github.com/user-attachments/assets/86dd56fe-6edb-4658-850f-bcfbb23402db)


## ⚙️ Backend Installation


1. Clone the repository:
   ```
   git clone https://github.com/AHMED-SAFA/AiExaminer.git
   ```
2. Navigate to the project directory: 
   ```
    cd AiExaminer/backend
   ```
3. Create and activate virtual environment
   ````
    python -m venv venv
    source venv/Scripts/activate
    venv\Scripts\activate  - On Windows
   ```
4. Install dependencies
   ```
    pip install -r requirements.txt
   ```
5. Set up environment variables
   ```
    cp .env.example .env
   ```
6. Run migrations
   ```
    py manage.py makemigrations
    py manage.py migrate
   ```
8. Create superuser
   ```
    py manage.py createsuperuser
   ```
9. Run development server
   ```
    py manage.py runserver
   ```


### Contributing

Contributions are welcome! If you have suggestions for improving this project, feel free to fork the repository and submit a pull request.
