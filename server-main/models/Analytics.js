const mongoose = require('mongoose');

// Analytics Model
const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  metrics: {
    dailySales: Number,
    newClients: Number,
    activeUsers: Number,
    campaignPerformance: Number
  },
  campaigns: [{
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    metrics: {
      impressions: Number,
      clicks: Number,
      conversions: Number,
      spend: Number
    }
  }]
});

module.exports = {
  Analytics: mongoose.model('Analytics', analyticsSchema)
};