/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  useTheme,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
  Snackbar,
  Tooltip as MuiTooltip,
} from "@mui/material";
// Replace this import section:
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  DonutLarge as PieChartIcon,
  Lightbulb as LightbulbIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { RadarOutlined as RadarIcon } from "@mui/icons-material";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Custom color palette
const CHART_COLORS = {
  primary: "#6366F1", // Indigo
  secondary: "#10B981", // Emerald
  tertiary: "#F59E0B", // Amber
  quaternary: "#EC4899", // Pink
  quinary: "#8B5CF6", // Purple
  correct: "#22C55E", // Green
  wrong: "#EF4444", // Red
  neutral: "#6B7280", // Gray
  unattempted: "#94A3B8", // Slate
};

// Chart color array for consistency
const COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
];

function StatisticsPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [viewType, setViewType] = useState("overall");
  const [chartType, setChartType] = useState("bar");
  const [examStatistics, setExamStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [showRadarChart, setShowRadarChart] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [refreshTrigger]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/exam-statistics/statistics/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExams(response.data);
    } catch (err) {
      setError("Failed to load exams data");
      console.error("Error fetching exams data:", err);
      setSnackbar({
        open: true,
        message: "Failed to load exam data. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId);
    setViewType("individual");
    setChartType("bar");
    setSelectedTab(0);

    try {
      // Fetch detailed statistics for the selected exam
      const response = await axios.get(
        `http://127.0.0.1:8000/api/exam-statistics/${examId}/statistics/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExamStatistics(response.data);
    } catch (err) {
      setError("Failed to load individual exam statistics");
      console.error("Error fetching exam statistics:", err);
      setSnackbar({
        open: true,
        message: "Failed to load exam statistics. Please try again.",
        severity: "error",
      });
    }
  };

  const handleBackToOverview = () => {
    setSelectedExam(null);
    setViewType("overall");
    setAiSuggestions("");
  };

  const getOverallMetrics = () => {
    if (!exams || exams.length === 0) return [];

    const totalExams = exams.length;
    const totalQuestions = exams.reduce(
      (sum, exam) => sum + (exam.question_count || 0),
      0
    );
    const totalSessions = exams.reduce(
      (sum, exam) => sum + (exam.sessions_count || 0),
      0
    );
    const avgScore =
      exams.reduce((sum, exam) => sum + (exam.average_score || 0), 0) /
      totalExams;
    const completionRate =
      exams.reduce((sum, exam) => sum + (exam.completion_rate || 0), 0) /
      totalExams;

    return [
      {
        name: "Total Exams",
        value: totalExams,
        color: CHART_COLORS.primary,
      },
      {
        name: "Total Questions",
        value: totalQuestions,
        color: CHART_COLORS.secondary,
      },
      {
        name: "Total Attempts",
        value: totalSessions,
        color: CHART_COLORS.tertiary,
      },
      {
        name: "Avg Score",
        value: `${avgScore.toFixed(2)}%`,
        color: CHART_COLORS.quaternary,
      },
      {
        name: "Completion Rate",
        value: `${completionRate.toFixed(2)}%`,
        color: CHART_COLORS.quinary,
      },
    ];
  };

  const getExamPerformanceData = () => {
    if (!exams || exams.length === 0) return [];

    return exams.map((exam) => ({
      name:
        exam.title.length > 15
          ? exam.title.substring(0, 15) + "..."
          : exam.title,
      avgScore: exam.average_score || 0,
      attempts: exam.sessions_count || 0,
      questions: exam.question_count || 0,
    }));
  };

  const getIndividualExamPerformance = () => {
    if (!examStatistics) return [];

    return [
      {
        name: "Correct",
        value: examStatistics.average_correct || 0,
        color: CHART_COLORS.correct,
      },
      {
        name: "Wrong",
        value: examStatistics.average_wrong || 0,
        color: CHART_COLORS.wrong,
      },
      {
        name: "Unanswered",
        value: examStatistics.average_unanswered || 0,
        color: CHART_COLORS.unattempted,
      },
    ];
  };

  const getQuestionDifficultyData = () => {
    if (!examStatistics || !examStatistics.question_stats) return [];

    return examStatistics.question_stats.map((question, index) => ({
      name: `Q${index + 1}`,
      correctPercentage: question.correct_percentage || 0,
      attemptPercentage: question.attempt_percentage || 0,
    }));
  };

  const getTimeDistributionData = () => {
    if (!examStatistics || !examStatistics.time_distribution) return [];

    return examStatistics.time_distribution.map((point) => ({
      name: point.time_segment,
      completions: point.completions || 0,
    }));
  };

  const getRadarChartData = () => {
    if (!examStatistics || !examStatistics.question_stats) return [];

    // Get difficulty data for radar chart
    const data = [];

    // For simplicity, let's calculate some meaningful metrics for the radar chart
    const metrics = {
      avgScore: examStatistics.average_score / 100 || 0,
      completionRate: examStatistics.completion_rate / 100 || 0,
      correctRatio:
        examStatistics.average_correct / examStatistics.question_count || 0,
      attemptsPerQuestion:
        examStatistics.sessions_count / examStatistics.question_count || 0,
      timingFactor: 0.65, // Placeholder value
    };

    data.push({
      subject: "Score",
      value: metrics.avgScore,
      fullMark: 1,
    });

    data.push({
      subject: "Completion",
      value: metrics.completionRate,
      fullMark: 1,
    });

    data.push({
      subject: "Correct Rate",
      value: metrics.correctRatio,
      fullMark: 1,
    });

    data.push({
      subject: "Student Engagement",
      value: Math.min(metrics.attemptsPerQuestion / 5, 1), // Normalize to 0-1
      fullMark: 1,
    });

    data.push({
      subject: "Time Efficiency",
      value: metrics.timingFactor,
      fullMark: 1,
    });

    return data;
  };

  const generateAiSuggestions = async () => {
    if (!examStatistics) return;
    setSuggestionsLoading(true);
    setAiSuggestions("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/exam-statistics/generate-suggestions/",
        {
          examId: selectedExam,
          stats: examStatistics,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiSuggestions(response.data.suggestions);
      setSnackbar({
        open: true,
        message: "AI insights generated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error generating AI suggestions:", err);

      // Handle specific error messages from backend
      if (err.response?.data?.error) {
        setAiSuggestions(`${err.response.data.error}`);
      } else {
        setAiSuggestions(
          "Failed to generate AI suggestions. Please try again later."
        );
      }

      setSnackbar({
        open: true,
        message: "Failed to generate AI insights. Please try again.",
        severity: "error",
      });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <Card className="p-8 max-w-md flex flex-col items-center">
          <CircularProgress size={60} thickness={4} className="mb-4" />
          <Typography variant="h6" color="textSecondary">
            Loading statistics...
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-2">
            Please wait while we fetch your exam data
          </Typography>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <Paper
          elevation={3}
          className="p-8 max-w-md flex flex-col items-center"
        >
          <AlertTriangle size={64} color="#EF4444" />
          <Typography variant="h5" className="mt-4 text-red-600 font-medium">
            {error}
          </Typography>
          <Typography variant="body1" className="mt-2 text-center">
            We encountered a problem retrieving the exam statistics. Please
            check your connection or try again later.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className="mt-6"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setError(null);
              setRefreshTrigger((prev) => prev + 1);
            }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="bg-pink-50 min-h-screen">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box className="container mx-auto px-4 py-8">
        {viewType === "overall" ? (
          <Box>
            {/* dashboard refresh button */}
            <Box className="flex justify-between items-center mb-6">
              <Typography
                variant="h4"
                component="h1"
                className="font-bold text-gray-800"
              >
                Exam Statistics Dashboard
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
              >
                Refresh
              </Button>
            </Box>

            {/* Key Metrics */}
            <Grid
              container
              spacing={3}
              className="mb-8 mt-4 gap-4 md:gap-8 lg:gap-12 xl:gap-16 flex-wrap justify-center items-center"
            >
              {getOverallMetrics().map((metric, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Card
                    className="h-full transition-all hover:shadow-lg"
                    sx={{
                      borderLeft: `4px solid ${metric.color}`,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(30, 41, 59, 0.8)"
                          : "white",
                    }}
                  >
                    <CardContent className="p-4">
                      <Box className="flex justify-between items-start">
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500"
                        >
                          {metric.name}
                        </Typography>
                      </Box>
                      <Typography variant="h5" className="font-bold mt-2">
                        {metric.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Performance Charts */}
            <Card className="mb-8 shadow-lg rounded-lg">
              <CardContent>
                {/* select chart type */}
                <Box className="flex justify-between items-center mb-4">
                  <Typography
                    variant="h6"
                    component="h2"
                    className="font-semibold"
                  >
                    Exam Performance Comparison
                  </Typography>
                  <Box className="flex space-x-2">
                    <MuiTooltip title="Bar Chart">
                      <IconButton
                        onClick={() => setChartType("bar")}
                        color={chartType === "bar" ? "primary" : "default"}
                      >
                        <BarChartIcon />
                      </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Line Chart">
                      <IconButton
                        onClick={() => setChartType("line")}
                        color={chartType === "line" ? "primary" : "default"}
                      >
                        <LineChartIcon />
                      </IconButton>
                    </MuiTooltip>
                  </Box>
                </Box>

                {/* charts go here  */}
                <Box sx={{ width: "100%" }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                      <BarChart
                        data={getExamPerformanceData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fill: theme.palette.text.secondary }}
                        />
                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            border: "none",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 15 }} />
                        <Bar
                          dataKey="avgScore"
                          name="Avg Score (%)"
                          fill={CHART_COLORS.primary}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="attempts"
                          name="Attempts"
                          fill={CHART_COLORS.secondary}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={getExamPerformanceData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fill: theme.palette.text.secondary }}
                        />
                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            border: "none",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 15 }} />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          name="Avg Score (%)"
                          stroke={CHART_COLORS.primary}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="attempts"
                          name="Attempts"
                          stroke={CHART_COLORS.secondary}
                          activeDot={{ r: 6 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Exam Grid */}
            <Box className="mb-4">
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontSize: 40,
                  mb: 6,
                  color: theme.palette.text.primary,
                }}
                className="mb-6 flex items-center justify-center"
              >
                Available Exams
              </Typography>

              <Grid container spacing={3}>
                {exams.map((exam) => (
                  <Grid item xs={12} sm={6} md={4} key={exam.id}>
                    <Card
                      className="h-full transition-all hover:shadow-lg cursor-pointer border-t-4"
                      sx={{ borderTopColor: CHART_COLORS.primary }}
                      onClick={() => handleExamSelect(exam.id)}
                    >
                      <CardContent>
                        <Box className="flex justify-between mb-3">
                          <Typography
                            variant="h6"
                            noWrap
                            className="font-medium"
                          >
                            {exam.title}
                          </Typography>
                          <Chip
                            label={`${exam.sessions_count || 0} Attempts`}
                            size="small"
                            color="primary"
                            sx={{
                              backgroundColor: `${CHART_COLORS.primary}40`,
                              color: CHART_COLORS.primary,
                            }}
                          />
                        </Box>

                        <Divider className="mb-3" />

                        <Grid container spacing={2} className="mt-1">
                          <Grid item xs={6}>
                            <Box className="flex flex-col">
                              <Typography
                                variant="caption"
                                className="text-gray-500"
                              >
                                Questions
                              </Typography>
                              <Typography
                                variant="body1"
                                className="font-medium"
                              >
                                {exam.question_count || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="flex flex-col">
                              <Typography
                                variant="caption"
                                className="text-gray-500"
                              >
                                Avg Score
                              </Typography>
                              <Typography
                                variant="body1"
                                className="font-medium"
                                sx={{
                                  color:
                                    exam.average_score > 70
                                      ? CHART_COLORS.correct
                                      : exam.average_score > 50
                                      ? CHART_COLORS.tertiary
                                      : CHART_COLORS.wrong,
                                }}
                              >
                                {(exam.average_score || 0).toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="flex flex-col">
                              <Typography
                                variant="caption"
                                className="text-gray-500"
                              >
                                Completion
                              </Typography>
                              <Typography
                                variant="body1"
                                className="font-medium"
                              >
                                {(exam.completion_rate || 0).toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="flex justify-end items-end h-full">
                              <Button
                                size="small"
                                variant="text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExamSelect(exam.id);
                                }}
                              >
                                Details ⇒
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        ) : (
          // Individual Exam Statistics View
          <Box>
            <Box className="mb-6">
              <Button
                color="dark"
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                onClick={handleBackToOverview}
              >
                Back to Overview
              </Button>
            </Box>

            <Card className="mb-8">
              <CardContent className="p-6">
                <Typography
                  variant="h5"
                  component="h1"
                  className="font-bold flex items-center"
                >
                  EXAM: {examStatistics?.title}
                  <Chip
                    label={`${examStatistics?.sessions_count || 0} Attempts`}
                    size="small"
                    className="ml-3"
                    sx={{
                      backgroundColor: `${CHART_COLORS.primary}20`,
                      padding: "20px 8px",
                      color: CHART_COLORS.primary,
                    }}
                  />
                </Typography>

                <Divider className="py-5" />

                {/* make the grids at center */}
                <Grid
                  container
                  spacing={3}
                  className="mb-6 mt-10 items-center justify-center"
                >
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      className="bg-gray-50 p-4 rounded-lg border-l-4"
                      sx={{ borderLeftColor: CHART_COLORS.primary }}
                    >
                      <Typography variant="caption" className="text-gray-500">
                        Average Score
                      </Typography>
                      <Typography variant="h5" className="font-bold mt-1">
                        {(examStatistics?.average_score || 0).toFixed(1)}%
                      </Typography>
                      <Box className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                        <Box
                          className="h-full"
                          sx={{
                            width: `${examStatistics?.average_score || 0}%`,
                            backgroundColor:
                              examStatistics?.average_score > 70
                                ? CHART_COLORS.correct
                                : examStatistics?.average_score > 50
                                ? CHART_COLORS.tertiary
                                : CHART_COLORS.wrong,
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      className="bg-gray-50 p-4 rounded-lg border-l-4"
                      sx={{ borderLeftColor: CHART_COLORS.secondary }}
                    >
                      <Typography variant="caption" className="text-gray-500">
                        Questions
                      </Typography>
                      <Typography variant="h5" className="font-bold mt-1">
                        {examStatistics?.question_count || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-500 mt-1"
                      >
                        Total questions in exam
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      className="bg-gray-50 p-4 rounded-lg border-l-4"
                      sx={{ borderLeftColor: CHART_COLORS.tertiary }}
                    >
                      <Typography variant="caption" className="text-gray-500">
                        Completion Rate
                      </Typography>
                      <Typography variant="h5" className="font-bold mt-1">
                        {(examStatistics?.completion_rate || 0).toFixed(1)}%
                      </Typography>
                      <Box className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                        <Box
                          className="h-full"
                          sx={{
                            width: `${examStatistics?.completion_rate || 0}%`,
                            backgroundColor: CHART_COLORS.tertiary,
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      className="bg-gray-50 p-4 rounded-lg border-l-4 flex flex-col h-full"
                      sx={{ borderLeftColor: CHART_COLORS.quaternary }}
                    >
                      <Typography variant="caption" className="text-gray-500">
                        Average Time
                      </Typography>
                      <Typography variant="h5" className="font-bold mt-1">
                        {examStatistics?.average_time || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-500 mt-1"
                      >
                        Minutes to complete
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  className="mb-4"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                    },
                    "& .Mui-selected": {
                      color: CHART_COLORS.primary,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: CHART_COLORS.primary,
                    },
                  }}
                >
                  <Tab
                    label="Overview"
                    icon={<BarChartIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Question Analysis"
                    icon={<PieChartIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Performance Insights"
                    icon={<LightbulbIcon />}
                    iconPosition="start"
                  />
                </Tabs>

                {selectedTab === 0 && (
                  <Grid className="mb-6 justify-center" container spacing={4}>
                    {/* Answer Distribution Chart */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" className="h-full">
                        <CardContent>
                          <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6" className="font-semibold">
                              Answer Distribution
                            </Typography>
                            <MuiTooltip title="Shows the breakdown of correct, wrong, and unanswered questions">
                              <InfoIcon fontSize="small" color="warning" />
                            </MuiTooltip>
                          </Box>
                          <Box className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getIndividualExamPerformance()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {getIndividualExamPerformance().map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          entry.color ||
                                          COLORS[index % COLORS.length]
                                        }
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    border: "none",
                                  }}
                                />
                                <Legend wrapperStyle={{ paddingTop: 15 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Time Distribution Chart */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" className="h-full">
                        <CardContent>
                          <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6" className="font-semibold">
                              Completion Time Distribution
                            </Typography>
                            <MuiTooltip title="Shows how long students took to complete the exam">
                              <InfoIcon fontSize="small" color="warning" />
                            </MuiTooltip>
                          </Box>
                          <Box className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getTimeDistributionData()}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  strokeOpacity={0.3}
                                />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fill: theme.palette.text.secondary }}
                                />
                                <YAxis
                                  tick={{ fill: theme.palette.text.secondary }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    border: "none",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="completions"
                                  name="Completions"
                                  fill={CHART_COLORS.quinary}
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Radar Chart */}
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6" className="font-semibold">
                              Performance Radar
                            </Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={showRadarChart}
                                  onChange={(e) =>
                                    setShowRadarChart(e.target.checked)
                                  }
                                  color="primary"
                                />
                              }
                              label="Show Advanced Analytics"
                            />
                          </Box>

                          {showRadarChart ? (
                            <Box className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                  outerRadius={90}
                                  data={getRadarChartData()}
                                >
                                  <PolarGrid strokeOpacity={0.3} />
                                  <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{
                                      fill: theme.palette.text.secondary,
                                    }}
                                  />
                                  <PolarRadiusAxis angle={30} domain={[0, 1]} />
                                  <Radar
                                    name="Performance"
                                    dataKey="value"
                                    stroke={CHART_COLORS.primary}
                                    fill={CHART_COLORS.primary}
                                    fillOpacity={0.5}
                                  />
                                  <Tooltip />
                                </RadarChart>
                              </ResponsiveContainer>
                            </Box>
                          ) : (
                            <Box className="h-72 flex flex-col items-center justify-center">
                              <RadarIcon
                                style={{
                                  fontSize: 60,
                                  color: theme.palette.text.secondary,
                                  opacity: 0.5,
                                }}
                              />
                              <Typography
                                variant="body1"
                                color="textSecondary"
                                className="mt-4"
                              >
                                Enable the advanced analytics to view the
                                performance radar chart
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={() => setShowRadarChart(true)}
                                className="mt-4"
                              >
                                Show Radar Chart
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {selectedTab === 1 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box className="flex justify-between items-center mb-4">
                        <Typography variant="h6" className="font-semibold">
                          Question Difficulty Analysis
                        </Typography>
                        <MuiTooltip title="Shows correct and attempt percentages per question">
                          <InfoIcon fontSize="small" color="action" />
                        </MuiTooltip>
                      </Box>
                      <Box className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getQuestionDifficultyData()}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              strokeOpacity={0.3}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: theme.palette.text.secondary }}
                            />
                            <YAxis
                              tick={{ fill: theme.palette.text.secondary }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                border: "none",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="correctPercentage"
                              name="Correct %"
                              fill={CHART_COLORS.correct}
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="attemptPercentage"
                              name="Attempt %"
                              fill={CHART_COLORS.tertiary}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>

                      <Box className="mt-6">
                        <Alert severity="info" icon={<InfoIcon />}>
                          <Typography variant="subtitle2">
                            How to read this chart:
                          </Typography>
                          <Typography variant="body2">
                            The "Correct %" shows how many students answered the
                            question correctly. The "Attempt %" shows how many
                            students attempted the question at all. Questions
                            with low correct percentage but high attempt
                            percentage may be too difficult.
                          </Typography>
                        </Alert>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {selectedTab === 2 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box className="flex justify-between items-center mb-4">
                        <Typography
                          variant="h6"
                          className="font-semibold flex items-center"
                        >
                          <LightbulbIcon
                            className="mr-2"
                            sx={{ color: CHART_COLORS.tertiary }}
                          />
                          AI Analysis & Suggestions
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={generateAiSuggestions}
                          disabled={suggestionsLoading}
                          startIcon={
                            suggestionsLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <HelpCircle size={20} />
                            )
                          }
                          sx={{
                            backgroundColor: CHART_COLORS.primary,
                            "&:hover": {
                              backgroundColor: CHART_COLORS.secondary,
                            },
                          }}
                        >
                          {suggestionsLoading
                            ? "Analyzing..."
                            : "Generate Insights"}
                        </Button>
                      </Box>

                      <Paper
                        variant="outlined"
                        className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto"
                        sx={{
                          backgroundColor: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {aiSuggestions ? (
                          <Box className="prose max-w-none">
                            {aiSuggestions.split("\n").map((paragraph, idx) => (
                              <Typography key={idx} variant="body1" paragraph>
                                {paragraph}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Box className="h-full flex flex-col items-center justify-center">
                            <LightbulbIcon
                              style={{
                                fontSize: 60,
                                color: CHART_COLORS.tertiary,
                                opacity: 0.5,
                              }}
                            />
                            <Typography
                              variant="body1"
                              color="textSecondary"
                              className="mt-4 text-center"
                            >
                              Click "Generate Insights" to get AI-powered
                              analysis of this exam's performance data.
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              className="mt-2 text-center max-w-md"
                            >
                              The AI will analyze question difficulty, student
                              performance patterns, and provide customized
                              recommendations for improving the exam.
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default StatisticsPage;
