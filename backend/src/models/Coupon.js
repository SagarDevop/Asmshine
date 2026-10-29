const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: 0 // 0 means no maximum cap
    },
    usageLimit: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

couponSchema.methods.isValidForOrder = function (orderSubtotal) {
  if (!this.isActive) return { valid: false, message: 'Coupon is currently inactive.' };
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return { valid: false, message: 'Coupon is not yet active.' };
  if (this.validUntil && now > this.validUntil) return { valid: false, message: 'Coupon has expired.' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit has been reached.' };
  if (this.minOrderValue > 0 && orderSubtotal < this.minOrderValue) {
    return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required for this coupon.` };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderSubtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = Math.round((orderSubtotal * this.discountValue) / 100);
    if (this.maxDiscountAmount > 0 && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = Math.min(orderSubtotal, this.discountValue);
  }
  return Math.max(0, discount);
};

module.exports = mongoose.model('Coupon', couponSchema);
