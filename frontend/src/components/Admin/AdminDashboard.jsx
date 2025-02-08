import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Alert,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Trash2, Edit, AlertCircle, Home, BarChart as BarChartIcon } from 'lucide-react';
import DataVisualizations from '../DataVisualizations';
import AdminOverview from './AdminOverview';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'user',
      password: ''
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    // Implement user creation/editing logic
    setOpenDialog(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<UserPlus />}
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add User
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)} size="small">
                    <Edit className="w-4 h-4" />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mb-4 mt-4"
          />
          <TextField
            label="Email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mb-4"
          />
          <TextField
            select
            label="Role"
            fullWidth
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="mb-4"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          {!selectedUser && (
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" className="bg-blue-600">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const DataVisualization = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [dataType, setDataType] = useState('sales');

  return (
    <div className="p-6">
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader>
              <Typography variant="h6">Performance Trends</Typography>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader>
              <Typography variant="h6">Revenue Distribution</Typography>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader>
              <Typography variant="h6">Campaign Performance</Typography>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#8884d8" />
                    <Bar dataKey="conversions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen fixed shadow-md">
          <div className="p-4">
            <Typography variant="h6" className="font-bold mb-6">
              Admin Panel
            </Typography>
            <div className="space-y-2">
              <Button
                fullWidth
                startIcon={<Home />}
                onClick={() => navigate('/admin')}
                className={`justify-start ${
                  activeTab === 'overview' ? 'bg-blue-50' : ''
                }`}
              >
                Overview
              </Button>
              <Button
                fullWidth
                startIcon={<Users />}
                onClick={() => navigate('/admin/users')}
                className={`justify-start ${
                  activeTab === 'users' ? 'bg-blue-50' : ''
                }`}
              >
                User Management
              </Button>
              <Button
                fullWidth
                startIcon={<BarChart />}
                onClick={() => navigate('/admin/analytics')}
                className={`justify-start ${
                  activeTab === 'analytics' ? 'bg-blue-50' : ''
                }`}
              >
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/analytics" element={<DataVisualizations />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;