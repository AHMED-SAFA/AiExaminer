/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   PieChart, Pie, Cell, LineChart, Line
// } from 'recharts';
// import { AlertCircle, CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp, BookOpen, Award, Loader } from 'lucide-react';

// const StatisticsPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [exams, setExams] = useState([]);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [examSessions, setExamSessions] = useState([]);
//   const [suggestions, setSuggestions] = useState("");
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);
//   const [statsType, setStatsType] = useState('overall');
//   const [expandedExam, setExpandedExam] = useState(null);

//   // Colors for charts
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

//   useEffect(() => {
//     // Fetch all exams when component mounts
//     fetchExams();
//   }, []);

//   useEffect(() => {
//     // Fetch exam sessions when a specific exam is selected
//     if (selectedExam) {
//       fetchExamSessions(selectedExam);
//     }
//   }, [selectedExam]);

//   const fetchExams = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('/api/exams/');
//       setExams(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching exams:', error);
//       setLoading(false);
//     }
//   };

//   const fetchExamSessions = async (examId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/api/exams/${examId}/sessions/`);
//       setExamSessions(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching exam sessions:', error);
//       setLoading(false);
//     }
//   };

//   const generateSuggestions = async (examId) => {
//     try {
//       setLoadingSuggestions(true);
//       const response = await axios.post(`/api/exams/${examId}/generate-suggestions/`);
//       setSuggestions(response.data.suggestions);
//       setLoadingSuggestions(false);
//     } catch (error) {
//       console.error('Error generating suggestions:', error);
//       setLoadingSuggestions(false);
//       setSuggestions("Failed to generate suggestions. Please try again later.");
//     }
//   };

//   const toggleExamDetails = (examId) => {
//     if (expandedExam === examId) {
//       setExpandedExam(null);
//     } else {
//       setExpandedExam(examId);
//       setSelectedExam(examId);
//     }
//   };

//   // Format date for better display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Calculate overall statistics across all exams
//   const calculateOverallStats = () => {
//     if (exams.length === 0) return null;

//     const totalSessions = exams.reduce((acc, exam) => {
//       return acc + (exam.sessions ? exam.sessions.length : 0);
//     }, 0);

//     const totalCompletedSessions = exams.reduce((acc, exam) => {
//       return acc + (exam.sessions ? exam.sessions.filter(s => s.is_completed).length : 0);
//     }, 0);

//     const averageScore = exams.reduce((acc, exam) => {
//       const examScores = exam.sessions ? exam.sessions.filter(s => s.score !== null).map(s => s.score) : [];
//       const examAvg = examScores.length > 0 ? examScores.reduce((sum, score) => sum + score, 0) / examScores.length : 0;
//       return acc + examAvg;
//     }, 0) / (exams.length || 1);

//     return {
//       totalExams: exams.length,
//       totalSessions,
//       totalCompletedSessions,
//       averageScore: averageScore.toFixed(2),
//     };
//   };

//   // Prepare data for BarChart displaying exam scores
//   const prepareScoreDistributionData = () => {
//     if (!examSessions || examSessions.length === 0) return [];

//     const scoreRanges = [
//       { name: '0-20%', count: 0 },
//       { name: '21-40%', count: 0 },
//       { name: '41-60%', count: 0 },
//       { name: '61-80%', count: 0 },
//       { name: '81-100%', count: 0 },
//     ];

//     examSessions.forEach(session => {
//       if (session.score !== null) {
//         const scorePercentage = (session.score / selectedExam.total_marks) * 100;
//         if (scorePercentage <= 20) scoreRanges[0].count++;
//         else if (scorePercentage <= 40) scoreRanges[1].count++;
//         else if (scorePercentage <= 60) scoreRanges[2].count++;
//         else if (scorePercentage <= 80) scoreRanges[3].count++;
//         else scoreRanges[4].count++;
//       }
//     });

//     return scoreRanges;
//   };

