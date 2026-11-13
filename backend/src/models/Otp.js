const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['SIGNUP', 'LOGIN', 'RESET'],
      default: 'SIGNUP',
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    passwordHash: {
      type: String,
      default: ''
    },
    policyConsentAccepted: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastResendAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index automatically purges expired records
    }
  },
  {
    timestamps: true
  }
);

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
