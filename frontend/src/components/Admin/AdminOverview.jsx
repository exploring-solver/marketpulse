import React, { useState, useEffect } from 'react';
import {
    Grid, Card, CardContent, Typography, Box,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const AdminOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const [chartMetric, setChartMetric] = useState('sales');

    useEffect(() => {
        fetchAdminData();
    }, [timeRange]);

    const fetchAdminData = async () => {
        try {
            const response = await api.get('/api/admin-dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <div>Loading...</div>;

    const { summary, timeSeriesData, campaignStats, clientStats } = data;

    const metricOptions = {
        sales: { key: 'sales', label: 'Sales', color: '#8884d8' },
        newClients: { key: 'newClients', label: 'New Clients', color: '#82ca9d' },
        activeUsers: { key: 'activeUsers', label: 'Active Users', color: '#ffc658' },
        performance: { key: 'performance', label: 'Performance', color: '#ff7300' }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Sales
                            </Typography>
                            <Typography variant="h4">
                                ${summary.totalSales?.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                New Clients
                            </Typography>
                            <Typography variant="h4">
                                {summary.totalNewClients}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Performance
                            </Typography>
                            <Typography variant="h4">
                                {summary.averagePerformance?.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Users
                            </Typography>
                            <Typography variant="h4">
                                {summary.totalUsers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Chart Controls */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                        value={chartMetric}
                        onChange={(e) => setChartMetric(e.target.value)}
                        label="Metric"
                    >
                        {Object.entries(metricOptions).map(([key, { label }]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Main Chart */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {metricOptions[chartMetric].label} Overview
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey={chartMetric}
                                        stroke={metricOptions[chartMetric].color}
                                        name={metricOptions[chartMetric].label}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Campaign Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Campaign Status Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={campaignStats}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                    />
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminOverview; 