//   // Prepare data for PieChart showing answer distribution
//   const prepareAnswerDistributionData = () => {
//     if (!examSessions || examSessions.length === 0) return [];

//     let totalCorrect = 0;
//     let totalWrong = 0;
//     let totalUnanswered = 0;

//     examSessions.forEach(session => {
//       totalCorrect += session.corrected_ans || 0;
//       totalWrong += session.wrong_ans || 0;
//       totalUnanswered += session.unanswered || 0;
//     });

//     return [
//       { name: 'Correct', value: totalCorrect },
//       { name: 'Wrong', value: totalWrong },
//       { name: 'Unanswered', value: totalUnanswered },
//     ];
//   };

//   // Prepare data for line chart showing performance over time
//   const preparePerformanceOverTimeData = () => {
//     if (!examSessions || examSessions.length === 0) return [];

//     // Sort sessions by start time
//     const sortedSessions = [...examSessions].sort((a, b) =>
//       new Date(a.start_time) - new Date(b.start_time)
//     );

//     return sortedSessions.map(session => ({
//       date: formatDate(session.start_time),
//       score: session.score || 0,
//       username: session.user.username,
//     }));
//   };

//   // Prepare data for overall exam comparison
//   const prepareExamComparisonData = () => {
//     return exams.map(exam => {
//       const sessions = exam.sessions || [];
//       const completedSessions = sessions.filter(s => s.is_completed);
//       const averageScore = completedSessions.length > 0 ?
//         completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length :
//         0;

//       return {
//         name: exam.title.length > 15 ? exam.title.substring(0, 15) + '...' : exam.title,
//         sessions: sessions.length,
//         avgScore: averageScore.toFixed(1),
//       };
//     });
//   };

//   const overallStats = calculateOverallStats();

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam Statistics Dashboard</h1>

//       {/* Stats Type Selector */}
//       <div className="mb-6 flex space-x-4">
//         <button
//           className={`px-4 py-2 rounded-md ${statsType === 'overall' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//           onClick={() => setStatsType('overall')}
//         >
//           Overall Statistics
//         </button>
//         <button
//           className={`px-4 py-2 rounded-md ${statsType === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//           onClick={() => setStatsType('individual')}
//         >
//           Individual Exam Analysis
//         </button>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader className="animate-spin h-8 w-8 text-blue-600" />
//           <span className="ml-2 text-lg">Loading statistics...</span>
//         </div>
//       ) : (
//         <>
//           {statsType === 'overall' ? (
//             <div className="space-y-8">
//               {/* Overview Cards */}
//               {overallStats && (
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                   <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <BookOpen className="text-blue-600 h-6 w-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Total Exams</p>
//                       <p className="text-2xl font-bold">{overallStats.totalExams}</p>
//                     </div>
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
//                     <div className="bg-green-100 p-3 rounded-full">
//                       <Award className="text-green-600 h-6 w-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Exam Sessions</p>
//                       <p className="text-2xl font-bold">{overallStats.totalSessions}</p>
//                     </div>
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
//                     <div className="bg-purple-100 p-3 rounded-full">
//                       <CheckCircle className="text-purple-600 h-6 w-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Completed</p>
//                       <p className="text-2xl font-bold">{overallStats.totalCompletedSessions}</p>
//                     </div>
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
//                     <div className="bg-yellow-100 p-3 rounded-full">
//                       <AlertCircle className="text-yellow-600 h-6 w-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Avg. Score</p>
//                       <p className="text-2xl font-bold">{overallStats.averageScore}%</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Exam Performance Comparison Chart */}
//               <div className="bg-white p-6 rounded-lg shadow mb-8">
//                 <h2 className="text-xl font-semibold mb-4">Exam Performance Comparison</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart
//                     data={prepareExamComparisonData()}
//                     margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
//                     <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
//                     <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
//                     <Tooltip />
//                     <Legend />
//                     <Bar yAxisId="left" dataKey="sessions" name="Number of Sessions" fill="#8884d8" />
//                     <Bar yAxisId="right" dataKey="avgScore" name="Average Score (%)" fill="#82ca9d" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               {/* List of all exams */}
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h2 className="text-xl font-semibold mb-4">All Exams</h2>
//                 <ul className="divide-y divide-gray-200">
//                   {exams.map((exam) => (
//                     <li key={exam.id} className="py-4">
//                       <div
//                         className="flex justify-between items-center cursor-pointer"
//                         onClick={() => toggleExamDetails(exam.id)}
//                       >
//                         <div>
//                           <h3 className="text-lg font-medium">{exam.title}</h3>
//                           <p className="text-sm text-gray-500">Created: {formatDate(exam.created_at)}</p>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="mr-4 text-sm text-gray-600">
//                             {exam.sessions ? exam.sessions.length : 0} sessions
//                           </span>
//                           {expandedExam === exam.id ? (
//                             <ChevronUp className="h-5 w-5 text-gray-500" />
//                           ) : (
//                             <ChevronDown className="h-5 w-5 text-gray-500" />
//                           )}
//                         </div>
//                       </div>

