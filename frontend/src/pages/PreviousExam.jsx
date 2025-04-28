/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../context/AuthContext";

function PreviousExam() {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const { userId } = useParams();

  useEffect(() => {
    fetchExamSessions();
  }, [userId]);

  const fetchExamSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/take-exam/sessions/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response from previous exam sessions:", response.data);
      setExamSessions(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch exam sessions. Please try again later.");
      console.error("Error fetching exam sessions:", err);
      console.log("Error fetching exam sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "info";
    if (score >= 40) return "warning";
    return "error";
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
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(14, 26, 78) 0%, rgb(183, 132, 235) 100%)",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 4, color: "white", fontWeight: "bold" }}
      >
        Your Exam History
      </Typography>

      {examSessions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">
            No exam sessions found. Take an exam to see your history!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {examSessions.map((session) => (
            <Grid item xs={12} md={6} lg={4} key={session.id}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {session.exam_title}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Chip
                    icon={<TimelineIcon />}
                    label={`Score: ${session.score}`}
                    color={getScoreColor(session.score)}
                  />
                  <Chip
                    icon={<QuizIcon />}
                    label={`Total Marks: ${session.total_marks}`}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`Correct: ${session.corrected_ans}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    icon={<CancelIcon />}
                    label={`Wrong: ${session.wrong_ans}`}
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    icon={<HelpOutlineIcon />}
                    label={`Unanswered: ${session.unanswered}`}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Completed on: {session.completion_date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {session.duration} minutes
                </Typography>{" "}
                <Typography variant="body2" color="text.secondary">
                  Minus Marking:{" "}
                  {session.minus_marking_value
                    ? session.minus_marking_value
                    : "0"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mb: 2,
                      p: 2,
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Result Summary
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2">
                        Correct Answers: {session.corrected_ans} ×{" "}
                        {session.each_question_marks} ={" "}
                        {session.corrected_ans * session.each_question_marks}
                      </Typography>
                      {session.minus_marking_value > 0 && (
                        <Typography variant="body2">
                          Minus Marking: {session.wrong_ans} ×{" "}
                          {session.minus_marking_value} ={" "}
                          {session.wrong_ans * session.minus_marking_value}
                        </Typography>
                      )}
                      <Typography variant="body2" fontWeight="bold">
                        Final Score: {session.score}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    {session.output_pdf && (
                      <Button
                        variant="outlined"
                        component="a"
                        href={`http://127.0.0.1:8000/media/${session.output_pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<VisibilityIcon />}
                        size="small"
                        sx={{
                          color: "primary.main",
                          borderColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        View Question Answer
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default PreviousExam;
