<div align="center">
<h1>AiExaminer</h1>
<p>An innovative platform leveraging artificial intelligence to automate exam creation and analysis.</p>
</div>

<div align="center">

https://github.com/user-attachments/assets/3ac7b57c-f5fa-4f35-b089-e729bbda033e

</div>

---

## 🔍 Project Overview

AI Examiner is an innovative platform that leverages artificial intelligence to automate the exam creation process. Educators can upload course materials (PDFs or text files), and the system automatically generates questions, multiple-choice options, and correct answers using **GROQ**. The platform also provides comprehensive analytics on exam performance and student learning patterns.

## For Authentication details:
```
https://github.com/AHMED-SAFA/Complete-Auth.git
```

---

## ✨ Key Features

### ✅ AI-Powered Exam Generation
- Automatically detects question formats (questions only, with options, with answers, or both)
- Generates high-quality multiple-choice options
- Generates AI insight about the examinee
- Identifies and marks correct answers

### 📊 Comprehensive Analytics
- Detailed exam statistics and performance metrics
- AI-generated improvement suggestions

### 🔒 Secure & Reliable
- JWT authentication
- Password reset and change functionality
- Firebase social authentication
- Data encryption

### 🖥️ User-Friendly Interface
- Clean, modern, and responsive UI built with Tailwind CSS and Material-UI components
- Framer Motion integration for seamless page transitions and interactive animations
- Interactive charts and graphs powered by Chart.js and Recharts
- Optimized layout that adapts across mobile, tablet, and desktop screens

---

## 🛠️ Technology Stack

### Backend
- **Django REST Framework**: Robust API development with built-in serialization, authentication, and viewsets.
- **PostgreSQL**: Powerful relational database integration via psycopg2 with Django ORM support.
- **JWT Authentication**: Secure token-based authentication using djangorestframework-simplejwt.
- **Firebase Social Authentication**
- **ReportLab**: Generate professional-grade PDF documents using ReportLab and PyPDF2.
- Rich file processing support with Python-Magic, PyMuPDF, and reportlab.

### Storage
- **PostgreSQL** database: Primary relational database.
- **NeonDB**: For deploying the PostgreSQL database.
- **Cloudinary**: To store user profile images.
- **Supabase**: To store input exam PDFs and output AI-generated PDFs.

### AI Integration
- **GROQ API**: For LLM-based questions/options/answer generation.
- **Gemini API**: For generating exam AI insights & analytics.
- Advanced NLP processing

<div align="center">
<h1>Frontend</h1>
</div>

### Frontend

