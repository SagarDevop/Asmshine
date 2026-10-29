const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productId: {
      type: String,
      required: true,
      index: true
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: ''
    },
    variantSize: {
      type: String,
      default: ''
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    changeQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'CANCELLATION', 'RESTOCK'],
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'A reason is mandatory for any stock movement'],
      trim: true
    },
    referenceOrder: {
      type: String,
      default: ''
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: {
      type: String,
      default: 'System'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
