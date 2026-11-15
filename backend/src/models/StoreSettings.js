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
      default: '+91 8901 271 271'
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
      street: { type: String, default: 'Shop No. 11, Paras Enclave' },
      city: { type: String, default: 'Kurukshetra' },
      state: { type: String, default: 'Haryana' },
      pincode: { type: String, default: '136118' },
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
    return settings;
  }

  let dirty = false;
  if (!settings.supportPhone || settings.supportPhone.includes('1800')) {
    settings.supportPhone = '+91 8901 271 271';
    dirty = true;
  }
  if (!settings.supportEmail || settings.supportEmail === 'care@asmshine.com') {
    settings.supportEmail = 'support@asmshine.com';
    dirty = true;
  }
  if (!settings.businessAddress || settings.businessAddress.city !== 'Kurukshetra') {
    settings.businessAddress = {
      street: 'Shop No. 11, Paras Enclave',
      city: 'Kurukshetra',
      state: 'Haryana',
      pincode: '136118',
      country: 'India'
    };
    dirty = true;
  }

  if (dirty) {
    await settings.save();
  }

  return settings;
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