//                       {expandedExam === exam.id && (
//                         <div className="mt-4 pl-4 border-l-2 border-blue-200">
//                           <p><span className="font-medium">Total Marks:</span> {exam.total_marks}</p>
//                           <p><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
//                           <p><span className="font-medium">Questions:</span> {exam.question_count || 'N/A'}</p>
//                           <button
//                             className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setSelectedExam(exam);
//                               setStatsType('individual');
//                             }}
//                           >
//                             View Detailed Statistics
//                           </button>
//                         </div>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           ) : (
//             <div>
//               {/* Individual Exam Analysis */}
//               <div className="mb-6">
//                 <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700 mb-1">
//                   Select an Exam:
//                 </label>
//                 <select
//                   id="exam-select"
//                   className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={selectedExam?.id || ''}
//                   onChange={(e) => {
//                     const examId = e.target.value;
//                     const exam = exams.find(ex => ex.id.toString() === examId);
//                     setSelectedExam(exam);
//                   }}
//                 >
//                   <option value="">-- Select an Exam --</option>
//                   {exams.map((exam) => (
//                     <option key={exam.id} value={exam.id}>{exam.title}</option>
//                   ))}
//                 </select>
//               </div>

//               {selectedExam ? (
//                 <div className="space-y-8">
//                   <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-4">{selectedExam.title} - Overview</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                       <div className="bg-gray-50 p-4 rounded">
//                         <p className="text-sm text-gray-600">Total Sessions</p>
//                         <p className="text-xl font-bold">{examSessions.length}</p>
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded">
//                         <p className="text-sm text-gray-600">Completed</p>
//                         <p className="text-xl font-bold">
//                           {examSessions.filter(s => s.is_completed).length}
//                         </p>
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded">
//                         <p className="text-sm text-gray-600">Avg. Score</p>
//                         <p className="text-xl font-bold">
//                           {examSessions.length > 0 ?
//                             (examSessions.reduce((sum, s) => sum + (s.score || 0), 0) / examSessions.length).toFixed(2) :
//                             'N/A'}
//                         </p>
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded">
//                         <p className="text-sm text-gray-600">Questions</p>
//                         <p className="text-xl font-bold">{selectedExam.question_count || 'N/A'}</p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                       {/* Score Distribution Chart */}
//                       <div>
//                         <h3 className="text-lg font-medium mb-3">Score Distribution</h3>
//                         <ResponsiveContainer width="100%" height={300}>
//                           <BarChart
//                             data={prepareScoreDistributionData()}
//                             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                           >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="name" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="count" name="Students" fill="#8884d8" />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>

