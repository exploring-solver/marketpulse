const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/profiles',
  filename: function(req, file, cb) {
    const filename = 'profile-' + Date.now() + path.extname(file.originalname);
    console.log({
      timestamp: new Date().toISOString(),
      type: 'FILE_UPLOAD_START',
      userId: req?.user?._id,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype
    });
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log({
      timestamp: new Date().toISOString(),
      type: 'FILE_TYPE_CHECK',
      status: 'success',
      fileType: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase()
    });
    return cb(null, true);
  } else {
    console.error({
      timestamp: new Date().toISOString(),
      type: 'FILE_TYPE_ERROR',
      status: 'error',
      fileType: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      error: 'Invalid file type'
    });
    cb('Error: Images Only!');
  }
}

// Get user profile and settings
router.get('/settings/profile', auth, async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log({
    timestamp: new Date().toISOString(),
    requestId,
    type: 'PROFILE_REQUEST',
    userId: req.user._id,
    method: 'GET'
  });

  try {
    const user = await User.findById(req.user._id).select('-password');
    
    console.log({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PROFILE_RETRIEVED',
      userId: req.user._id,
      duration: Date.now() - startTime
    });

    res.json(user);
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PROFILE_ERROR',
      userId: req.user._id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: Date.now() - startTime
    });
    res.status(500).send(error);
  }
});

// Update profile
router.patch('/settings/profile', auth, async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log({
    timestamp: new Date().toISOString(),
    requestId,
    type: 'PROFILE_UPDATE_REQUEST',
    userId: req.user._id,
    updates: Object.keys(req.body)
  });

  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'company', 'position', 'phone'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    console.warn({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'INVALID_UPDATE_ATTEMPT',
      userId: req.user._id,
      invalidFields: updates.filter(update => !allowedUpdates.includes(update))
    });
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = await User.findById(req.user._id);
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    console.log({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PROFILE_UPDATED',
      userId: req.user._id,
      updatedFields: updates,
      duration: Date.now() - startTime
    });

    res.send(user);
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PROFILE_UPDATE_ERROR',
      userId: req.user._id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: Date.now() - startTime
    });
    res.status(400).send(error);
  }
});

// Update profile picture
router.post('/settings/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log({
    timestamp: new Date().toISOString(),
    requestId,
    type: 'AVATAR_UPDATE_REQUEST',
    userId: req.user._id,
    fileInfo: {
      filename: req.file?.filename,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    }
  });

  try {
    const user = await User.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();

    console.log({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'AVATAR_UPDATED',
      userId: req.user._id,
      filePath: user.avatar,
      duration: Date.now() - startTime
    });

    res.send({ avatar: user.avatar });
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'AVATAR_UPDATE_ERROR',
      userId: req.user._id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: Date.now() - startTime
    });
    res.status(400).send(error);
  }
});

// Update application settings
router.patch('/settings/preferences', auth, async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log({
    timestamp: new Date().toISOString(),
    requestId,
    type: 'PREFERENCES_UPDATE_REQUEST',
    userId: req.user._id,
    preferences: req.body
  });

  try {
    const user = await User.findById(req.user._id);
    user.settings = { ...user.settings, ...req.body };
    await user.save();

    console.log({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PREFERENCES_UPDATED',
      userId: req.user._id,
      newSettings: user.settings,
      duration: Date.now() - startTime
    });

    res.send(user.settings);
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      requestId,
      type: 'PREFERENCES_UPDATE_ERROR',
      userId: req.user._id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: Date.now() - startTime
    });
    res.status(400).send(error);
  }
});

module.exports = router;