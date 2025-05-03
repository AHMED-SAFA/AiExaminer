import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { LockReset, Email, ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const success = await requestPasswordReset(email);
      if (success) {
        setMessage(
          "If an account with that email exists, we have sent a password reset link."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000); // Navigate after showing success message for 3 seconds
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
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
        padding: { xs: 2, md: 4 },
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
                background: "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
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
                background: "linear-gradient(45deg, #00b595 30%, #005d85 90%)",
                opacity: 0.2,
                zIndex: 0,
              }}
            />

            <Box sx={{ p: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
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
                    <LockReset sx={{ fontSize: 40, color: "#ffffff" }} />
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
                    Forgot Password
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    Enter your email address and we'll send you a link to reset
                    your password
                  </Typography>
                </Box>
              </motion.div>

              <Divider sx={{ mb: 3, borderColor: "rgba(0,0,0,0.1)" }} />

              {message && (
                <motion.div variants={itemVariants}>
                  <Alert
                    severity="success"
                    sx={{
                      width: "100%",
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                    }}
                  >
                    {message}
                  </Alert>
                </motion.div>
              )}

              {error && (
                <motion.div variants={itemVariants}>
                  <Alert
                    severity="error"
                    sx={{
                      width: "100%",
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                <motion.div variants={itemVariants}>
                  <FormControl
                    fullWidth
                    variant="outlined"
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
                  >
                    <InputLabel htmlFor="outlined-adornment-email">
                      Email Address*
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      name="email"
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <Email sx={{ color: "#005d85" }} />
                        </InputAdornment>
                      }
                      label="Email Address"
                      autoComplete="email"
                      autoFocus
                    />
                  </FormControl>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
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
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    startIcon={<ArrowBack />}
                    sx={{
                      mt: 2,
                      py: 1.8,
                      borderRadius: 3,
                      fontWeight: 600,
                      borderColor: "#005d85",
                      color: "#005d85",
                      "&:hover": {
                        borderColor: "#00b595",
                        backgroundColor: "rgba(0,181,149,0.04)",
                        transform: "translateX(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Back to Login
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Remember your password?{" "}
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

export default ForgotPassword;
