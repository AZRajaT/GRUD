const express = require('express');
const { body } = require('express-validator');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  getCategories
} = require('../controllers/product.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .custom((value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Price must be a positive number');
      }
      return true;
    }),
  body('quantity')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const num = Number(value);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        throw new Error('Quantity must be a non-negative integer');
      }
      return true;
    }),
  body('description')
    .optional({ nullable: true, checkFalsy: false })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional({ nullable: true })
    .trim(),
  body('imageUrl')
    .optional({ nullable: true, checkFalsy: false })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      // Allow full URLs (http/https) OR root-relative paths (/assets/...)
      const urlRegex = /^https?:\/\/.+/;
      const pathRegex = /^\//;
      if (!urlRegex.test(value) && !pathRegex.test(value)) {
        throw new Error('Image URL must be a valid URL or root-relative path (e.g., /assets/images/file.png)');
      }
      return true;
    })
];

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes (authentication required)
router.post('/', authMiddleware, productValidation, createProduct);
router.put('/:id', authMiddleware, productValidation, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

// Admin only routes
router.delete('/:id/hard', authMiddleware, adminMiddleware, hardDeleteProduct);

module.exports = router;
