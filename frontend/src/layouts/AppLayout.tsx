import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudIcon from "@mui/icons-material/Cloud";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { ROUTES } from "../constants/routes";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import { signOut } from "../services/auth";
import { useState } from "react";
import { useStore } from "../store";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  {
    label: "Console Access",
    icon: <CloudIcon />,
    path: ROUTES.CONSOLE_ACCESS,
  },
  { label: "Accounts", icon: <AccountTreeIcon />, path: ROUTES.ACCOUNTS },
  { label: "Groups", icon: <GroupIcon />, path: ROUTES.GROUPS },
  { label: "Violations", icon: <SecurityIcon />, path: ROUTES.VIOLATIONS },
  { label: "Settings", icon: <SettingsIcon />, path: ROUTES.SETTINGS },
];

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "secondary.main" }}
        >
          Isengard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              "&.Mui-selected": {
                bgcolor: "primary.light",
                color: "white",
                "& .MuiListItemIcon-root": { color: "white" },
              },
              "&.Mui-selected:hover": {
                bgcolor: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            Isengard
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
