/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Container,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Email, LockOutlined, MarkEmailRead } from "@mui/icons-material";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if email was passed via location state from registration
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const success = await verifyEmail(email, code);
      if (success) {
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err) {
      setError("An error occurred during verification. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 20%, rgb(0, 93, 133) 0%, rgb(0, 181, 149) 90%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, md: 2 },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #3f51b5 30%, #00b5a6 90%)",
                opacity: 0.2,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -50,
                left: -50,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #00b5a6 30%, #3f51b5 90%)",
                opacity: 0.2,
                zIndex: 0,
              }}
            />

            <Box sx={{ p: { xs: 3, md: 3 }, position: "relative", zIndex: 1 }}>
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
                      padding: "10px",
                      mb: 2,
                      boxShadow: "0 4px 20px rgba(0, 93, 133, 0.3)",
                    }}
                  >
                    <MarkEmailRead sx={{ fontSize: 40, color: "#ffffff" }} />
                  </Box>
                  <Typography
                    component="h1"
                    variant="h4"
                    fontWeight="bold"
                    color="#005d85"
                    sx={{
                      letterSpacing: "0.5px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    Verify Email
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Enter the verification code sent to your email
                  </Typography>
                </Box>
              </motion.div>

              <Divider sx={{ mb: 3, borderColor: "rgba(0,0,0,0.1)" }} />

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                {error && (
                  <motion.div variants={itemVariants}>
                    <Alert
                      severity="error"
                      sx={{
                        width: "100%",
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                {message && (
                  <motion.div variants={itemVariants}>
                    <Alert
                      severity="success"
                      sx={{
                        width: "100%",
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      }}
                    >
                      {message}
                    </Alert>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus={!email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "#005d85" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.9)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 0 0 2px rgba(0,181,149,0.2)",
                        },
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="code"
                    label="Verification Code"
                    name="code"
                    autoFocus={!!email}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: "#005d85" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.9)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 0 0 2px rgba(0,181,149,0.2)",
                        },
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      borderRadius: 3,
                      fontWeight: 600,
                      boxShadow: "0 4px 14px rgba(0,93,133,0.3)",
                      background:
                        "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(0,93,133,0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        animation: "shine 1.5s infinite",
                      },
                      "@keyframes shine": {
                        "0%": { left: "-100%" },
                        "100%": { left: "100%" },
                      },
                      transition: "all 0.3s ease",
                    }}
                    endIcon={!loading && <MarkEmailRead />}
                  >
                    {loading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already verified?{" "}
                      <Link
                        to="/login"
                        style={{
                          color: "#005d85",
                          textDecoration: "none",
                          fontWeight: 600,
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = "#00b595")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#005d85")
                        }
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
