const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'ASM SHINE'
    },
    tagline: {
      type: String,
      default: 'Hygiene & Cleaning Solutions'
    },
    supportEmail: {
      type: String,
      default: 'support@asmshine.com'
    },
    supportPhone: {
      type: String,
      default: '+91 98765 43210'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    freeShippingThreshold: {
      type: Number,
      default: 499
    },
    standardDeliveryFee: {
      type: Number,
      default: 49
    },
    defaultLowStockThreshold: {
      type: Number,
      default: 5
    },
    businessAddress: {
      street: { type: String, default: 'Industrial Area, Phase 1' },
      city: { type: String, default: 'New Delhi' },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String, default: '110020' },
      country: { type: String, default: 'India' }
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Helper to get or create singleton store settings
storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
