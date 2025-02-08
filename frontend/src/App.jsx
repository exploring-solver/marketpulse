import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Login, Register } from './components/Auth';
import Dashboard from './components/Dashboard';
import { ProfilePage, SettingsPage } from './components/Settings';
import ExcelUpload from './components/ExcelUpload';
import AdminDashboard from './components/Admin/AdminDashboard';
import AnalyticsOverview from './components/Analytics/AnalyticsOverview';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

// Theme Configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// App Component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <br />
            <br />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <ExcelUpload />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsOverview />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;