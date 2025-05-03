/* eslint-disable no-unused-vars */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Container,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import { motion } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/");
      } else {
        if (result.error.includes("verified")) {
          setError(
            result.error + " Check your email for the verification code."
          );
          navigate("/verify-email");
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        console.log("Google sign-up successful");
        navigate("/");
      } else {
        if (result.error && result.error.includes("clock")) {
          setError(
            "Your computer's clock is not synchronized. Please update your system time and try again."
          );
        } else {
          setError(result.error || "Google sign-up failed. Please try again.");
        }
      }
    } catch (err) {
      if (err.message && err.message.includes("clock")) {
        setError(
          "Your computer's clock is not synchronized. Please update your system time and try again."
        );
      } else {
        setError("An unexpected error occurred during Google sign-up");
      }
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
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
                      mb: 1,
                      boxShadow: "0 4px 20px rgba(0, 93, 133, 0.3)",
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: 40, color: "#ffffff" }} />
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
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Sign in to continue your journey
                  </Typography>
                </Box>
              </motion.div>

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

              <motion.div variants={itemVariants}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    isGoogleLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <GoogleIcon sx={{ color: "#DB4437" }} />
                    )
                  }
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 500,
                    borderColor: "rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.9)",
                      borderColor: "#00b595",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,181,149,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    my: 3,
                  }}
                >
                  <Divider
                    sx={{ flexGrow: 1, borderColor: "rgba(0,0,0,0.1)" }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mx: 2, fontWeight: 500 }}
                  >
                    OR
                  </Typography>
                  <Divider
                    sx={{ flexGrow: 1, borderColor: "rgba(0,0,0,0.1)" }}
                  />
                </Box>
              </motion.div>

              <Box component="form" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                          boxShadow: "0 0 0 2px rgba(0, 181, 148, 0.13)",
                        },
                      },
                    }}
                  />
                </motion.div>

                {/* Password field */}
                <motion.div variants={itemVariants}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    InputProps={{
                      endAdornment: (
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
                      ),
                    }}
                  />
                </motion.div>

                {/* forgetPassword */}
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 3,
                    }}
                  >
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "#005d85",
                        textDecoration: "none",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#00b595")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#005d85")
                      }
                    >
                      Forgot password?
                    </Link>
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
                    endIcon={!isLoading && <LoginIcon />}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </Box>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
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
                      Sign Up
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
