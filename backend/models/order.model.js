const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  apartmentName: {
    type: String,
    trim: true
  },
  flatNumber: {
    type: String,
    trim: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1']
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  whatsappMessageSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for performance
orderSchema.index({ phone: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
