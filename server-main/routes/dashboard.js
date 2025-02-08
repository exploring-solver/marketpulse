const express = require('express');
const router = express.Router();
const { Analytics } = require('../models/Analytics');
const { Campaign } = require('../models/Campaign');
const { Client } = require('../models/Client');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all dashboard data in one request
router.get('/dashboard', auth, async (req, res) => {
    try {
        const [analytics, campaigns, clients] = await Promise.all([
            // Get last 30 days of analytics
            Analytics.find({
                date: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }).sort({ date: 1 }),

            // Get all active campaigns
            Campaign.find({
                createdBy: req.user._id,
                status: 'active'
            }).populate('client'),

            // Get all clients
            Client.find({
                assignedManager: req.user._id
            })
        ]);

        // Calculate summary metrics
        const summary = {
            totalSales: analytics.reduce((sum, day) => sum + (day.metrics.dailySales || 0), 0),
            totalClients: clients.length,
            activeCampaigns: campaigns.length,
            averagePerformance: analytics.reduce((sum, day) => sum + (day.metrics.campaignPerformance || 0), 0) / analytics.length,
        };

        // Prepare time series data
        const timeSeriesData = analytics.map(day => ({
            date: day.date,
            sales: day.metrics.dailySales,
            newClients: day.metrics.newClients,
            performance: day.metrics.campaignPerformance
        }));

        // Campaign performance data
        const campaignPerformance = campaigns.map(campaign => ({
            name: campaign.name,
            client: campaign.client.name,
            metrics: campaign.metrics,
            platforms: campaign.platforms
        }));

        res.send({
            summary,
            timeSeriesData,
            campaignPerformance,
            clients: clients.map(client => ({
                name: client.name,
                status: client.status,
                metrics: client.metrics
            }))
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get admin dashboard data
router.get('/admin-dashboard', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Not authorized' });
    }

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const [analyticsData, campaigns, clients, users] = await Promise.all([
            // Get detailed analytics data
            Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            day: { $dayOfMonth: "$date" }
                        },
                        date: { $first: "$date" },
                        dailySales: { $sum: "$metrics.dailySales" },
                        newClients: { $sum: "$metrics.newClients" },
                        activeUsers: { $sum: "$metrics.activeUsers" },
                        performance: { $avg: "$metrics.campaignPerformance" }
                    }
                },
                { $sort: { date: 1 } }
            ]),
            // Get campaign statistics
            Campaign.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalBudget: { $sum: "$budget" },
                        avgPerformance: { $avg: "$metrics.roi" }
                    }
                }
            ]),
            // Get client statistics
            Client.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalSpend: { $sum: "$metrics.totalSpend" }
                    }
                }
            ]),
            // Get user count
            User.countDocuments()
        ]);

        // Process analytics for time series
        const timeSeriesData = analyticsData.map(day => ({
            date: day.date.toISOString().split('T')[0],
            sales: day.dailySales,
            newClients: day.newClients,
            activeUsers: day.activeUsers,
            performance: day.performance
        }));

        // Calculate summary metrics
        const summary = {
            totalSales: timeSeriesData.reduce((sum, day) => sum + (day.sales || 0), 0),
            totalNewClients: timeSeriesData.reduce((sum, day) => sum + (day.newClients || 0), 0),
            averagePerformance: timeSeriesData.reduce((sum, day) => sum + (day.performance || 0), 0) / timeSeriesData.length,
            totalUsers: users
        };

        res.send({
            summary,
            timeSeriesData,
            campaignStats: campaigns,
            clientStats: clients
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send(error);
    }
});

module.exports = router; 