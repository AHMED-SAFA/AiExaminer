import { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  Link,
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
} from "@mui/icons-material";

const Footer = () => {
  const [year] = useState(new Date().getFullYear());

  const socialLinks = [
    { icon: <Facebook />, name: "Facebook" },
    { icon: <Twitter />, name: "Twitter" },
    { icon: <Instagram />, name: "Instagram" },
    { icon: <LinkedIn />, name: "LinkedIn" },
    { icon: <GitHub />, name: "GitHub" },
  ];

  const quickLinks = ["Home", "About Us", "Services", "Contact"];
  const resourceLinks = ["Documentation", "Blog", "FAQs", "Support"];
  const legalLinks = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

  return (
    <Box className="bg-gray-900 text-white w-full mt-auto py-12">
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid item xs={12} md={4} className="space-y-4">
            <Typography variant="h5" className="font-bold mb-4">
              Company Name
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-6">
              Building amazing digital experiences since 2023. We create
              innovative solutions to help businesses thrive in the digital
              landscape.
            </Typography>
            <Box className="flex space-x-2">
              {socialLinks.map((link, index) => (
                <IconButton
                  key={index}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label={link.name}
                >
                  {link.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links & Resources - Combined in one column on mobile, two on desktop */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={4}>
              {/* Quick Links */}
              <Grid item xs={6}>
                <Typography variant="h6" className="font-bold text-lg mb-4">
                  Quick Links
                </Typography>
                <Box className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      href="#"
                      underline="hover"
                      className="text-gray-400 hover:text-white block transition-colors duration-300"
                    >
                      {link}
                    </Link>
                  ))}
                </Box>
              </Grid>

              {/* Resources */}
              <Grid item xs={6}>
                <Typography variant="h6" className="font-bold text-lg mb-4">
                  Resources
                </Typography>
                <Box className="space-y-3">
                  {resourceLinks.map((link, index) => (
                    <Link
                      key={index}
                      href="#"
                      underline="hover"
                      className="text-gray-400 hover:text-white block transition-colors duration-300"
                    >
                      {link}
                    </Link>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-bold text-lg mb-4">
              Contact Us
            </Typography>
            <Box className="space-y-4">
              <Box className="flex items-center">
                <Email className="text-gray-400 mr-3" />
                <Typography variant="body2" className="text-gray-400">
                  contact@example.com
                </Typography>
              </Box>
              <Box className="flex items-center">
                <Phone className="text-gray-400 mr-3" />
                <Typography variant="body2" className="text-gray-400">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box className="flex items-start">
                <LocationOn className="text-gray-400 mr-3 mt-1" />
                <Typography variant="body2" className="text-gray-400">
                  123 Main Street, Suite 100
                  <br />
                  San Francisco, CA 94107
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider className="my-8 bg-gray-700" />

        {/* Copyright & Legal */}
        <Box className="flex flex-col md:flex-row justify-between items-center">
          <Typography variant="body2" className="text-gray-400 mb-4 md:mb-0">
            © {year} Company Name. All rights reserved.
          </Typography>
          <Box className="flex flex-wrap gap-6">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                href="#"
                underline="hover"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {link}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
