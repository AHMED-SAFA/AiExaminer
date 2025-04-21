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
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import { motion } from "framer-motion";

const Home = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched userData:", response.data);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
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
      <Box
        onClick={() => navigate("/create/exam")}
        component={Paper}
        elevation={3}
        cursor="pointer"
        hoverElevation={6}
        sx={{
          width: "100%",
          maxWidth: 600,
          padding: 4,
          borderRadius: 2,
          background: "rgba(0, 0, 0, 0.37)",
          backdropFilter: "blur(10px)",
          hover: {
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            cursor: "pointer",
            shadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
          },
        }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: "white", fontWeight: "bold" }}
        >
          Make Exam
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
