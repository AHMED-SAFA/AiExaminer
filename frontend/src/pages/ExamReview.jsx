/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  Grid,
  Chip,
  Divider,
  Stack,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../context/AuthContext";

function ExamReview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/take-exam/session-detail/${sessionId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Exam session details:", response.data);
      setSessionData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching exam session details:", err);
      if (err.response?.status === 403) {
        setError("You don't have permission to view this exam session.");
      } else {
        setError(
          "Failed to fetch exam session details. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, isCorrect) => {
    if (status === "unanswered") {
      return <HelpOutlineIcon color="warning" />;
    } else if (isCorrect) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <CancelIcon color="error" />;
    }
  };

  const getScoreColor = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "info";
    if (percentage >= 40) return "warning";
    return "error";
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Exam History
        </Button>
      </Box>
    );
  }

  if (!sessionData) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="warning">No exam data found.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Exam History
        </Button>
      </Box>
    );
  }

  const { session, exam, questions } = sessionData;

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(14, 26, 78) 0%, rgb(183, 132, 235) 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Review
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Exam: {exam.title}
              {/* make time to date: */}
              <Typography variant="body2" color="text.secondary">
                {new Date(session.start_time).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Exam Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body1">Total Marks:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {exam.total_marks}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body1">Duration:</Typography>
                      <Typography variant="body1">
                        {exam.duration} minutes
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body1">
                        Marks per Question:
                      </Typography>
                      <Typography variant="body1">
                        {exam.each_question_marks}
                      </Typography>
                    </Box>
                    {exam.minus_marking && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1">
                          Negative Marking:
                        </Typography>
                        <Typography variant="body1">
                          {exam.minus_marking_value} per wrong answer
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Your Result
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Chip
                      label={`Score: ${session.score} / ${exam.total_marks}`}
                      color={getScoreColor(session.score, exam.total_marks)}
                      size="large"
                      sx={{ fontWeight: "bold", px: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Correct: ${session.correct_answers}`}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<CancelIcon />}
                      label={`Wrong: ${session.wrong_answers}`}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<HelpOutlineIcon />}
                      label={`Unanswered: ${session.unanswered}`}
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h5" gutterBottom>
            Questions & Answers
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {questions.map((question, index) => {
            const userAnswer = question.user_answer;
            return (
              <Accordion key={question.id} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor:
                      userAnswer.status === "unanswered"
                        ? "rgba(255, 152, 0, 0.1)"
                        : userAnswer.is_correct
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(244, 67, 54, 0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {getStatusIcon(userAnswer.status, userAnswer.is_correct)}
                    <Typography
                      variant="subtitle1"
                      sx={{ ml: 1, fontWeight: "medium" }}
                    >
                      Question {index + 1}
                    </Typography>
                    <Box sx={{ ml: "auto" }}>
                      <Chip
                        size="small"
                        label={
                          userAnswer.status === "unanswered"
                            ? "Unanswered"
                            : userAnswer.is_correct
                            ? "Correct"
                            : "Incorrect"
                        }
                        color={
                          userAnswer.status === "unanswered"
                            ? "warning"
                            : userAnswer.is_correct
                            ? "success"
                            : "error"
                        }
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, fontWeight: "medium" }}
                  >
                    {question.text}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Marks: {question.marks}
                  </Typography>

                  <RadioGroup
                    value={userAnswer.selected_option_id || ""}
                    sx={{ mb: 2 }}
                  >
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={
                          <Radio
                            disabled
                            color={
                              option.is_correct
                                ? "success"
                                : option.id === userAnswer.selected_option_id &&
                                  !option.is_correct
                                ? "error"
                                : "primary"
                            }
                            checked={
                              option.id === userAnswer.selected_option_id
                            }
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                fontWeight:
                                  option.is_correct ||
                                  option.id === userAnswer.selected_option_id
                                    ? "bold"
                                    : "normal",
                                color: option.is_correct
                                  ? "success.main"
                                  : "inherit",
                                textDecoration:
                                  option.id === userAnswer.selected_option_id &&
                                  !option.is_correct
                                    ? "line-through"
                                    : "none",
                              }}
                            >
                              {option.text}
                            </Typography>
                            {option.is_correct && (
                              <CheckCircleIcon
                                color="success"
                                sx={{ ml: 1, fontSize: "small" }}
                              />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>

                  {question.explanation && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: "rgba(0, 0, 0, 0.03)",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Explanation:
                      </Typography>
                      <Typography variant="body2">
                        {question.explanation}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>
      </Container>
    </Box>
  );
}

export default ExamReview;
