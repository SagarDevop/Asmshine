const mongoose = require('mongoose');

const acceptedPolicyItemSchema = new mongoose.Schema(
  {
    policyType: {
      type: String,
      required: true,
      enum: ['terms_and_conditions', 'privacy_policy', 'refund_policy']
    },
    version: {
      type: String,
      required: true
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    }
  },
  { _id: false }
);

const consentRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    consentType: {
      type: String,
      required: true,
      enum: ['SIGNUP', 'CHECKOUT', 'POLICY_RECONSENT'],
      index: true
    },
    acceptedPolicies: {
      type: [acceptedPolicyItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Consent record must specify at least one accepted policy.'
      }
    },
    orderId: {
      type: String,
      trim: true,
      index: true,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// High performance audit queries
consentRecordSchema.index({ user: 1, consentType: 1, createdAt: -1 });
consentRecordSchema.index({ consentType: 1, createdAt: -1 });
consentRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);

