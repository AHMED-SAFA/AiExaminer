/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateExamModal from "./CreateExamPage/CreateExamModal";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GradeIcon from "@mui/icons-material/Grade";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import QuizIcon from "@mui/icons-material/Quiz";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import IsoIcon from "@mui/icons-material/Iso";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Home = () => {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [examLoading, setExamLoading] = useState(true);
  const [generatingOptions, setGeneratingOptions] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [examStartDialog, setExamStartDialog] = useState({
    open: false,
    examId: null,
    extractedExamId: null,
  });

  useEffect(() => {
    fetchExams();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched userData from home:", response.data);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchExams = async () => {
    try {
      setExamLoading(true);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/exam/exams-list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExams(response.data);
      console.log("Fetched exams from home:", response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch exams. Please try again.",
        severity: "error",
      });
    } finally {
      setExamLoading(false);
    }
  };

  const handleExamSubmit = async (formData) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/exam/create-exam/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Exam created:", response.data);
      handleModalClose(); // Close modal after successful creation
      setSnackbar({
        open: true,
        message: "Exam created successfully!",
        severity: "success",
      });
      await fetchExams(); // Fetch updated exam list
    } catch (error) {
      console.error("Error creating exam:", error);
      // Show user-friendly error message
      let errorMessage = "Failed to create exam. Please try again.";
      if (error.response?.data?.error) {
        if (error.response.data.error.includes("insufficient_quota")) {
          errorMessage =
            "OpenAI API quota exceeded. Please try again later or contact support.";
        } else {
          errorMessage = error.response.data.error;
        }
      }
      setError(errorMessage);
    }
  };

  const handleGenerateOptions = async (examId) => {
    // Set loading state for this specific exam
    setGeneratingOptions((prev) => ({ ...prev, [examId]: true }));
    console.log("Generating options for exam ID:", examId);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/exam/generate-options-answers/",
        { exam_id: examId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Options generated:", response);
      setSnackbar({
        open: true,
        message: "Successfully generated options and answers!",
        severity: "success",
      });

      // Refresh exam list to show updated status
      await fetchExams();
    } catch (error) {
      console.error("Error generating options:", error);
      console.log("Error generating options:", error);
      let errorMessage =
        "Failed to generate options and answers. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      // Clear loading state
      setGeneratingOptions((prev) => ({ ...prev, [examId]: false }));
    }
  };

  const extractExamId = (url) => {
    const regex = /exam_\d+_processed_\d+/;
    const match = url.match(regex);

    if (match) {
      return match[0];
    } else {
      console.error("No match found in the URL:", url);
      return null;
    }
  };

  const handleExamClick = (examId, output_pdf) => {
    const exam = exams.find((e) => e.id === examId);

    if (!exam) {
      setSnackbar({
        open: true,
        message: "Exam not found",
        severity: "error",
      });
      return;
    }

    if (exam.processing_status !== "Generated") {
      setSnackbar({
        open: true,
        message:
          "This exam is not ready yet. Please generate questions and answers first.",
        severity: "warning",
      });
      return;
    }

    const extractedExamId = extractExamId(output_pdf);

    if (!extractedExamId) {
      setSnackbar({
        open: true,
        message: "Invalid exam identifier",
        severity: "error",
      });
      return;
    }

    // Open confirmation dialog instead of navigating directly
    setExamStartDialog({
      open: true,
      examId,
      extractedExamId,
    });
  };

  const handleStartExam = () => {
    const { examId, extractedExamId } = examStartDialog;
    setExamStartDialog({ open: false, examId: null, extractedExamId: null });
    navigate(
      `/exam-session/${examId}/${extractedExamId}/${userData.id}/${userData.username}`
    );
  };

  const handleCancelStart = () => {
    setExamStartDialog({ open: false, examId: null, extractedExamId: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "Generated":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(11, 36, 147) 0%, rgb(107, 190, 245) 100%)",
        display: "flex",
        flexDirection: "column",
        padding: 4,
        overflow: "hidden",
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
          My Exams Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleModalOpen}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",

            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          Create New Exam
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          padding: 3,
          borderRadius: 2,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            My Exams
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchExams}
            disabled={examLoading}
          >
            Refresh
          </Button>
        </Box>

        {examLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : exams.length > 0 ? (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} key={exam.id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                  onClick={() => handleExamClick(exam.id, exam.output_pdf)}
                >
                  <CardContent>
                    <Typography variant="h6" noWrap gutterBottom>
                      {exam.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {exam.duration} minutes
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <GradeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Total: {exam.total_marks} marks (
                        {exam.each_question_marks} per question)
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {exam.question_count ||
                          "Questions count will be updated after generating questions"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <RemoveCircleOutlineIcon
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        Minus Marking: {exam.minus_marking ? "Yes" : "No"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <IsoIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {exam.minus_marking_value
                          ? exam.minus_marking_value + " each wrong"
                          : "No minus marking"}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={exam.processing_status.toUpperCase()}
                        color={getStatusColor(exam.processing_status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoFixHighIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateOptions(exam.id);
                        }}
                        disabled={
                          generatingOptions[exam.id] ||
                          exam.processing_status === "processing" ||
                          (exam.is_processed &&
                            exam.processing_status === "Generated")
                        }
                        sx={{
                          color: "primary.main",
                          borderColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        {generatingOptions[exam.id] ? (
                          <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            Generating...
                          </>
                        ) : (
                          "Generate Answer/Option"
                        )}
                      </Button>
                      <Typography
                        variant="body2"
                        sx={{ mt: 2, borderRadius: 2 }}
                      >
                        {exam.processing_status === "Generated" ? (
                          <Alert severity="success">
                            Exam is ready! Click to start.
                          </Alert>
                        ) : (
                          <Alert severity="error"> Generate exam first.</Alert>
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              You haven't created any exams yet. Click the "Create New Exam"
              button to get started.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Create Exam Modal */}
      <CreateExamModal
        open={modalOpen}
        handleClose={handleModalClose}
        handleSubmit={handleExamSubmit}
        error={error}
      />

      {/* Exam Start Confirmation Dialog */}
      <Dialog
        open={examStartDialog.open}
        onClose={handleCancelStart}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        {/* Custom Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <CheckCircleIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Start Exam?
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 500 }}>
            Are you sure you want to start this exam?
          </Typography>

          {/* Exam Details Card */}
          {exams.map((exam) => {
            if (exam.id === examStartDialog.examId) {
              return (
                <Paper
                  key={exam.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    bgcolor: "primary.lighter",
                    border: 1,
                    borderColor: "primary.light",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary.dark"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {exam.title}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTimeIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="body1">
                          <Box component="span" fontWeight="medium">
                            {exam.duration}
                          </Box>{" "}
                          minutes
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <QuizIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="body1">
                          <Box component="span" fontWeight="medium">
                            {exam.question_count}
                          </Box>{" "}
                          questions
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <GradeIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="body1">
                          <Box component="span" fontWeight="medium">
                            {exam.total_marks}
                          </Box>{" "}
                          total marks
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="body1">
                          <Box component="span" fontWeight="medium">
                            {exam.each_question_marks}
                          </Box>{" "}
                          mark per question
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {exam.minus_marking && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: "warning.lighter",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "warning.light",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <WarningIcon color="warning" sx={{ mr: 1.5, mt: 0.25 }} />
                      <Typography variant="body2">
                        <Box component="span" fontWeight="bold">
                          Negative marking:
                        </Box>{" "}
                        {exam.minus_marking_value} marks will be deducted for
                        each incorrect answer
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            }
            return null;
          })}

          {/* Instructions */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: 1,
              borderColor: "grey.200",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <InfoIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Important Instructions
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <List dense disablePadding>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <ErrorOutlineIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Once started, the exam timer cannot be paused"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <ErrorOutlineIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Ensure you have a stable internet connection"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>

              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <ErrorOutlineIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Submit before time expires to avoid auto-submission"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            </List>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: "grey.50",
            borderTop: 1,
            borderColor: "grey.200",
          }}
        >
          <Button
            onClick={handleCancelStart}
            color="error"
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartExam}
            color="primary"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            autoFocus
            sx={{
              px: 3,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            Start Exam
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

export default Home;
