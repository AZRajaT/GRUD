const GroceryKit = require('../models/groceryKit.model');
const { validationResult } = require('express-validator');

// Get all grocery kits
const getAllKits = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, popular, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (popular === 'true') {
      query.popular = true;
    }

    // Build sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const kits = await GroceryKit.find(query)
      .populate('items.product', 'name price imageUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await GroceryKit.countDocuments(query);

    res.json({
      success: true,
      data: {
        kits,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get kits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery kits',
      error: error.message
    });
  }
};

// Get single grocery kit
const getKitById = async (req, res) => {
  try {
    const kit = await GroceryKit.findById(req.params.id)
      .populate('items.product', 'name price imageUrl description');

    if (!kit || !kit.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Grocery kit not found'
      });
    }

    res.json({
      success: true,
      data: { kit }
    });
  } catch (error) {
    console.error('Get kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grocery kit',
      error: error.message
    });
  }
};

// Create grocery kit
const createKit = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, originalPrice, imageUrl, items, popular } = req.body;

    const kit = new GroceryKit({
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      items,
      popular: popular || false,
      createdBy: req.user._id
    });

    await kit.save();

    // Populate items before sending response
    await kit.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Grocery kit created successfully',
      data: { kit }
    });
  } catch (error) {
    console.error('Create kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating grocery kit',
      error: error.message
    });
  }
};

// Update grocery kit
const updateKit = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, originalPrice, imageUrl, items, isActive, popular } = req.body;

    const kit = await GroceryKit.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        originalPrice,
        imageUrl,
        items,
        isActive,
        popular
      },
      { new: true, runValidators: true }
    ).populate('items.product', 'name price imageUrl');

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Grocery kit not found'
      });
    }

    res.json({
      success: true,
      message: 'Grocery kit updated successfully',
      data: { kit }
    });
  } catch (error) {
    console.error('Update kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grocery kit',
      error: error.message
    });
  }
};

// Delete grocery kit (soft delete)
const deleteKit = async (req, res) => {
  try {
    const kit = await GroceryKit.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Grocery kit not found'
      });
    }

    res.json({
      success: true,
      message: 'Grocery kit deleted successfully'
    });
  } catch (error) {
    console.error('Delete kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting grocery kit',
      error: error.message
    });
  }
};

// Get popular kits
const getPopularKits = async (req, res) => {
  try {
    const kits = await GroceryKit.find({ isActive: true, popular: true })
      .populate('items.product', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: { kits }
    });
  } catch (error) {
    console.error('Get popular kits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular kits',
      error: error.message
    });
  }
};

module.exports = {
  getAllKits,
  getKitById,
  createKit,
  updateKit,
  deleteKit,
  getPopularKits
};
