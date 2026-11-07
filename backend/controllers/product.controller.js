const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

// Get all products with filters and pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          totalItems: total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// Create product (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = new Product({
      ...req.body,
      createdBy: req.user ? req.user._id : null
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};


// Soft delete product (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Hard delete product (Admin only)
exports.hardDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Get product categories
exports.getCategories = async (req, res, next) => {
  try {
    const Category = require('../models/category.model');

    // 1. Get categories from active, non-deleted products
    const productCategories = await Product.distinct('category', {
      isDeleted: false,
      category: { $nin: [null, '', undefined] }
    });

    // 2. Get categories from Category collection
    const customCategories = await Category.find({ isActive: true }).distinct('name');

    // 3. Deduplicate (case-insensitive)
    const categoryMap = new Map();
    [...productCategories, ...customCategories].forEach(cat => {
      if (cat && typeof cat === 'string' && cat.trim() !== '') {
        const lower = cat.trim().toLowerCase();
        if (!categoryMap.has(lower)) {
          categoryMap.set(lower, cat.trim());
        }
      }
    });

    const categories = Array.from(categoryMap.values()).sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// Create category (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const Category = require('../models/category.model');

    // Check if category already exists
    const existingInModel = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    const existingInProducts = await Product.findOne({
      category: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      isDeleted: false
    });

    if (existingInModel || existingInProducts) {
      // If it was soft-deleted in Category model, reactivate it
      if (existingInModel && !existingInModel.isActive) {
        existingInModel.isActive = true;
        await existingInModel.save();
        return res.status(200).json({
          success: true,
          message: 'Category reactivated successfully',
          data: { category: existingInModel }
        });
      }
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = new Category({ name: trimmedName, isActive: true });
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// Delete category by name (Admin)
exports.deleteCategoryByName = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = category.trim();
    const Category = require('../models/category.model');

    // 1. Remove from Category collection
    await Category.deleteMany({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });

    // 2. Clear category on products currently assigned to it
    const updateResult = await Product.updateMany(
      { category: { $regex: new RegExp(`^${trimmedName}$`, 'i') } },
      { $set: { category: '' } }
    );

    res.json({
      success: true,
      message: `Category "${trimmedName}" deleted successfully`,
      data: {
        affectedProducts: updateResult.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

