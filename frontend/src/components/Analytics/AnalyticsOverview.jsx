import React, { useState, useEffect } from 'react';
import {
    Grid, Card, CardContent, Typography, Box,
    Select, MenuItem, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, ButtonGroup,
    TextField
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../../services/api';

const AnalyticsOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
    });
    const [groupBy, setGroupBy] = useState('day');
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, groupBy]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/api/analytics/detailed', {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString(),
                    groupBy
                }
            });
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!data) return null;

    const { timeSeries, statistics, campaignMetrics } = data;

    const renderChart = () => {
        const ChartComponent = {
            line: LineChart,
            bar: BarChart,
            area: AreaChart
        }[chartType];

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ChartComponent data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chartType === 'area' ? (
                        <Area type="monotone" dataKey="totalSales" stroke="#8884d8" fill="#8884d8" />
                    ) : chartType === 'bar' ? (
                        <Bar dataKey="totalSales" fill="#8884d8" />
                    ) : (
                        <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        );
    };
    const handleDateChange = (event) => {
        setDateRange({ ...dateRange, [event.target.name]: event.target.value });
    };
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Analytics Overview
            </Typography>

            {/* Controls */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
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
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Group By</InputLabel>
                        <Select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            label="Group By"
                        >
                            <MenuItem value="day">Day</MenuItem>
                            <MenuItem value="week">Week</MenuItem>
                            <MenuItem value="month">Month</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <ButtonGroup fullWidth>
                        <Button
                            variant={chartType === 'line' ? 'contained' : 'outlined'}
                            onClick={() => setChartType('line')}
                        >
                            Line
                        </Button>
                        <Button
                            variant={chartType === 'bar' ? 'contained' : 'outlined'}
                            onClick={() => setChartType('bar')}
                        >
                            Bar
                        </Button>
                        <Button
                            variant={chartType === 'area' ? 'contained' : 'outlined'}
                            onClick={() => setChartType('area')}
                        >
                            Area
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Mean Daily Sales
                            </Typography>
                            <Typography variant="h4">
                                ${statistics.meanSales?.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Standard Deviation
                            </Typography>
                            <Typography variant="h4">
                                ${statistics.stdDevSales?.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total New Clients
                            </Typography>
                            <Typography variant="h4">
                                {statistics.totalClients}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Mean Performance
                            </Typography>
                            <Typography variant="h4">
                                {statistics.meanPerformance?.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Chart */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Sales Trend
                    </Typography>
                    {renderChart()}
                </CardContent>
            </Card>

            {/* Campaign Metrics */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Campaign Performance
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Count</TableCell>
                                            <TableCell>Avg Budget</TableCell>
                                            <TableCell>Avg ROI</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {campaignMetrics.map((metric) => (
                                            <TableRow key={metric._id}>
                                                <TableCell>{metric._id}</TableCell>
                                                <TableCell>{metric.count}</TableCell>
                                                <TableCell>${metric.avgBudget?.toFixed(2)}</TableCell>
                                                <TableCell>{metric.avgROI?.toFixed(2)}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Campaign Status Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={campaignMetrics}
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

export default AnalyticsOverview; 