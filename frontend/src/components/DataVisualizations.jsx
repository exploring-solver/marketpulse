import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Select, MenuItem, TextField } from '@mui/material';
import { analyticsService, uploadService } from '../services/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DataVisualizations = () => {
    const [data, setData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Format for input
        end: new Date().toISOString().slice(0, 10) // Format for input
    });

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            const startDate = new Date(dateRange.start); // Convert back to Date object
            const endDate = new Date(dateRange.end);       // Convert back to Date object

            const [analyticsData, summaryData] = await Promise.all([
                analyticsService.getAnalytics(startDate, endDate), // Pass Date objects
                uploadService.getSummary()
            ]);
            setData(analyticsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDateChange = (event) => {
        setDateRange({ ...dateRange, [event.target.name]: event.target.value });
    };

    return (
        <Grid container spacing={3}>
            {/* Date Range Selector */}
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        label="Start Date"
                        type="date"
                        name="start"
                        value={dateRange.start}
                        onChange={handleDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        name="end"
                        value={dateRange.end}
                        onChange={handleDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </Grid>

            {/* Summary Cards */}
            {summary && (
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Total Sales</Typography>
                                    <Typography variant="h4">${summary.totalSales}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Total Clients</Typography>
                                    <Typography variant="h4">{summary.totalClients}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Avg Performance</Typography>
                                    <Typography variant="h4">{summary.avgPerformance}%</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            )}

            {/* Charts */}
            {data && (
                <>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Sales Trend</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="metrics.dailySales" name="Sales" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.map(d => ({
                                                name: d.date,
                                                value: d.metrics.campaignPerformance
                                            }))}
                                            dataKey="value"
                                            nameKey="name"
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
                </>
            )}
        </Grid>
    );
};

export default DataVisualizations; 