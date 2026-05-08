const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const { calculateDistance, generateWhatsAppMessage } = require('../utils/order.utils');

// Default Store Location (Kovilpatti)
const STORE_LOCATION = {
  lat: 9.1764,
  lng: 77.8687
};
const MAX_DELIVERY_RADIUS_KM = 3;

// Place order
exports.placeOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customerName, phone, address, apartmentName, flatNumber, items, deliveryLocation } = req.body;

    // 1. Validate delivery radius
    if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
      const distance = calculateDistance(
        STORE_LOCATION.lat,
        STORE_LOCATION.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      );

      if (distance > MAX_DELIVERY_RADIUS_KM) {
        return res.status(400).json({
          success: false,
          message: `Delivery location is outside our ${MAX_DELIVERY_RADIUS_KM}km service radius. Current distance: ${distance.toFixed(2)}km`
        });
      }
    }

    // 2. Validate all items first
    const productsToUpdate = [];
    const outOfStockItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product with ID ${item.productId} not found` });
      }
      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${product.name} is not active` });
      }
      if (product.isDeleted) {
        return res.status(400).json({ success: false, message: `Product ${product.name} has been removed` });
      }
      
      if (product.stock < item.quantity) {
        outOfStockItems.push(product.name);
      } else {
        productsToUpdate.push({ product, quantity: item.quantity });
      }
    }

    if (outOfStockItems.length > 0) {
      const message = outOfStockItems.length === 1 
        ? `Insufficient stock for ${outOfStockItems[0]}`
        : `Insufficient stock for: ${outOfStockItems.join(', ')}`;
      return res.status(400).json({ success: false, message });
    }

    // 3. Process items and update stock since validation passed
    let totalAmount = 0;
    const orderItems = [];

    for (const { product, quantity } of productsToUpdate) {
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });

      // Update stock
      product.stock -= quantity;
      await product.save();
    }

    // 3. Create order
    const order = new Order({
      customerName,
      phone,
      address,
      apartmentName,
      flatNumber,
      items: orderItems,
      totalAmount,
      deliveryLocation,
      status: 'Pending'
    });

    await order.save();

    // 4. Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        whatsappMessage,
        whatsappNumber: process.env.WHATSAPP_NUMBER || '918870378977'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('items.product', 'name imageUrl');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
