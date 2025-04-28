import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  Box,
  Typography,
  Input,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const CreateExamModal = ({ open, handleClose, handleSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Exam Details", "Time Settings", "Scoring Options"];
  const [examData, setExamData] = useState({
    title: "",
    pdfFile: null,
    duration: 60,
    totalMarks: 50,
    each_question_marks: 1,
    minusMarking: false,
    minusMarkingValue: "",
    minmcqOptionsCount: 2,
  });

  const handleFileChange = (e) => {
    setExamData({ ...examData, pdfFile: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData({ ...examData, [name]: value });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setExamData({ ...examData, [name]: checked });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormSubmit = () => {
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("title", examData.title);
    formData.append("pdf_file", examData.pdfFile);
    formData.append("duration", examData.duration);
    formData.append("total_marks", examData.totalMarks);
    formData.append("each_question_marks", examData.each_question_marks);
    formData.append("minus_marking", examData.minusMarking);
    formData.append("minus_marking_value", examData.minusMarkingValue);
    formData.append("mcq_options_count", examData.minmcqOptionsCount);

    handleSubmit(formData);
    handleClose();
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return examData.title.trim() !== "" && examData.pdfFile !== null;
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Exam</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              name="title"
              label="Exam Title"
              value={examData.title}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Upload Question PDF/Text file*
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 1 }}
              >
                Choose PDF File
                <input
                  type="file"
                  accept=".pdf,.txt"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {examData.pdfFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {examData.pdfFile.name}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Exam Duration (minutes)</InputLabel>
              <Select
                name="duration"
                value={examData.duration}
                label="Exam Duration (minutes)"
                onChange={handleInputChange}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={90}>1.5 hours</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
                <MenuItem value={180}>3 hours</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              name="totalMarks"
              label="Total Marks"
              type="number"
              value={examData.totalMarks}
              onChange={handleInputChange}
              fullWidth
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              name="each_question_marks"
              label="Marks Per Question"
              type="number"
              value={examData.each_question_marks}
              onChange={handleInputChange}
              fullWidth
              InputProps={{ inputProps: { min: 1 } }}
              helperText="Number of marks for each question"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={examData.minusMarking}
                  onChange={handleSwitchChange}
                  name="minusMarking"
                />
              }
              label="Enable Minus Marking"
            />

            {examData.minusMarking && (
              <TextField
                name="minusMarkingValue"
                label="Minus Marking Value"
                type="number"
                value={examData.minusMarkingValue}
                onChange={handleInputChange}
                fullWidth
                InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                helperText="Value to deduct for wrong answers (e.g., 0.25 means 1/4th mark)"
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Number of MCQ Options</InputLabel>
              <Select
                name="minmcqOptionsCount"
                value={examData.minmcqOptionsCount}
                label="Number of MCQ Options"
                onChange={handleInputChange}
              >
                <MenuItem value={2}>2 Options</MenuItem>
                <MenuItem value={3}>3 Options</MenuItem>
                <MenuItem value={4}>4 Options</MenuItem>
                <MenuItem value={5}>5 Options</MenuItem>
                <MenuItem value={6}>6 Options</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={!isStepValid()}
          >
            Create Exam
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateExamModal;
