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
  const mobile = userData?.mobile || "Set Mobile Number";
  const nationality = userData?.nationality || "Set Nationality";
  const dob = userData?.date_of_birth || "Set Date of Birth";
  const date_joined =
    userData?.date_joined
      .split("T")[0]
      .split("-")
      .join("-")
      .slice(0, 10)
      .replace(/-/g, "-")
      .slice(0, 10) || "";

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
      console.log("Fetched userData from profile:", response.data);
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

      // Always include email in the form data since it's required by the backend
      formDataToSend.append("email", formData.email);

      // Include other text fields only if they have values
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

      // Only append image if a new one was selected
      if (newImage) {
        formDataToSend.append("image", newImage);
      }

      console.log("Sending form data:", Object.fromEntries(formDataToSend));

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
      console.log("Profile updated:", response.data);
      setSuccessMessage("Profile updated successfully!");
      setUserData(response.data);
      setIsEditing(false);
      setNewImage(null); // Reset the new image state
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response && error.response.data) {
        // More detailed error messages
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
        <Box sx={{ ml: { xs: 0, sm: 18 }, mt: { xs: 6, sm: 0 } }}>
          {error && (
            <Box
              sx={{
                display: "flex",
                p: 1,
                borderRadius: 1,
                backgroundColor: "#f8d7da",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body2" color="inherit">
                {error}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setError(null)}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <TextField
            fullWidth
            margin="normal"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="nationality"
            label="Nationality"
            value={formData.nationality || ""}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="mobile"
            label="Mobile"
            value={formData.mobile || ""}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth || ""}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          {/* Display email as read-only field */}
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            value={formData.email || ""}
            disabled
            InputProps={{
              readOnly: true,
            }}
            helperText="Email cannot be changed"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Profile Image
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={newImage ? URL.createObjectURL(newImage) : profileImage}
                sx={{ width: 60, height: 60 }}
              >
                {!newImage && !profileImage && <AccountCircleIcon />}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="image-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span">
                  {profileImage ? "Change Image" : "Upload Image"}
                </Button>
              </label>
              {newImage && (
                <Button
                  variant="text"
                  color="error"
                  onClick={() => setNewImage(null)}
                  size="small"
                >
                  Cancel
                </Button>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Image update is optional
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button variant="contained" onClick={handleSubmit} sx={{ mr: 1 }}>
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
        </Box>
      );
    }

    return (
      <Box sx={{ ml: { xs: 0, sm: 18 }, mt: { xs: 6, sm: 0 } }}>
        {/* display success message even in view mode */}
        {successMessage && (
          <Box
            sx={{
              display: "flex",
              p: 1,
              borderRadius: 1,
              backgroundColor: "lightgreen",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="inherit">
              {successMessage}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSuccessMessage(null)}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, mr: 2 }}
          >
            {username}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{
              backgroundColor: "#f0f2ff",
              "&:hover": { backgroundColor: "#e0e4ff" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            mb: 2,
            color: "text.secondary",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* email */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              color: "text.secondary",
            }}
          >
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{email}</Typography>
          </Box>
          {/* mobile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              color: "text.secondary",
            }}
          >
            <PhoneAndroidIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{mobile}</Typography>
          </Box>
        </Box>
        {/* nationality */}
        <Box
          sx={{
            mb: 2,
            color: "text.secondary",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              color: "text.secondary",
            }}
          >
            <PublicIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{nationality}</Typography>
          </Box>
          {/* date of birth */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              color: "text.secondary",
            }}
          >
            <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{dob}</Typography>
          </Box>
        </Box>

        <Chip
          icon={<VerifiedIcon />}
          label={"Email Verified"}
          color={"success"}
          variant={"filled"}
          sx={{ fontWeight: 500, mt: 1 }}
        />

        {!isVerified && (
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate("/verify-email")}
            sx={{ ml: 2, textTransform: "none", fontWeight: 500 }}
          >
            Verify Now
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,rgb(14, 26, 78) 0%,rgb(183, 132, 235) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        overflow: "hidden",
      }}
      component={motion.div}
      transition={{ duration: 0.6 }}
    >
      <Fade in={!loading} timeout={500}>
        <Box sx={{ mt: 6, mb: 6, width: "100%", maxWidth: "800px" }}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: "linear-gradient(to right bottom, #ffffff, #ffffff)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header Banner */}
            <Box
              sx={{
                height: 160,
                backgroundColor: "#293f61",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                p: 3,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                mb={4}
                align="center"
                color="white"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                Welcome, {username}!
              </Typography>
            </Box>

            {/* Profile Section */}
            <Box sx={{ position: "relative", px: 3, pt: 8, pb: 4 }}>
              <Avatar
                src={profileImage}
                alt={`${username}'s profile`}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "absolute",
                  top: -60,
                  left: 40,
                }}
              >
                {!profileImage && <AccountCircleIcon sx={{ fontSize: 80 }} />}
              </Avatar>

              {renderProfileContent()}
            </Box>

            <Divider sx={{ mx: 3 }} />

            {/* Dashboard Cards */}
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}
              >
                Account Overview
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Card
                  sx={{
                    flexGrow: 1,
                    minWidth: { xs: "100%", sm: "240px" },
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Membership Status
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {isVerified ? "Active" : "Pending Verification"}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flexGrow: 1,
                    minWidth: { xs: "100%", sm: "240px" },
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Account Type
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Standard
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flexGrow: 1,
                    minWidth: { xs: "100%", sm: "240px" },
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Member Since
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {date_joined}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
}

export default Profile;
