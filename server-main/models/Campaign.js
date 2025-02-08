const mongoose = require('mongoose');

// Campaign Model
const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  budget: Number,
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  metrics: {
    impressions: Number,
    clicks: Number,
    conversions: Number,
    spend: Number,
    roi: Number
  },
  platforms: [{
    name: String,
    metrics: {
      impressions: Number,
      clicks: Number,
      spend: Number
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});


module.exports = {
  Campaign: mongoose.model('Campaign', campaignSchema),
};