- [React.js](https://reactjs.org/) – JavaScript library for building user interfaces
- [Redux](https://redux.js.org/) – State management for predictable state updates
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for styling
- [Chart.js](https://www.chartjs.org/) – Flexible JavaScript charting
- [Recharts](https://recharts.org/en-US/) – Chart library built with React and D3
- [Material-UI (MUI)](https://mui.com/) – React UI framework with prebuilt components
- [Lucide React](https://lucide.dev/) – Icon library for React
- [Framer Motion](https://www.framer.com/motion/) – Animation library for React
- [Axios](https://axios-http.com/) – Promise-based HTTP client for API calls

---

## Screenshots

<div align="center">

<details>
<summary><strong>Login Page</strong></summary>
<br>

![login](https://github.com/user-attachments/assets/a78f13a0-ecb9-4ccf-9ae3-8c11cd7ee42f)
</details>

<details>
<summary><strong>Register Page</strong></summary>
<br>

![reg](https://github.com/user-attachments/assets/dc4c2292-59fc-42d7-a0f2-54670dd94a3b)
</details>

<details>
<summary><strong>Home Page</strong></summary>
<br>

![home1](https://github.com/user-attachments/assets/6ce07c7b-90d1-4622-b4be-0672fc77a202)
</details>

<details>
<summary><strong>Profile Page</strong></summary>
<br>

![profile](https://github.com/user-attachments/assets/1743a895-3b97-4985-96a3-20a3293f4692)
</details>

<details>
<summary><strong>Create Exam</strong></summary>
<br>

![create_exam](https://github.com/user-attachments/assets/3f730b2d-0039-4c07-832d-27bf2117a0a6)

![create_exam2](https://github.com/user-attachments/assets/b3784c99-58fc-4d2b-825b-2fe2d4a938c1)
</details>

<details>
<summary><strong>Start Exam</strong></summary>
<br>

![start1](https://github.com/user-attachments/assets/6aa71a1b-477c-4a47-b6b1-986ae409cdfe)

![start2](https://github.com/user-attachments/assets/be516012-4fbd-433e-841c-362fa56f57af)
</details>

<details>
<summary><strong>Previous Exam with Details</strong></summary>
<br>

![prev1](https://github.com/user-attachments/assets/e6fa15c4-6d73-4753-a171-ee3c6928b252)

![prev2](https://github.com/user-attachments/assets/9c215c5b-4853-445e-912e-7e20945caa5a)

<details>
<summary><strong>Generated Options/Answers PDF</strong></summary>
<br>

![prev3](https://github.com/user-attachments/assets/4d4784e3-7ad5-4f9d-ac9d-e81e34607bf1)
</details>

</details>

<details>
<summary><strong>Exam Statistics</strong></summary>
<br>

![stat3](https://github.com/user-attachments/assets/3e331158-729c-4675-bf86-338c17d8c43c)

<details>
<summary><strong>Specific Exam Detail Statistics</strong></summary>
<br>

![stat1](https://github.com/user-attachments/assets/b648736b-4d98-42db-8493-72b571bdde84)

![stat2](https://github.com/user-attachments/assets/12faee35-7ec1-47d9-92e5-f2800105dbac)
</details>

</details>

</div>

---

<div align="center">
<h1>Backend</h1>
</div>

### 🔧 Configuration

```python
# settings.py

GEMINI_API_KEY = env("GEMINI_API_KEY")
GROQ_API_KEY = env("GROQ_API_KEY")
SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG")

# Cloudinary configuration
cloudinary.config(
    cloud_name = env('CLOUDINARY_CLOUD_NAME'),
    api_key = env('CLOUDINARY_API_KEY'),
    api_secret = env('CLOUDINARY_API_SECRET'),
    secure = True
)

# Supabase connect
SUPABASE_URL = env("SUPABASE_URL")
SUPABASE_KEY = env("SUPABASE_KEY")
SUPABASE_INPUT_PDF_BUCKET = env("SUPABASE_INPUT_PDF_BUCKET")
SUPABASE_OUTPUT_PDF_BUCKET = env("SUPABASE_OUTPUT_PDF_BUCKET")

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

### Database

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env("PGDB_NAME"),
        'USER': env("PGDB_USER"),
        'PASSWORD': env("PGDB_PASSWORD"),
        'HOST': env("PGDB_HOST"),
        'PORT': 5432,
        "OPTIONS": {
            "sslmode": "require",
        }
    }
}
```

---

### 💻 Code Examples

#### Create Exam View

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

#### PDF Generation

```python
def generate_output_pdf(self, exam, questions):
    """Generate a formatted PDF with questions and answers based on content format"""
    try:
        output_dir = os.path.join(settings.MEDIA_ROOT, "exam_outputs")
        os.makedirs(output_dir, exist_ok=True)

        output_filename = f"exam_{exam.id}_processed_{int(time.time())}.pdf"
        output_path = os.path.join(output_dir, output_filename)

        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            fontSize=16,
            alignment=1,
        )

        content = []
        # Add title and questions with options
        # ... (content building)

        doc.build(content)
        return f"exam_outputs/{output_filename}"

    except Exception as e:
        print(f"Error generating output PDF: {str(e)}")
        return None
```

---

### AI Model Integration

#### ✅ AI-Powered Exam Generation (GROQ)

Leverages **GROQ API** to generate high-quality MCQ questions and answers by analyzing the given PDF or TEXT file, auto-generating plausible options, and identifying correct answers.

```python
GEMINI_API_KEY = env("GEMINI_API_KEY")
GROQ_API_KEY = env("GROQ_API_KEY")
```

#### AI-Powered Answer/Option Generation

```python
def generate_options_and_answers(self, question_text, options_count, language):
    """Generate options using Gemini with improved prompt for reliable JSON and language support"""
    try:
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

#### AI-Driven Performance Suggestions (Gemini)

Uses Google's Gemini 1.5 Flash model to analyze exam performance and suggest actionable improvements. Prompt dynamically adapts based on avg. correct/wrong/unanswered answers, question-wise stats, time distribution patterns, and completion rates.

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

---

### 📈 Statistics

#### 1. Bar Charts
- Compares average scores and attempts across different exams
- Visualizes when students complete the exam

![image](https://github.com/user-attachments/assets/052178da-bee4-4cc8-afb1-8eccaf6615cf)

#### 2. Line Charts
- Alternative view for comparing exam metrics over time

#### 3. Pie Charts
- Shows breakdown of correct, wrong, and unanswered questions

![image](https://github.com/user-attachments/assets/cf981d09-0df8-4378-84bc-00e8ddf45a7f)

#### 4. Radar Charts
- Advanced analytics showing multiple performance metrics in a spider/radar format

![image](https://github.com/user-attachments/assets/86dd56fe-6edb-4658-850f-bcfbb23402db)

---

### ⚙️ Backend Installation

1. Clone the repository:
   ```
   git clone https://github.com/AHMED-SAFA/AiExaminer_Backend.git
   ```

2. Navigate to the project directory:
   ```
   cd AiExaminer_Backend
   ```

3. Create and activate virtual environment:
   ```
   python -m venv venv
   source venv/Scripts/activate
   venv\Scripts\activate  # On Windows
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   ```
   touch .env
   ```

6. Run migrations:
   ```
   py manage.py makemigrations
   py manage.py migrate
   ```

7. Create superuser:
   ```
   py manage.py createsuperuser
   ```

8. Run development server:
   ```
   py manage.py runserver
   ```

---

## Frontend

### ⚙️ Frontend Installation

1. Clone the repository:
   ```
   git clone https://github.com/AHMED-SAFA/AiExaminer_frontend.git
   ```

2. Navigate to the project directory:
   ```
   cd AiExaminer_frontend
   ```

3. Install dependencies:
   ```
   npm i
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Visit the site:
   ```
   http://localhost:5173/
   ```

---

## Contributing

Contributions are welcome! If you have suggestions for improving this project, feel free to fork the repository and submit a pull request.