//                       {/* Answer Distribution Pie Chart */}
//                       <div>
//                         <h3 className="text-lg font-medium mb-3">Answer Distribution</h3>
//                         <ResponsiveContainer width="100%" height={300}>
//                           <PieChart>
//                             <Pie
//                               data={prepareAnswerDistributionData()}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               outerRadius={100}
//                               fill="#8884d8"
//                               dataKey="value"
//                               label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                             >
//                               {prepareAnswerDistributionData().map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Performance Over Time */}
//                   <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <LineChart
//                         data={preparePerformanceOverTimeData()}
//                         margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                       >
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="date" />
//                         <YAxis />
//                         <Tooltip />
//                         <Legend />
//                         <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>

//                   {/* AI Generated Suggestions */}
//                   <div className="bg-white p-6 rounded-lg shadow">
//                     <div className="flex justify-between items-center mb-4">
//                       <h2 className="text-xl font-semibold">AI-Generated Insights</h2>
//                       <button
//                         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
//                         onClick={() => generateSuggestions(selectedExam.id)}
//                         disabled={loadingSuggestions}
//                       >
//                         {loadingSuggestions ? (
//                           <>
//                             <Loader className="animate-spin h-4 w-4" />
//                             <span>Generating...</span>
//                           </>
//                         ) : (
//                           <span>Generate Insights</span>
//                         )}
//                       </button>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded min-h-40">
//                       {suggestions ? (
//                         <div className="prose max-w-none">
//                           {suggestions.split('\n').map((paragraph, idx) => (
//                             <p key={idx}>{paragraph}</p>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-gray-500 italic">
//                           Click "Generate Insights" to get AI-powered analysis of this exam's performance data.
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Session Details */}
//                   <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-4">Detailed Session Results</h2>
//                     {examSessions.length > 0 ? (
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                           <thead className="bg-gray-50">
//                             <tr>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 User
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Date
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Score
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Correct
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Wrong
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Unanswered
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Status
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-gray-200">
//                             {examSessions.map((session) => (
//                               <tr key={session.id}>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   {session.user.username}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   {formatDate(session.start_time)}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   {session.score !== null ? session.score : 'N/A'}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   <span className="flex items-center">
//                                     <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
//                                     {session.corrected_ans || 0}
//                                   </span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   <span className="flex items-center">
//                                     <XCircle className="h-4 w-4 text-red-500 mr-1" />
//                                     {session.wrong_ans || 0}
//                                   </span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   <span className="flex items-center">
//                                     <HelpCircle className="h-4 w-4 text-gray-500 mr-1" />
//                                     {session.unanswered || 0}
//                                   </span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                   <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                     session.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                                   }`}>
//                                     {session.is_completed ? 'Completed' : 'In Progress'}
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     ) : (
//                       <p className="text-gray-500 italic">No sessions found for this exam.</p>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-white p-6 rounded-lg shadow text-center">
//                   <p className="text-gray-600">Please select an exam to view detailed statistics.</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default StatisticsPage;

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
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, BarChart3, HelpCircle, AlertTriangle } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [viewType, setViewType] = useState("overall");
  const [chartType, setChartType] = useState("bar");
  const [examStatistics, setExamStatistics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

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
      console.log(
        "response form frtch exam from StatisticsPage",
        response.data
      );
      setExams(response.data);
    } catch (err) {
      setError("Failed to load exams data");
      console.error("Error fetching exams data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId);
    setViewType("individual");
    setChartType("bar");

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
      console.log("response from handleExamSelect:", response.data);
      setExamStatistics(response.data);
    } catch (err) {
      setError("Failed to load individual exam statistics");
      console.error("Error fetching exam statistics:", err);
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
      { name: "Total Exams", value: totalExams },
      { name: "Total Questions", value: totalQuestions },
      { name: "Total Attempts", value: totalSessions },
      { name: "Avg Score (%)", value: avgScore.toFixed(2) },
      { name: "Completion Rate (%)", value: completionRate.toFixed(2) },
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
      { name: "Correct", value: examStatistics.average_correct || 0 },
      { name: "Wrong", value: examStatistics.average_wrong || 0 },
      { name: "Unanswered", value: examStatistics.average_unanswered || 0 },
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

  const generateAiSuggestions = async () => {
    if (!examStatistics) return;

    setSuggestionsLoading(true);
    try {
      // Call the backend API that interfaces with Gemini
      const response = await axios.post(
        "http://127.0.0.1:8000/api/exam-statistics/generate-suggestions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          examId: selectedExam,
          stats: examStatistics,
        }
      );
      console.log("response from generateAiSuggestions:", response.data);

      setAiSuggestions(response.data.suggestions);
    } catch (err) {
      setAiSuggestions(
        "Failed to generate AI suggestions. Please try again later."
      );
      console.error("Error generating AI suggestions:", err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-medium">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <AlertTriangle size={48} />
        <div className="mt-4 text-lg font-medium">{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {viewType === "overall" ? (
        // Overall Exam Statistics View
        <>
          <h1 className="text-2xl font-bold mb-6">Exam Statistics Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {getOverallMetrics().map((metric, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-500">{metric.name}</div>
                <div className="text-2xl font-bold">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Exam Performance Comparison
              </h2>
              <div className="flex space-x-2">
                <button
                  className={`p-2 rounded ${
                    chartType === "bar"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 size={18} />
                </button>
                <button
                  className={`p-2 rounded ${
                    chartType === "line"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setChartType("line")}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18"></path>
                    <path d="M3 12h18"></path>
                    <path d="M3 6h18"></path>
                    <path d="M3 18h18"></path>
                    <path d="M16 16l-4-8-4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart
                    data={getExamPerformanceData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="avgScore"
                      name="Avg Score (%)"
                      fill="#0088FE"
                    />
                    <Bar dataKey="attempts" name="Attempts" fill="#00C49F" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={getExamPerformanceData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      name="Avg Score (%)"
                      stroke="#0088FE"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attempts"
                      name="Attempts"
                      stroke="#00C49F"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Available Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleExamSelect(exam.id)}
              >
                <h3 className="text-lg font-medium mb-2">{exam.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Questions</p>
                    <p className="font-medium">{exam.question_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Attempts</p>
                    <p className="font-medium">{exam.sessions_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Score</p>
                    <p className="font-medium">
                      {(exam.average_score || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    {" "}
                    <p className="text-gray-500">Completion</p>
                    <p className="font-medium">
                      {(exam.completion_rate || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Individual Exam Statistics View
        <>
          <div className="mb-6">
            <button
              onClick={handleBackToOverview}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back to Overview
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold mb-4">{examStatistics?.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Total Attempts</p>
                <p className="text-2xl font-bold">
                  {examStatistics?.sessions_count || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold">
                  {(examStatistics?.average_score || 0).toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-2xl font-bold">
                  {examStatistics?.question_count || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {(examStatistics?.completion_rate || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Answer Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  Answer Distribution
                </h3>
                <div className="h-64">
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
                        {getIndividualExamPerformance().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Difficulty Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  Question Difficulty Analysis
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getQuestionDifficultyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="correctPercentage"
                        name="Correct %"
                        fill="#0088FE"
                      />
                      <Bar
                        dataKey="attemptPercentage"
                        name="Attempt %"
                        fill="#00C49F"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  Completion Time Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimeDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completions"
                        name="Completions"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Suggestions Section */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    AI Analysis & Suggestions
                  </h3>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                    onClick={generateAiSuggestions}
                    disabled={suggestionsLoading}
                  >
                    {suggestionsLoading ? (
                      <>
                        <HelpCircle className="animate-spin mr-2" size={16} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <HelpCircle className="mr-2" size={16} />
                        Get Insights
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded min-h-[200px] max-h-[300px] overflow-y-auto">
                  {aiSuggestions ? (
                    <div className="prose max-w-none">
                      {aiSuggestions.split("\n").map((paragraph, idx) => (
                        <p key={idx} className="mb-2">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Click "Generate Insights" to get AI-powered analysis of
                      this exam's performance data.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatisticsPage;
