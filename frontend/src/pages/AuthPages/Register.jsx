
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
  Avatar,
  InputLabel,
  OutlinedInput,
  FormControl,
  InputAdornment,
  IconButton,
  Paper,
  Container,
  Badge,
  Divider,
} from "@mui/material";
import { PhotoCamera, Visibility, VisibilityOff, PersonAddAlt } from "@mui/icons-material";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
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

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);

      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Create a FormData object to send both text fields and the image
      const submitData = new FormData();
      submitData.append("email", formData.email);
      submitData.append("username", formData.username);
      submitData.append("password", formData.password);
      submitData.append("password2", formData.password2);

      // Only append image if one was selected
      if (image) {
        submitData.append("image", image);
      }

      const result = await register(submitData);
      if (result.success) {
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        setError(
          result.error?.email?.[0] ||
            result.error?.username?.[0] ||
            result.error?.image?.[0] ||
            "Registration failed. Please try again."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
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
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, rgb(0, 93, 133) 0%, rgb(0, 181, 149) 90%)",
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
                      background: "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
                      padding: "10px",
                      mb: 2,
                      boxShadow: "0 4px 20px rgba(0, 93, 133, 0.3)",
                    }}
                  >
                    <PersonAddAlt
                      sx={{ fontSize: 40, color: "#ffffff" }}
                    />
                  </Box>
                  <Typography 
                    component="h1" 
                    variant="h4" 
                    fontWeight="bold"
                    color="#005d85"
                    sx={{ 
                      letterSpacing: "0.5px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Join our community today
                  </Typography>
                </Box>
              </motion.div>

              <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                {/* Profile Image Upload */}
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <label htmlFor="upload-photo">
                          <input
                            accept="image/*"
                            id="upload-photo"
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                          <IconButton
                            component="span"
                            sx={{
                              bgcolor: "#00b595",
                              color: "white",
                              border: "2px solid white",
                              "&:hover": { bgcolor: "#005d85" },
                              width: 36,
                              height: 36,
                            }}
                          >
                            <PhotoCamera fontSize="small" />
                          </IconButton>
                        </label>
                      }
                    >
                      <Avatar
                        src={previewImage}
                        sx={{
                          width: 110,
                          height: 110,
                          border: "3px solid white",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                      />
                    </Badge>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Upload profile picture
                    </Typography>
                  </Box>
                </motion.div>

                <Divider sx={{ mb: 3, borderColor: "rgba(0,0,0,0.1)" }} />

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
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
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
                        }
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
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
                        }
                      },
                    }}
                  />
                </motion.div>

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
                        }
                      },
                    }}
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      Password*
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      name="password"
                      required
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
                      label="Password"
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
                        }
                      },
                    }}
                  >
                    <InputLabel htmlFor="outlined-adornment-password2">
                      Confirm Password*
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password2"
                      type={showPassword ? "text" : "password"}
                      value={formData.password2}
                      onChange={handleChange}
                      name="password2"
                      required
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
                      label="Confirm Password"
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
                      background: "linear-gradient(45deg, #005d85 30%, #00b595 90%)",
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
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        animation: "shine 1.5s infinite",
                      },
                      "@keyframes shine": {
                        "0%": { left: "-100%" },
                        "100%": { left: "100%" }
                      },
                      transition: "all 0.3s ease",
                    }}
                    endIcon={!isLoading && <PersonAddAlt />}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        style={{
                          color: "#005d85",
                          textDecoration: "none",
                          fontWeight: 600,
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#00b595"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#005d85"}
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

export default Register;