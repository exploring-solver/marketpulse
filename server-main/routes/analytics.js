const express = require('express');
const router = express.Router();
const { Analytics } = require('../models/Analytics');
const { Campaign } = require('../models/Campaign');
const auth = require('../middleware/auth');

// Get analytics with date range
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await Analytics.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate({
      path: 'campaigns.campaign',
      populate: { path: 'client' }
    });
    res.send(analytics);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get analytics summary
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const summary = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$metrics.dailySales' },
          totalClients: { $sum: '$metrics.newClients' },
          avgPerformance: { $avg: '$metrics.campaignPerformance' }
        }
      }
    ]);
    res.send(summary[0]);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get detailed analytics with statistical analysis
router.get('/analytics/detailed', auth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const matchStage = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };

    const analytics = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy === 'month' 
            ? { $month: '$date' }
            : groupBy === 'week'
            ? { $week: '$date' }
            : { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          avgDailySales: { $avg: '$metrics.dailySales' },
          totalSales: { $sum: '$metrics.dailySales' },
          maxSales: { $max: '$metrics.dailySales' },
          minSales: { $min: '$metrics.dailySales' },
          totalNewClients: { $sum: '$metrics.newClients' },
          avgPerformance: { $avg: '$metrics.campaignPerformance' },
          totalActiveUsers: { $sum: '$metrics.activeUsers' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate overall statistics
    const stats = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          meanSales: { $avg: '$metrics.dailySales' },
          medianSales: { $avg: '$metrics.dailySales' },
          stdDevSales: { $stdDevPop: '$metrics.dailySales' },
          totalSales: { $sum: '$metrics.dailySales' },
          totalClients: { $sum: '$metrics.newClients' },
          meanPerformance: { $avg: '$metrics.campaignPerformance' }
        }
      }
    ]);

    // Get campaign performance metrics
    const campaignMetrics = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' },
          totalBudget: { $sum: '$budget' },
          avgROI: { $avg: '$metrics.roi' }
        }
      }
    ]);

    res.json({
      timeSeries: analytics,
      statistics: stats[0],
      campaignMetrics,
      periodType: groupBy
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;