router.post('/campaigns', auth, async (req, res) => {
    try {
      const campaign = new Campaign({
        ...req.body,
        createdBy: req.user._id
      });
      await campaign.save();
      res.status(201).send(campaign);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Get Campaigns
  router.get('/campaigns', auth, async (req, res) => {
    try {
      const campaigns = await Campaign.find({
        createdBy: req.user._id
      }).populate('client');
      res.send(campaigns);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update Campaign
  router.patch('/campaigns/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'status', 'budget', 'metrics', 'platforms'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
  
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        createdBy: req.user._id
      });
      
      if (!campaign) {
        return res.status(404).send();
      }
  
      updates.forEach(update => campaign[update] = req.body[update]);
      await campaign.save();
      res.send(campaign);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Delete Campaign
  router.delete('/campaigns/:id', auth, async (req, res) => {
    try {
      const campaign = await Campaign.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id
      });
      
      if (!campaign) {
        return res.status(404).send();
      }
      res.send(campaign);
    } catch (error) {
      res.status(500).send(error);
    }
  });