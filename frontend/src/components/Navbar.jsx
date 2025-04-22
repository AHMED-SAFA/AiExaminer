/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  styled,
  useTheme,
  Box,
  Menu,
  MenuItem,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const menuId = "primary-search-account-menu";
  const mobileMenuId = "primary-search-account-menu-mobile";
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data from navbar:", error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const renderAccountMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          {userData?.image ? (
            <Avatar
              src={userData.image}
              alt="Profile"
              sx={{ width: 24, height: 24 }}
            />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <LogoutIcon />
        </IconButton>
        Logout
      </MenuItem>
    </Menu>
  );

  const mobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          {userData?.image ? (
            <Avatar
              src={userData.image}
              alt="Profile"
              sx={{ width: 24, height: 24 }}
            />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <IconButton size="large" aria-label="logout" color="inherit">
          <LogoutIcon />
        </IconButton>
        <p>Logout</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "black", py: 1.5 }}>
        <Toolbar>
          <IconButton
            size="large"
            color="inherit"
            edge="start"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            sx={{
              p: 3,
              my: 1,
              display: { xs: "flex", md: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: 600 }}
              >
                AiExam
              </Typography>
            </Link>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontWeight: 500,
                backgroundColor: "indigo",
                cursor: "pointer",
                px: 2,
                py: 1,
                borderRadius: 1,
                color: "white",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
                transition: "background-color 0.3s ease",
              }}
            >
              <Link to="/create-exam" style={{ textDecoration: "none" }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 600, color: "white" }}
                >
                  Create Exam
                </Typography>
              </Link>
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontWeight: 500,
                backgroundColor: "indigo",
                cursor: "pointer",
                px: 2,
                py: 1,
                borderRadius: 1,
                color: "white",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
                transition: "background-color 0.3s ease",
              }}
            >
              <Link to="/previous-exams" style={{ textDecoration: "none" }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 600, color: "white" }}
                >
                  Previous Exams
                </Typography>
              </Link>
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontWeight: 500,
                backgroundColor: "indigo",
                cursor: "pointer",
                px: 2,
                py: 1,
                borderRadius: 1,
                color: "white",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
                transition: "background-color 0.3s ease",
              }}
            >
              <Link to="/statistics" style={{ textDecoration: "none" }}>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 600, color: "white" }}
                >
                  Statistics
                </Typography>
              </Link>
            </Typography>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {userData?.image ? (
                <Avatar
                  src={userData.image}
                  alt="Profile"
                  sx={{ width: 40, height: 40 }}
                />
              ) : (
                <AccountCircle sx={{ width: 40, height: 40 }} />
              )}
            </IconButton>
          </Box>

          {/* Mobile More Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
          display: { xs: "block", md: "none" },
        }}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, textAlign: "center", fontWeight: 700 }}
          >
            AiExam
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ my: 1, backgroundColor: "rgba(9, 9, 9, 0.4)" }} />

        <List>
          {/* Navigation Items */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/create-exam"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Create Exam" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/previous-exams"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Previous Exams" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/statistics"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Statistics" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, backgroundColor: "rgba(9, 9, 9, 0.4)" }} />

          {/* Profile */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/profile"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Profile" />
              <ListItemIcon>
                {userData?.image ? (
                  <Avatar
                    src={userData.image}
                    alt="Profile"
                    sx={{ width: 24, height: 24 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          {/* Messages */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleDrawerClose}>
              <ListItemText primary="Messages" />
              <ListItemIcon>
                <Badge badgeContent={4} color="error">
                  <MailIcon />
                </Badge>
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          {/* Notifications */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleDrawerClose}>
              <ListItemText primary="Notifications" />
              <ListItemIcon>
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {mobileMenu}
      {renderAccountMenu}
    </Box>
  );
}
