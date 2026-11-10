const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Idempotency key is required'],
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      trim: true
    },
    requestHash: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING',
      index: true
    },
    responseStatus: {
      type: Number
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed
    },
    orderId: {
      type: String,
      trim: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour retention
      index: { expires: 0 } // MongoDB TTL index to auto-expire records
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring a user cannot submit duplicate concurrent actions with same key
idempotencyKeySchema.index({ key: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);

