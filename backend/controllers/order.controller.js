const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const { calculateDistance, sendNotification } = require('../utils/order.utils');
const { ORDER_STATUSES } = require('../models/order.model');

// Default Store Location (Organic)
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
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ 
          success: false, 
          message: `Product with ID ${item.productId} not found`,
          removedProductId: item.productId 
        });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product with ID ${item.productId} not found`,
          removedProductId: item.productId 
        });
      }
      if (!product.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: `Product "${product.name}" is not active`,
          removedProductId: item.productId 
        });
      }
      if (product.isDeleted) {
        return res.status(400).json({ 
          success: false, 
          message: `Product "${product.name}" has been removed`,
          removedProductId: item.productId 
        });
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

    // 3. Create order with estimated delivery (2-3 hours from now)
    const estimatedDeliveryDate = new Date(Date.now() + 2.5 * 60 * 60 * 1000);
    
    const order = new Order({
      customerName,
      phone,
      address,
      apartmentName,
      flatNumber,
      items: orderItems,
      totalAmount,
      deliveryLocation,
      currentStatus: ORDER_STATUSES.PENDING,
      status: ORDER_STATUSES.PENDING,
      estimatedDeliveryDate,
      paymentStatus: 'Pending'
    });

    await order.save();

    // Send notification
    sendNotification(order, ORDER_STATUSES.PENDING, 'Your order has been placed successfully');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        trackingId: order.trackingId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, phone } = req.query;
    const query = {};
    if (status) query.currentStatus = status;
    if (phone) query.phone = phone;

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

// Get tracking details by Order ID or Tracking ID (Public - customer side)
exports.getTrackingDetails = async (req, res, next) => {
  try {
    const { orderId, trackingId } = req.params;
    let order;

    if (orderId) {
      order = await Order.findById(orderId).populate('items.product');
    } else if (trackingId) {
      order = await Order.findOne({ trackingId }).populate('items.product');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// Track orders by phone number and optional order ID (Public - customer side)
exports.trackOrderByPhone = async (req, res, next) => {
  try {
    const { phone, orderId } = req.query;

    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' });
    }

    const query = { phone };
    if (orderId) {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
      }
      query._id = orderId;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.product');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this phone number' });
    }

    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

// Update order status with tracking history
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    if (!Object.values(ORDER_STATUSES).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update status and add to tracking history
    order.currentStatus = status;
    order.status = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.admin?.email || 'admin'
    });

    // Auto-update payment status when delivered
    if (status === ORDER_STATUSES.DELIVERED) {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    // Send notification
    sendNotification(order, status, note || `Your order status updated to ${status}`);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Upload delivery proof image
exports.uploadDeliveryProof = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow delivery proof upload when order is delivered
    if (order.currentStatus !== ORDER_STATUSES.DELIVERED) {
      return res.status(400).json({ success: false, message: 'Can only upload proof for delivered orders' });
    }

    order.deliveryProofImage = imageUrl;
    await order.save();

    res.json({
      success: true,
      message: 'Delivery proof uploaded successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order with reason
exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Can only cancel pending, confirmed, or processing orders
    const cancellableStatuses = [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PROCESSING];
    if (!cancellableStatuses.includes(order.currentStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.currentStatus} status` });
    }

    order.currentStatus = ORDER_STATUSES.CANCELLED;
    order.status = ORDER_STATUSES.CANCELLED;
    order.cancelReason = reason;
    order.trackingHistory.push({
      status: ORDER_STATUSES.CANCELLED,
      timestamp: new Date(),
      note: `Order cancelled: ${reason}`,
      updatedBy: 'customer'
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    sendNotification(order, ORDER_STATUSES.CANCELLED, `Order cancelled: ${reason}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Validate cart items against database (Customer)
exports.validateCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const validItems = [];
    const removedItemIds = [];

    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        removedItemIds.push(item.productId);
        continue;
      }
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || product.isDeleted) {
        removedItemIds.push(item.productId);
      } else {
        validItems.push({
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl,
          stock: product.stock,
          requestedQuantity: item.quantity
        });
      }
    }

    res.json({
      success: true,
      data: {
        validItems,
        removedItemIds
      }
    });
  } catch (error) {
    next(error);
  }
};

