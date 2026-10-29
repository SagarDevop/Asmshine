const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    unitMRP: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    totalMRP: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['HOME', 'WORK', 'OTHER'],
      default: 'HOME'
    }
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    totalMRP: {
      type: Number,
      required: true
    },
    itemsSubtotal: {
      type: Number,
      required: true
    },
    productDiscount: {
      type: Number,
      default: 0
    },
    couponDiscount: {
      type: Number,
      default: 0
    },
    prepaidDiscount: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item.'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    pricing: {
      type: pricingSchema,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      default: 'CONFIRMED',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cod'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    coupon: {
      code: { type: String, default: '' },
      discountAmount: { type: Number, default: 0 }
    },
    shippingDetails: {
      carrier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      shippedAt: { type: Date },
      deliveredAt: { type: Date }
    },
    cancellation: {
      cancelledAt: { type: Date },
      reason: { type: String, default: '' },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      stockRestored: { type: Boolean, default: false }
    },
    internalNotes: {
      type: String,
      default: ''
    },
    timeline: [
      {
        status: { type: String, required: true },
        title: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
