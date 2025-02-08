const Panchayat = require('../models/Panchayat');

// Add a new Panchayat
const addPanchayat = async (req, res) => {
  const { panchayat_name, district, state, contact_details } = req.body;

  try {
    const panchayat = new Panchayat({ panchayat_name, district, state, contact_details });
    await panchayat.save();
    res.status(201).json(panchayat);
  } catch (error) {
    res.status(400).json({ message: 'Error adding panchayat', error });
  }
};

// Get all Panchayats
const getPanchayats = async (req, res) => {
  try {
    const panchayats = await Panchayat.find();
    res.status(200).json(panchayats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching panchayats', error });
  }
};

// Get a single Panchayat by ID
const getPanchayatById = async (req, res) => {
  try {
    const panchayat = await Panchayat.findById(req.params.id);
    if (!panchayat) return res.status(404).json({ message: 'Panchayat not found' });
    res.status(200).json(panchayat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching panchayat', error });
  }
};

// Update a Panchayat
const updatePanchayat = async (req, res) => {
  try {
    const panchayat = await Panchayat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!panchayat) return res.status(404).json({ message: 'Panchayat not found' });
    res.status(200).json(panchayat);
  } catch (error) {
    res.status(500).json({ message: 'Error updating panchayat', error });
  }
};

// Delete a Panchayat
const deletePanchayat = async (req, res) => {
  try {
    const panchayat = await Panchayat.findByIdAndDelete(req.params.id);
    if (!panchayat) return res.status(404).json({ message: 'Panchayat not found' });
    res.status(200).json({ message: 'Panchayat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting panchayat', error });
  }
};

module.exports = { addPanchayat, getPanchayats, getPanchayatById, updatePanchayat, deletePanchayat };
