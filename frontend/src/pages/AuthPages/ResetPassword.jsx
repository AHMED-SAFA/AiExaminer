/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
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
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Avatar,
} from "@mui/material";
import {
  LockReset,
  Visibility,
  VisibilityOff,
  Lock,
  Key,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Check token validity when component mounts
  useEffect(() => {
    const checkToken = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/auth/reset-password/${uidb64}/${token}/`
        );

        if (response.data.success) {
          setTokenValid(true);
          setEmail(response.data.email);
        } else {
          setError(
            response.data.error || "The reset link is invalid or has expired."
          );
          setTokenValid(false);
        }
      } catch (err) {
        console.log("Error from checkToken:", err);
        setError("The reset link is invalid or has expired.");
        setTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [uidb64, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.patch(
        "http://localhost:8000/api/auth/password-reset-complete/",
        {
          uidb64,
          token,
          password: formData.password,
          password2: formData.password2,
        }
      );

      if (response.data.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(
          response.data.error || "Password reset failed. Please try again."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Password reset failed. Please try again."
      );
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

  // Loading state
  if (isLoading && tokenValid === null) {
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
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              p: 4,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: "#005d85" }}
            />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
              Verifying reset link...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we validate your request
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
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
              <Box
                sx={{
                  position: "absolute",
                  top: -80,
                  right: -80,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
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
                  background:
                    "linear-gradient(45deg, #00b595 30%, #005d85 90%)",
                  opacity: 0.2,
                  zIndex: 0,
                }}
              />

              <Box
                sx={{ p: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}
              >
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
                      <Lock sx={{ fontSize: 40, color: "#ffffff" }} />
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
                      Invalid Reset Link
                    </Typography>
                  </Box>
                </motion.div>

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

                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ mb: 3, color: "text.secondary" }}
                  >
                    The password reset link may have expired or is invalid.
                    Please request a new password reset link.
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/login")}
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
                    Back to Login
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  // Valid token state - Form display
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
                    Reset Password
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Setting new password for <strong>{email}</strong>
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
                      mb: 2,
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
                    <InputLabel htmlFor="outlined-adornment-password">
                      New Password*
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      name="password"
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <Key sx={{ color: "#005d85" }} />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="New Password"
                      inputProps={{ minLength: 8 }}
                    />
                  </FormControl>
                </motion.div>

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
                    <InputLabel htmlFor="outlined-adornment-password2">
                      Confirm New Password*
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password2"
                      type={showPassword ? "text" : "password"}
                      value={formData.password2}
                      onChange={handleChange}
                      name="password2"
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <Key sx={{ color: "#005d85" }} />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Confirm New Password"
                      inputProps={{ minLength: 8 }}
                    />
                  </FormControl>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password must be at least 8 characters long and should
                      include letters, numbers and special characters.
                    </Typography>
                  </Box>
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
                    endIcon={!isLoading && <LockReset />}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
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

export default ResetPassword;
