import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  LogOut,
  Settings,
  User,
  Home,
  Upload,
  BarChart,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/' },
    { text: 'Upload Data', icon: <Upload />, path: '/upload' },
    { text: 'Analytics', icon: <BarChart />, path: '/analytics' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ text: 'Admin Panel', icon: <Users />, path: '/admin' });
  }

  return (
    <>
      <AppBar position="fixed" className="bg-white text-gray-800">
        <Toolbar>
          {user && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              className="mr-2"
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" className="flex-grow font-bold">
            Marketing Dashboard
          </Typography>

          {user ? (
            <div className="flex items-center">
              <IconButton
                onClick={handleProfileMenu}
                size="small"
                className="ml-2"
              >
                <Avatar className="bg-blue-600">
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                className="mt-2"
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <div>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                className="mr-2"
              >
                Login
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        classes={{
          paper: 'w-64'
        }}
      >
        <div className="flex items-center justify-between p-4">
          <Typography variant="h6" className="font-bold">
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                handleDrawerToggle();
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;