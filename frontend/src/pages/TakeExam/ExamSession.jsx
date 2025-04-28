import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ExamSession = () => {
  const { examId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  // State for exam details and questions
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Starting exam session..."
  );

  // State for tracking exam progress
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examSession, setExamSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examComplete, setExamComplete] = useState(false);
  const [results, setResults] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Initialize exam session
  useEffect(() => {
    console.log("Exam ID from URL:", examId);
    console.log("Token from context:", token);
    const startExam = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Fetching exam details...");

        // 1. Fetch exam details-- working
        const examResponse = await axios.get(
          `http://127.0.0.1:8000/api/take-exam/${examId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Exam details from start exam:", examResponse.data);
        setExam(examResponse.data);

        // 2. Start new exam session
        setLoadingMessage("Starting exam session...");
        const sessionResponse = await axios.post(
          "http://127.0.0.1:8000/api/take-exam/start-session/",
          { exam: examId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Session response from start exam:", sessionResponse.data);
        setExamSession(sessionResponse.data);

        // 3. Fetch questions and options
        setLoadingMessage("Loading questions...");
        const questionsResponse = await axios.get(
          `http://127.0.0.1:8000/api/take-exam/${examId}/questions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          "Questions response from start exam:",
          questionsResponse.data
        );
        setQuestions(questionsResponse.data);

        // 4. Set timer
        setTimeRemaining(examResponse.data.duration * 60);

        setLoading(false);
      } catch (error) {
        console.error("Error starting exam:", error);
        console.log("Error from starting exam:", error);
        setError("Failed to start exam. Please try again.");
        setLoading(false);
      }
    };

    startExam();
  }, [examId, token]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || examComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExamSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleAnswer = async (questionId, optionId) => {
    try {
      // Update local state
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: optionId,
      });

      // Submit answer to backend
      const response = await axios.post(
        "http://127.0.0.1:8000/api/take-exam/submit-answer/",
        {
          session: examSession.id,
          question: questionId,
          selected_option: optionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "Answer submission response from handleAnswer:",
        response.data
      );
    } catch (error) {
      console.error("Error submitting answer:", error);
      console.log("Error submitting answer from handleAnswer:", error);
      setSnackbar({
        open: true,
        message: "Failed to save your answer. Please try again.",
        severity: "error",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleExamSubmit = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Submitting exam results...");

      // Complete the exam session
      const response = await axios.put(
        `http://127.0.0.1:8000/api/take-exam/complete-session/${examSession.id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Results from handleExamSubmit:", response.data);

      setResults(response.data);
      setExamComplete(true);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting exam:", error);
      console.log("Error submitting exam:", error);
      setError("Failed to submit exam. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmSubmit = () => {
    setConfirmDialog(false);
    handleExamSubmit();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          {loadingMessage}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 3, width: "100%", maxWidth: 500 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  if (examComplete && results) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 700,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Exam Completed!
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            Your Score: {results.score} / {exam.total_marks}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "left", mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exam Summary
            </Typography>
            <Typography>Total Questions: {questions.length}</Typography>
            <Typography>
              Answered: {Object.keys(selectedAnswers).length}
            </Typography>
            <Typography>
              Time Taken: {exam.duration - Math.ceil(timeRemaining / 60)}{" "}
              minutes
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate("/")}
            fullWidth
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Exam Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">{exam?.title}</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccessTimeIcon
            sx={{
              mr: 1,
              color: timeRemaining < 300 ? "error.main" : "inherit",
            }}
          />
          <Typography
            variant="h6"
            sx={{ color: timeRemaining < 300 ? "error.main" : "inherit" }}
          >
            Time Remaining: {formatTime(timeRemaining)}
          </Typography>
        </Box>
      </Paper>

      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <Typography>
            Answered: {Object.keys(selectedAnswers).length} / {questions.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(currentQuestion / (questions.length - 1)) * 100}
          sx={{ height: 8, borderRadius: 2 }}
        />
      </Box>

      {/* Question Card */}
      {questions.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {questions[currentQuestion].question_text}
            </Typography>

            <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
              <RadioGroup
                value={selectedAnswers[questions[currentQuestion].id] || ""}
                onChange={(e) =>
                  handleAnswer(questions[currentQuestion].id, e.target.value)
                }
              >
                {questions[currentQuestion].options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={option.option_text}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      ...(selectedAnswers[questions[currentQuestion].id] ===
                        option.id && {
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                      }),
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => setConfirmDialog(true)}
        >
          Submit Exam
        </Button>

        <Button
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={handleNextQuestion}
          disabled={currentQuestion === questions.length - 1}
        >
          Next
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your exam? You've answered{" "}
            {Object.keys(selectedAnswers).length} out of {questions.length}{" "}
            questions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamSession;
