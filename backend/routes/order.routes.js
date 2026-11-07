const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { body, query } = require('express-validator');

// Place order (Public)
router.post('/', [
  body('customerName').notEmpty().withMessage('Name is required'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Valid phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], orderController.placeOrder);

// Validate cart items (Public)
router.post('/validate-cart', orderController.validateCart);

// PUBLIC CUSTOMER TRACKING ROUTES
// Track by phone number
router.get('/track/phone', orderController.trackOrderByPhone);

// Get tracking details by order ID
router.get('/track/order/:orderId', orderController.getTrackingDetails);

// Get tracking details by tracking ID
router.get('/track/:trackingId', orderController.getTrackingDetails);

// Cancel order (Customer)
router.post('/:orderId/cancel', [
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], orderController.cancelOrder);

// Upload delivery proof (Customer)
router.post('/:orderId/proof', [
  body('imageUrl').notEmpty().withMessage('Image URL is required')
], orderController.uploadDeliveryProof);

// ADMIN ROUTES (Protected)
router.get('/', protect, admin, orderController.getAllOrders);
router.get('/admin/:id', protect, admin, orderController.getOrderById);
router.put('/:id/status', protect, admin, [
  body('status').notEmpty().withMessage('Status is required')
], orderController.updateOrderStatus);

module.exports = router;
