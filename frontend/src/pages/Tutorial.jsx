import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayArrow,
  CreateNewFolder,
  Upload,
  Schedule,
  Grade,
  Quiz,
  AutoAwesome,
  PlayCircleOutline,
  CheckCircle,
  History,
  PictureAsPdf,
  Analytics,
  TrendingUp,
  NavigateNext,
  NavigateBefore,
  SmartToy,
  Close,
} from "@mui/icons-material";
import { Typography } from "@mui/material";

const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      id: 1,
      title: "Create Your Exam",
      description:
        "Start by setting up your exam with all necessary parameters",
      icon: <CreateNewFolder className="w-8 h-8" />,
      color: "from-blue-500 to-purple-600",
      details: [
        { icon: <CreateNewFolder />, text: "Enter exam name", highlight: true },
        {
          icon: <Upload />,
          text: "Upload file (TXT or PDF only)",
          highlight: true,
        },
        { icon: <Schedule />, text: "Set duration", highlight: false },
        {
          icon: <Grade />,
          text: "Configure total marks & per question marks",
          highlight: false,
        },
        {
          icon: <Quiz />,
          text: "Set MCQ options (optional minus marking)",
          highlight: false,
        },
      ],
    },
    {
      id: 2,
      title: "Generate Exam with AI",
      description: "Let our AI powered by GROQ & Llama create your exam",
      icon: <AutoAwesome className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600",
      details: [
        {
          icon: <AutoAwesome />,
          text: "Tap 'Generate Exam' button",
          highlight: true,
        },
        {
          icon: <PlayArrow />,
          text: "AI processes your content using GROQ API",
          highlight: false,
        },
        {
          icon: <CheckCircle />,
          text: "Wait for successful generation",
          highlight: false,
        },
      ],
    },
    {
      id: 3,
      title: "Take the Exam",
      description: "Start your exam session with an intuitive interface",
      icon: <PlayCircleOutline className="w-8 h-8" />,
      color: "from-green-500 to-teal-600",
      details: [
        {
          icon: <PlayCircleOutline />,
          text: "Tap 'Start Exam' to start",
          highlight: true,
        },
        {
          icon: <Quiz />,
          text: "Choose answers or leave blank",
          highlight: false,
        },
        {
          icon: <CheckCircle />,
          text: "Submit exam when completed",
          highlight: false,
        },
      ],
    },
    {
      id: 4,
      title: "Review Previous Exams",
      description: "Access your exam history and detailed results",
      icon: <History className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      details: [
        {
          icon: <History />,
          text: "Navigate to 'Previous Exams'",
          highlight: true,
        },
        {
          icon: <PictureAsPdf />,
          text: "Download exam answers as PDF",
          highlight: false,
        },
        {
          icon: <Grade />,
          text: "View detailed answer analysis",
          highlight: false,
        },
        { icon: <TrendingUp />, text: "Check marks summary", highlight: false },
      ],
    },
    {
      id: 5,
      title: "Analytics & Statistics",
      description: "Track your performance with comprehensive stats",
      icon: <Analytics className="w-8 h-8" />,
      color: "from-indigo-500 to-blue-600",
      details: [
        {
          icon: <Analytics />,
          text: "Access Statistics section",
          highlight: true,
        },
        {
          icon: <TrendingUp />,
          text: "View exam attempts & trends",
          highlight: false,
        },
        {
          icon: <Grade />,
          text: "Analyze right/wrong/unanswered charts",
          highlight: false,
        },
        {
          icon: <SmartToy />,
          text: "Generate Ai insights for performance analysis",
          highlight: false,
        },
      ],
    },
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % tutorialSteps.length);
  };

  const prevStep = () => {
    setCurrentStep(
      (prev) => (prev - 1 + tutorialSteps.length) % tutorialSteps.length
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 15,
      transition: { duration: 0.3 },
    },
  };

  const floatingVariants = {
    floating: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="text-center mb-12" variants={itemVariants}>
        <motion.h1
          className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          AiExaminer Tutorial
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          Master the art of AI-powered exam creation and analysis with our
          comprehensive guide
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div className="max-w-4xl mx-auto mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Main Tutorial Card */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tutorialSteps[currentStep].color} shadow-lg`}
                  variants={floatingVariants}
                  animate="floating"
                >
                  {tutorialSteps[currentStep].icon}
                </motion.div>

                <motion.h2
                  className="text-3xl font-bold text-white"
                  variants={itemVariants}
                >
                  {tutorialSteps[currentStep].title}
                </motion.h2>

                <motion.p
                  className="text-gray-300 text-lg leading-relaxed"
                  variants={itemVariants}
                >
                  {tutorialSteps[currentStep].description}
                </motion.p>
              </div>

              {/* Right Visual - Now with Details */}
              <motion.div className="relative" variants={itemVariants}>
                <motion.div
                  className={`aspect-square rounded-3xl bg-gradient-to-br ${tutorialSteps[currentStep].color} p-8 shadow-2xl`}
                  animate={{
                    boxShadow: [
                      "0 20px 50px rgba(0,0,0,0.3)",
                      "0 25px 60px rgba(0,0,0,0.4)",
                      "0 20px 50px rgba(0,0,0,0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white">
                    <motion.div
                      className="text-6xl mb-6"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {tutorialSteps[currentStep].icon}
                    </motion.div>

                    <div className="w-full space-y-3 max-h-64 overflow-y-auto pr-2">
                      {tutorialSteps[currentStep].details.map(
                        (detail, index) => (
                          <motion.div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              detail.highlight ? "bg-white/20" : "bg-white/10"
                            }`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                detail.highlight
                                  ? "bg-white text-purple-600"
                                  : "bg-white/20 text-white"
                              }`}
                            >
                              {React.cloneElement(detail.icon, {
                                className: "w-5 h-5",
                              })}
                            </div>
                            <Typography
                              variant="body1"
                              className={`${
                                detail.highlight ? "font-semibold" : ""
                              }`}
                            >
                              {detail.text}
                            </Typography>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full"
                  animate={{
                    y: [-5, 5, -5],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full"
                  animate={{
                    y: [5, -5, 5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          className="flex justify-between items-center mt-8"
          variants={itemVariants}
        >
          <motion.button
            onClick={prevStep}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentStep === 0}
          >
            <NavigateBefore />
            Previous
          </motion.button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-blue-500 scale-125"
                    : "bg-white/30"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          <motion.button
            onClick={nextStep}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
            <NavigateNext />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Tutorial;
