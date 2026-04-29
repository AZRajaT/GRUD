const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not established.',
      details: 'This usually means MONGODB_URI is missing or incorrect in your environment variables.',
      status: mongoose.connection.readyState // 0: disconnected, 2: connecting, 3: disconnecting
    });
  }
  next();
};

module.exports = dbCheck;
