const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const moment = require('moment'); // Import moment.js
const { Analytics } = require('../models/Analytics');
const auth = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
});

// Upload and process Excel file
router.post('/excel', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate data structure
    if (!data.length) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // Process and save data
    const processedData = data.map(row => {
      const formattedDate = moment(row.date, 'DD-MM-YYYY').toDate(); // Convert to JS Date

      if (isNaN(formattedDate)) {
        throw new Error(`Invalid date format: ${row.date}`);
      }

      return {
        date: formattedDate,
        metrics: {
          dailySales: row.sales || 0,
          newClients: row.newClients || 0,
          activeUsers: row.activeUsers || 0,
          campaignPerformance: row.performance || 0
        },
        campaigns: [
          {
            campaignId: row.campaignId || '',
            impressions: row.impressions || 0,
            clicks: row.clicks || 0,
            conversions: row.conversions || 0,
            spend: row.spend || 0
          }
        ]
      };
    });

    // Batch insert data
    await Analytics.insertMany(processedData);

    res.status(200).json({
      message: 'File processed successfully',
      rowsProcessed: data.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Error processing file',
      details: error.message
    });
  }
});

// Get uploaded data summary
router.get('/summary', auth, async (req, res) => {
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

    res.json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching summary', details: error.message });
  }
});

module.exports = router;
