const express = require('express');
const router = express.Router();
const { Client } = require('../models/Client');
const { Campaign } = require('../models/Campaign');
const auth = require('../middleware/auth');

// Get all clients with their campaigns and metrics
router.get('/clients/dashboard', auth, async (req, res) => {
  try {
    const clients = await Client.find({ assignedManager: req.user._id })
      .populate({
        path: 'campaigns',
        populate: {
          path: 'metrics platforms'
        }
      });

    // Calculate aggregate metrics
    const dashboardData = {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalSpend: clients.reduce((sum, client) => sum + (client.metrics?.totalSpend || 0), 0),
      clientsData: clients
    };

    res.send(dashboardData);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get single client with full details
router.get('/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id,
      assignedManager: req.user._id 
    }).populate('campaigns');
    if (!client) {
      return res.status(404).send();
    }
    res.send(client);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update client
router.patch('/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, assignedManager: req.user._id },
      req.body,
      { new: true }
    );
    if (!client) {
      return res.status(404).send();
    }
    res.send(client);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Create new client
router.post('/clients', auth, async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      assignedManager: req.user._id
    });
    await client.save();
    res.status(201).send(client);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router; 