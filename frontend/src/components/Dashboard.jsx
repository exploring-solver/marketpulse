import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
  IconButton,
  Container,
  Paper,
  useTheme
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, TrendingUp, Settings, User } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!dashboardData) return null;

  const { summary, timeSeriesData, campaignPerformance } = dashboardData;

  const MetricCard = ({ title, value, icon: Icon }) => (
    <Card sx={{ height: '100%' }} className=''>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
          <Icon size={20} />
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Marketing Dashboard
          </Typography>
          <Box>
            <IconButton>
              <Settings />
            </IconButton>
            <IconButton>
              <User />
            </IconButton>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Sales"
              value={`$${summary.totalSales.toLocaleString()}`}
              icon={DollarSign}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Clients"
              value={summary.totalClients}
              icon={Users}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Campaign Performance"
              value={`${summary.averagePerformance.toFixed(1)}%`}
              icon={Activity}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Campaigns"
              value={summary.activeCampaigns}
              icon={TrendingUp}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Sales" stroke="#8884d8" />
                    <Line type="monotone" dataKey="newClients" name="New Clients" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="performance" name="Performance" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            New Report Available
          </Typography>
          The monthly performance report for May 2024 is ready for review.
        </Alert>
      </Container>
    </Box>
  );
}

export default Dashboard;