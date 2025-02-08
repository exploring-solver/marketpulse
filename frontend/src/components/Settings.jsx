import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Switch,
  Button,
  Divider,
  Avatar,
  Grid,
  FormControlLabel,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { User, Settings, Bell, Moon, Upload } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    position: '',
    phone: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/settings/profile');
      setProfile(response.data);
      if (response.data.avatar) {
        setAvatar(response.data.avatar);
      }
    } catch (error) {
      showNotification('Error loading profile', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/api/settings/profile', profile);
      showNotification('Profile updated successfully');
    } catch (error) {
      showNotification('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/api/settings/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatar(response.data.avatar);
      showNotification('Profile picture updated successfully');
    } catch (error) {
      showNotification('Error uploading profile picture', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Paper className="p-8">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 mr-2 text-blue-600" />
          <Typography variant="h5" className="font-bold">
            Profile Settings
          </Typography>
        </div>

        <div className="mb-8 flex items-center">
          <Avatar 
            src={avatar} 
            className="w-24 h-24 mr-6"
          />
          <div>
            <Typography variant="h6" className="mb-2">
              Profile Picture
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload className="w-4 h-4" />}
              className="mr-2"
            >
              Upload New
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="mb-4"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="mb-4"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mb-4"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="mb-4"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                className="mb-4"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mb-4"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 mt-6"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    autoSave: true
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings/profile');
      setSettings(response.data.settings || {});
    } catch (error) {
      showNotification('Error loading settings', 'error');
    }
  };

  const handleChange = (name) => async (event) => {
    const newSettings = { ...settings, [name]: event.target.checked };
    setSettings(newSettings);
    
    try {
      await api.patch('/api/settings/preferences', { [name]: event.target.checked });
    } catch (error) {
      showNotification('Error updating settings', 'error');
      // Revert the change if the API call fails
      setSettings(settings);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await api.patch('/api/settings/preferences', settings);
      showNotification('Settings saved successfully');
    } catch (error) {
      showNotification('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Paper className="p-8">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          <Typography variant="h5" className="font-bold">
            Application Settings
          </Typography>
        </div>

        <Box className="mb-6">
          <Typography variant="h6" className="mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" /> Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
              />
            }
            label="Email Notifications"
            className="block mb-2"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={handleChange('pushNotifications')}
              />
            }
            label="Push Notifications"
            className="block"
          />
        </Box>

        <Divider className="my-6" />

        <Box className="mb-6">
          <Typography variant="h6" className="mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2" /> Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleChange('darkMode')}
              />
            }
            label="Dark Mode"
            className="block"
          />
        </Box>

        <Divider className="my-6" />

        <Box>
          <Typography variant="h6" className="mb-4">
            Data Preferences
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSave}
                onChange={handleChange('autoSave')}
              />
            }
            label="Auto-save Changes"
            className="block"
          />
        </Box>

        <Button
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700 mt-6"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export { ProfilePage, SettingsPage };