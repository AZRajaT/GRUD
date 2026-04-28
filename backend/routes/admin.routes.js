const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/stats', protect, admin, adminController.getDashboardStats);

module.exports = router;
