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
  TextField,
  Grid,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import BadgeIcon from "@mui/icons-material/Badge";
import { motion } from "framer-motion";

function Profile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    nationality: "",
    mobile: "",
    date_of_birth: "",
    image: null,
  });
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const profileImage = userData?.image || user?.image;
  const username = userData?.username || user?.username || "User";
  const email = userData?.email || user?.email || "";
  const isVerified = userData?.is_verified || user?.is_verified;
  const mobile = userData?.mobile || "Not set";
  const nationality = userData?.nationality || "Not set";
  const dob = userData?.date_of_birth
    ? new Date(userData.date_of_birth).toLocaleDateString()
    : "Not set";
  const date_joined = userData?.date_joined
    ? new Date(userData.date_joined).toLocaleDateString()
    : "";

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || "",
        nationality: userData.nationality || "",
        mobile: userData.mobile || "",
        date_of_birth: userData.date_of_birth || "",
        email: userData.email || user?.email || "",
      });
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);

      Object.keys(formData).forEach((key) => {
        if (
          key !== "email" &&
          key !== "image" &&
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (newImage) {
        formDataToSend.append("image", newImage);
      }

      const response = await axios.patch(
        "http://127.0.0.1:8000/api/profile/update-profile/",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMessage("Profile updated successfully!");
      setUserData(response.data);
      setIsEditing(false);
      setNewImage(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response && error.response.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value.join(", ")}`)
          .join("; ");
        setError(`Failed to update profile: ${errorMessages}`);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    }
  };

  const renderProfileContent = () => {
    if (isEditing) {
      return (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={newImage ? URL.createObjectURL(newImage) : profileImage}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {!newImage && !profileImage && (
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  )}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="image-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="image-upload">
                  <Button variant="outlined" component="span" size="small">
                    Change Photo
                  </Button>
                </label>
                {newImage && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => setNewImage(null)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Cancel
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary" mt={1}>
                  JPG, GIF or PNG. Max size 2MB
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              {error && (
                <Box
                  sx={{
                    backgroundColor: "error.light",
                    color: "error.contrastText",
                    p: 1.5,
                    borderRadius: 1,
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">{error}</Typography>
                  <IconButton size="small" onClick={() => setError(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <BadgeIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality || ""}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <PublicIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile || ""}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <PhoneAndroidIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <CalendarMonthIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email || ""}
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <EmailIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                    helperText="Email cannot be changed"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ px: 4 }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setNewImage(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        {successMessage && (
          <Box
            sx={{
              backgroundColor: "success.light",
              color: "success.contrastText",
              p: 1.5,
              borderRadius: 1,
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">{successMessage}</Typography>
            <IconButton size="small" onClick={() => setSuccessMessage(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={profileImage}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {!profileImage && <AccountCircleIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                size="small"
              >
                Edit Profile
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="h4" fontWeight={600}>
                  {username}
                </Typography>
                {isVerified && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" mb={2}>
                Member since {date_joined}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{email}</Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <PhoneAndroidIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mobile
                    </Typography>
                    <Typography>{mobile}</Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <PublicIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nationality
                    </Typography>
                    <Typography>{nationality}</Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <CalendarMonthIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography>{dob}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {!isVerified && (
              <Button
                variant="contained"
                startIcon={<HowToRegIcon />}
                onClick={() => navigate("/verify-email")}
                sx={{ mt: 3 }}
              >
                Verify Your Email
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(56, 49, 78)  0%, rgb(23, 150, 150) 100%)",
        py: 4,
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Fade in={!loading} timeout={500}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              backgroundColor: "background.paper",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header with gradient */}
            <Box
              sx={{
                height: 180,
                background: "linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)",
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                p: 3,
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                color="white"
                fontWeight={700}
                sx={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              >
                My Profile
              </Typography>
            </Box>

            {/* Main content */}
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              {renderProfileContent()}

              <Divider sx={{ my: 4 }} />

              {/* Account Overview */}
              <Typography variant="h5" fontWeight={600} mb={3}>
                Account Overview
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "primary.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <HowToRegIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Membership Status
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {isVerified ? (
                          <Chip label="Active" color="success" size="small" />
                        ) : (
                          <Chip
                            label="Pending Verification"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "secondary.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <BadgeIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Account Type
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        <Chip label="Standard" color="info" size="small" />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "success.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarMonthIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Member Since
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {date_joined}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
}

export default Profile;
