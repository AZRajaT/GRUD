const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const groceryKitController = require('../controllers/groceryKit.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Validation rules
const kitValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Kit name is required')
    .isLength({ max: 100 })
    .withMessage('Kit name cannot exceed 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Kit must contain at least one item'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item')
];

// Public routes
router.get('/', groceryKitController.getAllKits);
router.get('/popular', groceryKitController.getPopularKits);
router.get('/:id', groceryKitController.getKitById);

// Protected routes (admin only)
router.post('/', authMiddleware, kitValidation, groceryKitController.createKit);
router.put('/:id', authMiddleware, kitValidation, groceryKitController.updateKit);
router.delete('/:id', authMiddleware, groceryKitController.deleteKit);

module.exports = router;
