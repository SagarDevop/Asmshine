const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    policyType: {
      type: String,
      required: [true, 'Policy type is required'],
      enum: ['terms_and_conditions', 'privacy_policy', 'refund_policy'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true
    },
    version: {
      type: String,
      required: [true, 'Version is required (e.g. 1.0)'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Policy content is required']
    },
    summary: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true
    },
    isCurrentPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    publishedAt: {
      type: Date
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring a policyType cannot have duplicate version numbers
policySchema.index({ policyType: 1, version: 1 }, { unique: true });
policySchema.index({ policyType: 1, isCurrentPublished: 1 });
policySchema.index({ policyType: 1, status: 1 });

/**
 * Returns currently published active policies for all types
 */
policySchema.statics.getCurrentPublishedPolicies = async function () {
  return this.find({ isCurrentPublished: true, status: 'PUBLISHED' }).select('-__v');
};

/**
 * Returns currently published active policy for a specific type
 */
policySchema.statics.getCurrentPublishedPolicy = async function (policyType) {
  return this.findOne({ policyType, isCurrentPublished: true, status: 'PUBLISHED' }).select('-__v');
};

module.exports = mongoose.model('Policy', policySchema);

