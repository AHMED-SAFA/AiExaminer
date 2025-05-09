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
  DialogContentText,
  DialogTitle,
  Slide,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import CreateExamModal from "./CreateExamPage/CreateExamModal";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteIcon from "@mui/icons-material/Delete";
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

const DeleteModalTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Home = () => {
  const navigate = useNavigate();
  const { token, user, userData } = useAuth();
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
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    examId: null,
  });

  useEffect(() => {
    console.log("user from auth context:", user);
    console.log("userData is from auth context:", userData);
    fetchExams();
  }, []);

  const handleDeleteDialogOpen = (event, examId) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      examId: examId,
    });
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog({
      open: false,
      examId: null,
    });
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
      handleModalClose();
      setSnackbar({
        open: true,
        message: "Exam created successfully!",
        severity: "success",
      });
      await fetchExams();
    } catch (error) {
      console.error("Error creating exam:", error);
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

  const handleDeleteExam = async () => {
    const examId = deleteDialog.examId;

    if (!examId) return;

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/exam/delete-exam/${examId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Exam deleted:", response.data);
      setSnackbar({
        open: true,
        message: "Exam deleted successfully!",
        severity: "success",
      });
      await fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      let errorMessage = "Failed to delete exam. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      handleDeleteDialogClose();
    }
  };

  const handleGenerateOptions = async (examId) => {
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

    setExamStartDialog({
      open: true,
      examId,
      extractedExamId,
    });
    console.log("Exam ID from handleExamClick:", examId);
    console.log("Extracted Exam ID from handleExamClick:", extractedExamId);
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
          "radial-gradient(circle at 10% 20%, rgb(0, 93, 133) 0%, rgb(0, 181, 149) 90%)",
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
          color="gray"
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : exams.length > 0 ? (
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{
              px: { xs: 1, sm: 2, md: 3 },
              py: 2,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={exam.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: 2,
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                  onClick={() => handleExamClick(exam.id, exam.output_pdf)}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.dark"
                        fontWeight="bold"
                        sx={{
                          wordBreak: "break-word",
                          flexGrow: 1,
                          pr: 1,
                        }}
                      >
                        {exam.title}
                      </Typography>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDialogOpen(e, exam.id);
                        }}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "error.lighter",
                          },
                          mt: -0.5,
                          ml: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={exam.processing_status.toUpperCase()}
                        color={getStatusColor(exam.processing_status)}
                        size="small"
                        sx={{ mb: 1.5 }}
                      />
                    </Box>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTimeIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {exam.duration} minutes
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <GradeIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {exam.total_marks} marks ({exam.each_question_marks}{" "}
                          per question)
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AssignmentIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {exam.question_count + " Questions" ||
                            "Questions count pending"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <RemoveCircleOutlineIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          Minus Marking: {exam.minus_marking ? "Yes" : "No"}
                        </Typography>
                      </Box>

                      {exam.minus_marking && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IsoIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            -{exam.minus_marking_value} for each wrong
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={
                          generatingOptions[exam.id] ? (
                            <CircularProgress size={16} />
                          ) : (
                            <AutoFixHighIcon />
                          )
                        }
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
                          borderRadius: 1.5,
                          textTransform: "none",
                          color: "primary.main",
                          borderColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.lighter",
                          },
                        }}
                      >
                        {generatingOptions[exam.id]
                          ? "Generating..."
                          : "Generate Answers/Options"}
                      </Button>

                      <Box sx={{ mt: 2 }}>
                        {exam.processing_status === "Generated" ? (
                          <Alert
                            severity="success"
                            icon={<CheckCircleIcon fontSize="small" />}
                            sx={{
                              borderRadius: 1.5,
                              "& .MuiAlert-message": {
                                fontSize: "0.75rem",
                              },
                            }}
                          >
                            Exam is ready! Click to start.
                          </Alert>
                        ) : (
                          <Alert
                            severity="info"
                            icon={<InfoIcon fontSize="small" />}
                            sx={{
                              borderRadius: 1.5,
                              "& .MuiAlert-message": {
                                fontSize: "0.75rem",
                              },
                            }}
                          >
                            Generate exam first
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, sm: 4 },
              minHeight: "300px",
              textAlign: "center",
            }}
          >
            <AssignmentIcon
              sx={{
                fontSize: 60,
                color: "text.secondary",
                mb: 2,
                opacity: 0.7,
              }}
            />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Exams Found
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ maxWidth: "400px", mx: "auto" }}
            >
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

      {/* delete dialog */}
      <Dialog
        open={deleteDialog.open}
        TransitionComponent={DeleteModalTransition}
        keepMounted
        onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            maxWidth: "450px",
          },
        }}
      >
        {/* Custom Header with Warning Icon */}
        <Box
          sx={{
            bgcolor: "error.main",
            color: "error.contrastText",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon sx={{ mr: 1.5, fontSize: "1.75rem" }} />
            <Typography variant="h6" component="h2" fontWeight="bold">
              Delete Exam
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleDeleteDialogClose}
            aria-label="close"
          >
            <CancelIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, pt: 2.5 }}>
          {exams.map((exam) => {
            if (exam.id === deleteDialog.examId) {
              return (
                <Box key={exam.id} sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Exam: {exam.title}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                </Box>
              );
            }
            return null;
          })}

          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "error.lighter",
              borderRadius: 1,
              border: 1,
              borderColor: "error.light",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ mr: 1.5, mt: 0.25 }} />
            <Box>
              <Typography
                variant="body2"
                fontWeight="medium"
                color="error.dark"
                gutterBottom
              >
                This action cannot be undone.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deleting this exam will permanently remove all associated
                questions, answers, and any student results.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: "grey.50",
            borderTop: 1,
            borderColor: "grey.200",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleDeleteDialogClose}
            color="inherit"
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{ borderColor: "grey.400", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteExam}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              px: 2,
              boxShadow: 1,
              "&:hover": {
                bgcolor: "error.dark",
                boxShadow: 2,
              },
            }}
          >
            Delete Permanently
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
