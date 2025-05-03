/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Slide,
  Box,
  IconButton,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

const DeleteModalTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});
function PreviousExam() {
  const [examSessions, setExamSessions] = useState([]);
  const [, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchExamSessions();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched userData from home:", response.data);
      setUserData(response.data);
      setUserId(response.data.id);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again later.");
    }
  };

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

  const getScoreColor = (score, totalMarks) => {
    if (score >= totalMarks * 0.8) return "success";
    if (score >= totalMarks * 0.4 && score < totalMarks * 0.8) return "warning";
    if (score < totalMarks * 0.4) return "error";
    return "error";
  };

  const handleViewExamDetails = (sessionId) => {
    navigate(`/exam-review/${sessionId}`);
  };

  const handleDeleteClick = (session) => {
    console.log("Delete button clicked for session:", session);
    setSelectedSession(session);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSession(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/take-exam/delete-session/${selectedSession.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response from delete exam session:", response.data);

      setExamSessions((prevSessions) =>
        prevSessions.filter((session) => session.id !== selectedSession.id)
      );

      setSnackbar({
        open: true,
        message: "Exam session deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete exam session",
        severity: "error",
      });
      console.error("Error deleting exam session:", error);
    } finally {
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageTransition>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 10% 20%, rgb(0, 93, 133) 0%, rgb(0, 181, 149) 90%)",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
              gap: 2,
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              Loading your exam history...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
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
                          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          mb: 2,
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                        variant="h6"
                        gutterBottom
                      >
                        {session.exam_title}
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteClick(session)}
                          size="small"
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              backgroundColor: "error.lighter",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Chip
                          icon={<TimelineIcon />}
                          label={`Score: ${session.score}`}
                          color={getScoreColor(
                            session.score,
                            session.total_marks
                          )}
                        />
                        <Chip
                          icon={<QuizIcon />}
                          label={`Total Marks: ${session.total_marks}`}
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mb: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`Correct: ${session.corrected_ans}`}
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiChip-label": {
                              whiteSpace: "normal",
                              display: "block",
                            },
                          }}
                        />
                        <Chip
                          icon={<CancelIcon />}
                          label={`Wrong: ${session.wrong_ans}`}
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiChip-label": {
                              whiteSpace: "normal",
                              display: "block",
                            },
                          }}
                        />
                        <Chip
                          icon={<HelpOutlineIcon />}
                          label={`Unanswered: ${session.unanswered}`}
                          color="warning"
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiChip-label": {
                              whiteSpace: "normal",
                              display: "block",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "error.main" }}
                        color="text.secondary"
                      >
                        {getScoreColor(session.score, session.total_marks) ===
                        "error"
                          ? "[You need to improve your score. Please review the exam.]"
                          : ""}
                      </Typography>
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
                              {session.corrected_ans *
                                session.each_question_marks}
                            </Typography>
                            {session.minus_marking_value > 0 && (
                              <Typography variant="body2">
                                Minus Marking: {session.wrong_ans} ×{" "}
                                {session.minus_marking_value} ={" "}
                                {session.wrong_ans *
                                  session.minus_marking_value}
                              </Typography>
                            )}
                            <Typography variant="body2" fontWeight="bold">
                              Final Score: {session.score}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<AssessmentIcon />}
                            onClick={() => handleViewExamDetails(session.id)}
                            size="small"
                            color="primary"
                            fullWidth
                          >
                            View Detailed Results
                          </Button>

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
                              View PDF
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Delete Confirmation Dialog */}

            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-description"
              TransitionComponent={DeleteModalTransition}
              keepMounted
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  maxWidth: "400px",
                  width: "100%",
                  background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
                  overflow: "hidden",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "8px",
                  bgcolor: "error.main",
                }}
              />

              <DialogTitle
                id="delete-dialog-title"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  pb: 1,
                  pt: 2.5,
                }}
              >
                <Typography variant="h6" fontWeight="600">
                  Delete Exam Session
                </Typography>
              </DialogTitle>
              <Divider sx={{ width: 1, bgcolor: "divider", mx: "auto" }} />

              <DialogContent sx={{ pt: 1, pb: 2 }}>
                <DialogContentText
                  id="delete-dialog-description"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.95rem",
                  }}
                >
                  Are you sure you want to delete the exam session
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      color: "text.primary",
                      display: "block",
                      my: 1,
                      p: 1.5,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      textAlign: "center",
                    }}
                  >
                    "{selectedSession?.exam_title}"
                  </Box>
                  This action is permanent and cannot be undone. All related
                  data including scores and answers will be permanently removed.
                </DialogContentText>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                <Button
                  onClick={handleCloseDialog}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    fontWeight: 500,
                    textTransform: "none",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  color="error"
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  disableElevation
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    ml: 1.5,
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "error.dark",
                      boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                    },
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Box>
    </PageTransition>
  );
}

export default PreviousExam;
