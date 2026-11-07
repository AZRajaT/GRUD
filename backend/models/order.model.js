const mongoose = require('mongoose');

const ORDER_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const trackingHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(ORDER_STATUSES),
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: String,
  updatedBy: {
    type: String,
    default: 'system'
  }
}, { _id: false });

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
  currentStatus: {
    type: String,
    enum: Object.values(ORDER_STATUSES),
    default: ORDER_STATUSES.PENDING
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUSES),
    default: ORDER_STATUSES.PENDING
  },
  trackingHistory: {
    type: [trackingHistorySchema],
    default: function() {
      return [{
        status: ORDER_STATUSES.PENDING,
        timestamp: new Date(),
        updatedBy: 'system'
      }];
    }
  },
  estimatedDeliveryDate: Date,
  courierPartner: {
    type: String,
    default: 'AROW Logistics'
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  cancelReason: String,
  deliveryProofImage: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Pre-save hook to generate tracking ID if not present
orderSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = `ARW${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  // Ensure status and currentStatus stay in sync
  if (this.currentStatus && !this.status) {
    this.status = this.currentStatus;
  } else if (this.status && !this.currentStatus) {
    this.currentStatus = this.status;
  }
  next();
});

// Index for performance
orderSchema.index({ phone: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ currentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ trackingId: 1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
