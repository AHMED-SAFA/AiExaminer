import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Code,
  Psychology,
} from "@mui/icons-material";

const Footer = () => {
  const [year] = useState(new Date().getFullYear());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const socialLinks = [
    {
      icon: <Facebook />,
      name: "Facebook",
      url: "https://www.facebook.com/ahmed.ne.safa",
      color: "#1877F2",
    },
    {
      icon: <LinkedIn />,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/ahmedsafa114/",
      color: "#0A66C2",
    },
    {
      icon: <GitHub />,
      name: "GitHub",
      url: "https://github.com/AHMED-SAFA",
      color: "#333",
    },
    {
      icon: <Instagram />,
      name: "Instagram",
      url: "https://github.com/AHMED-SAFA",
      color: "#E4405F",
    },
    {
      icon: <Twitter />,
      name: "Twitter",
      url: "https://github.com/AHMED-SAFA",
      color: "#1DA1F2",
    },
  ];

  // Updated quickLinks with actual URLs
  const quickLinks = [
    { name: "Home", url: "/" },
    { name: "Exam Prep", url: "/" },
  ];

  const resourceLinks = [{ name: "Tutorials", url: "/tutorial" }];

  return (
    <Box
      className="w-full mt-auto relative overflow-hidden"
      sx={{
        background: isMobile
          ? "linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
          : "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isMobile
            ? "radial-gradient(circle at 50% 20%, rgba(88, 28, 135, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(67, 56, 202, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 80%, rgba(88, 28, 135, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(67, 56, 202, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.4) 50%, transparent 100%)",
          zIndex: 2,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 3,
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid container spacing={{ xs: 4, sm: 5, md: 6 }}>
          {/* Company Info */}
          <Grid item xs={12} md={5} lg={4}>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: { xs: 2, md: 3 },
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Typography
                  variant={isSmallMobile ? "h5" : isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(45deg, #ffffff 30%, #e0e7ff 60%, #c7d2fe 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                  }}
                >
                  AiExaminer
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                  fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                  mb: { xs: 3, md: 4 },
                  textAlign: { xs: "center", md: "left" },
                  maxWidth: { xs: "100%", md: "400px" },
                }}
              >
                Revolutionizing exam preparation with AI-powered tools.
                Empowering students and educators with intelligent assessment
                solutions since 2025.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-start" },
                  flexWrap: "wrap",
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {socialLinks.map((link, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: { xs: 44, sm: 48, md: 52 },
                      height: { xs: 44, sm: 48, md: 52 },
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: `${link.color}20`,
                        borderColor: `${link.color}40`,
                        color: link.color,
                        transform: "translateY(-3px) scale(1.05)",
                        boxShadow: `0 8px 25px ${link.color}30`,
                      },
                    }}
                    aria-label={link.name}
                  >
                    {link.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links & Resources */}
          <Grid
            item
            xs={12}
            md={4}
            lg={5}
            sx={{
              display: "flex",
              justifyContent: {
                xs: "center",
                md: "flex-center",
                lg: "flex-end",
              },
            }}
          >
            <Grid container spacing={{ xs: 3, sm: 4 }}>
              {/* Quick Links */}
              <Grid item xs={6} sm={6}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#ffffff",
                    mb: { xs: 2, md: 3 },
                    fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "30px",
                      height: "2px",
                      background: "linear-gradient(90deg, #a855f7, #3b82f6)",
                      borderRadius: "1px",
                    },
                  }}
                >
                  Quick Links
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1.5, md: 2 },
                  }}
                >
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.url}
                      className="text-white text-sm md:text-base inline-block relative transition-all duration-300 hover:text-amber-400 hover:translate-x-2 before:content-[''] before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-0.5 before:bg-amber-400 before:transition-all before:duration-300 hover:before:w-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Box>
              </Grid>

              {/* Resources */}
              <Grid item xs={6} sm={6}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#ffffff",
                    mb: { xs: 2, md: 3 },
                    fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "30px",
                      height: "2px",
                      background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                      borderRadius: "1px",
                    },
                  }}
                >
                  Resources
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1.5, md: 2 },
                  }}
                >
                  {resourceLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.url}
                      underline="none"
                      className="text-white text-sm md:text-base inline-block relative transition-all duration-300 hover:text-amber-400 hover:translate-x-2 before:content-[''] before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-0.5 before:bg-amber-400 before:transition-all before:duration-300 hover:before:w-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                mb: { xs: 2, md: 3 },
                fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                textAlign: { xs: "center", md: "left" },
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-8px",
                  left: { xs: "50%", md: 0 },
                  transform: { xs: "translateX(-50%)", md: "none" },
                  width: "40px",
                  height: "2px",
                  background: "linear-gradient(90deg, #06b6d4, #8b5cf6)",
                  borderRadius: "1px",
                },
              }}
            >
              Get In Touch
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(168, 85, 247, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Email
                  sx={{ color: "#fbbf24", mr: 2, fontSize: { xs: 20, md: 22 } }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#e2e8f0",
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                  }}
                >
                  aiexaminer0759@gmail.com
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(168, 85, 247, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Phone
                  sx={{ color: "#fbbf24", mr: 2, fontSize: { xs: 20, md: 22 } }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#e2e8f0",
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                  }}
                >
                  +880 1789-456123
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: { xs: "center", md: "flex-start" },
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(168, 85, 247, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <LocationOn
                  sx={{
                    color: "#fbbf24",
                    mr: 2,
                    mt: 0.2,
                    fontSize: { xs: 20, md: 22 },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#e2e8f0",
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  Banasree, Dhaka
                  <br />
                  Bangladesh
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: { xs: 4, sm: 5, md: 6 },
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            height: "1px",
          }}
        />

        {/* Copyright & Legal */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 3, md: 0 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Code
              sx={{ color: "#fbbf24", mr: 1.5, fontSize: { xs: 16, md: 18 } }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#cbd5e1",
                fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                fontWeight: 500,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              © {year} AiExaminer. Crafted in Bangladesh
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
