const mongoose = require('mongoose');

// Client Model
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  company: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  metrics: {
    totalSpend: Number,
    activeProjects: Number,
    lastActivity: Date
  },
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = {
  Client: mongoose.model('Client', clientSchema),
};