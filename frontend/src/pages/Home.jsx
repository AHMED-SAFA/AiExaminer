// /* eslint-disable react-hooks/exhaustive-deps */
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import {
//   Typography,
//   Button,
//   Box,
//   Avatar,
//   Paper,
//   Divider,
//   Card,
//   CardContent,
//   IconButton,
//   Fade,
//   Chip,
//   Grid,
//   CircularProgress,
// } from "@mui/material";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import CreateExamModal from "./CreateExamPage/CreateExamModal";
// import { motion } from "framer-motion";
// import AddIcon from "@mui/icons-material/Add";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import GradeIcon from "@mui/icons-material/Grade";
// import RefreshIcon from "@mui/icons-material/Refresh";

// const Home = () => {
//   const { token } = useAuth();
//   const navigate = useNavigate();
//   const [exams, setExams] = useState([]);
//   const [examLoading, setExamLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [error, setError] = useState(null);

//   const handleModalOpen = () => {
//     setModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setModalOpen(false);
//     setError(null);
//   };

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   const fetchExams = async () => {
//     try {
//       setExamLoading(true);
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/exam/exams-list/",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setExams(response.data);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     } finally {
//       setExamLoading(false);
//     }
//   };

//   const handleExamSubmit = async (formData) => {
//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/exam/create-exam/",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       console.log("Exam created:", response.data);
//       handleModalClose(); // Close modal after successful creation
//       await fetchExams(); // Fetch updated exam list
//     } catch (error) {
//       console.error("Error creating exam:", error);
//       // Show user-friendly error message
//       let errorMessage = "Failed to create exam. Please try again.";
//       if (error.response?.data?.error) {
//         if (error.response.data.error.includes("insufficient_quota")) {
//           errorMessage =
//             "OpenAI API quota exceeded. Please try again later or contact support.";
//         } else {
//           errorMessage = error.response.data.error;
//         }
//       }
//       setError(errorMessage);
//     }
//   };

//   const handleExamClick = (examId) => {
//     navigate(`/exam/${examId}`);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "warning";
//       case "processing":
//         return "info";
//       case "completed":
//         return "success";
//       case "failed":
//         return "error";
//       default:
//         return "default";
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background:
//           "linear-gradient(135deg, rgb(14, 26, 78) 0%, rgb(183, 132, 235) 100%)",
//         display: "flex",
//         flexDirection: "column",
//         padding: 4,
//         overflow: "hidden",
//       }}
//       component={motion.div}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 4,
//         }}
//       >
//         <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
//           My Exams Dashboard
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={handleModalOpen}
//           sx={{
//             backgroundColor: "rgba(255, 255, 255, 0.2)",
//             backdropFilter: "blur(10px)",
//             color: "white",
//             "&:hover": {
//               backgroundColor: "rgba(255, 255, 255, 0.3)",
//             },
//           }}
//         >
//           Create New Exam
//         </Button>
//       </Box>

//       <Paper
//         elevation={3}
//         sx={{
//           flexGrow: 1,
//           padding: 3,
//           borderRadius: 2,
//           background: "rgba(255, 255, 255, 0.9)",
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
//           <Typography variant="h5" gutterBottom>
//             My Exams
//           </Typography>
//           <Button
//             startIcon={<RefreshIcon />}
//             onClick={fetchExams}
//             disabled={examLoading}
//           >
//             Refresh
//           </Button>
//         </Box>

//         {examLoading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//             <CircularProgress />
//           </Box>
//         ) : exams.length > 0 ? (
//           <Grid container spacing={3}>
//             {exams.map((exam) => (
//               <Grid item xs={12} sm={6} md={4} key={exam.id}>
//                 <Card
//                   sx={{
//                     height: "100%",
//                     cursor: "pointer",
//                     transition: "transform 0.2s",
//                     "&:hover": {
//                       transform: "scale(1.02)",
//                       boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
//                     },
//                   }}
//                   onClick={() => handleExamClick(exam.id)}
//                 >
//                   <CardContent>
//                     <Typography variant="h6" noWrap gutterBottom>
//                       {exam.title}
//                     </Typography>

//                     <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                       <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
//                       <Typography variant="body2">
//                         {exam.duration} minutes
//                       </Typography>
//                     </Box>

//                     <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                       <GradeIcon fontSize="small" sx={{ mr: 1 }} />
//                       <Typography variant="body2">
//                         {exam.total_marks} marks
//                       </Typography>
//                     </Box>

//                     <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                       <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
//                       <Typography variant="body2">
//                         {exam.question_count ||
//                           "Questions count will be updated after generating questions"}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ mt: 2 }}>
//                       <Chip
//                         label={exam.processing_status.toUpperCase()}
//                         color={getStatusColor(exam.processing_status)}
//                         size="small"
//                       />
//                     </Box>

//                     <Box sx={{ mt: 2 }}>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                         }}
//                         sx={{
//                           color: "primary.main",
//                           borderColor: "primary.main",
//                           "&:hover": {
//                             backgroundColor: "rgba(0, 0, 0, 0.1)",
//                           },
//                         }}
//                       >
//                         Generate Answer/Option
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Box sx={{ textAlign: "center", py: 4 }}>
//             <Typography variant="body1" color="textSecondary">
//               You haven't created any exams yet. Click the "Create New Exam"
//               button to get started.
//             </Typography>
//           </Box>
//         )}
//       </Paper>

//       {/* Create Exam Modal */}
//       <CreateExamModal
//         open={modalOpen}
//         handleClose={handleModalClose}
//         handleSubmit={handleExamSubmit}
//         error={error}
//       />
//     </Box>
//   );
// };

// export default Home;

/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Typography,
  Button,
  Box,
  Avatar,
  Paper,
  Divider,
  Card,
  CardContent,
  IconButton,
  Fade,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateExamModal from "./CreateExamPage/CreateExamModal";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GradeIcon from "@mui/icons-material/Grade";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const Home = () => {
  const { token } = useAuth();
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

  useEffect(() => {
    fetchExams();
  }, []);

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

  const handleExamClick = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "completed":
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
          "linear-gradient(135deg, rgb(14, 26, 78) 0%, rgb(183, 132, 235) 100%)",
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
            color: "white",
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
                      transform: "scale(1.02)",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                  onClick={() => handleExamClick(exam.id)}
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
                        {exam.total_marks} marks
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {exam.question_count ||
                          "Questions count will be updated after generating questions"}
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
                            exam.processing_status === "completed")
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
