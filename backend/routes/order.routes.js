const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Place order (Public)
router.post('/', [
  body('customerName').notEmpty().withMessage('Name is required'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Valid phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], orderController.placeOrder);

// Admin routes
router.get('/', protect, admin, orderController.getAllOrders);
router.get('/:id', protect, admin, orderController.getOrderById);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
