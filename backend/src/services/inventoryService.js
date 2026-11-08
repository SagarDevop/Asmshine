const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * Inventory Service:
 * Handles atomic inventory operations, concurrency protection,
 * and immutable stock movement auditing.
 */

/**
 * Atomically deducts inventory for a list of items upon order placement.
 * If any product does not have sufficient stock, rolls back all prior deductions.
 */
const deductOrderStock = async (items, orderId, user = null) => {
  const deducted = [];

  try {
    for (const item of items) {
      const pid = item.productId;
      const qty = item.quantity;

      const mongoose = require('mongoose');
      const isObjectId = (id) => mongoose.isValidObjectId(id);

      // 1. Fetch current product state
      const current = await Product.findOne({
        $or: [
          { id: pid },
          { _id: isObjectId(pid) ? pid : null }
        ]
      });

      if (!current) {
        throw new Error(`Product '${item.name || pid}' was not found in inventory.`);
      }

      // Ensure stockQuantity is initialized if legacy product had it unset
      if (current.stockQuantity === undefined || current.stockQuantity === null) {
        current.stockQuantity = 50;
        await Product.findByIdAndUpdate(current._id, { stockQuantity: 50 });
      }

      const available = current.stockQuantity;
      if (available < qty) {
        throw new Error(
          `Insufficient stock for '${current.name}'. Requested: ${qty}, Available: ${available}`
        );
      }

      // 2. Perform atomic conditional decrement
      const updated = await Product.findOneAndUpdate(
        {
          _id: current._id,
          $or: [
            { stockQuantity: { $gte: qty } },
            { stockQuantity: { $exists: false } },
            { stockQuantity: null }
          ]
        },
        {
          $inc: { stockQuantity: -qty }
        },
        { new: true }
      );

      if (!updated) {
        throw new Error(
          `Concurrent stock reservation conflict for '${current.name}'. Please retry checkout.`
        );
      }

      // 3. Sync inStock boolean
      if (updated.stockQuantity <= 0 && updated.inStock) {
        await Product.findByIdAndUpdate(updated._id, { inStock: false });
      }

      deducted.push({
        product: updated._id,
        productId: current.id,
        name: current.name,
        qty,
        prevStock: current.stockQuantity,
        newStock: updated.stockQuantity
      });

      // 4. Record immutable stock movement
      await StockMovement.create({
        product: updated._id,
        productId: current.id,
        productName: current.name,
        sku: current.sku || '',
        variantSize: item.size || '',
        previousQuantity: current.stockQuantity,
        changeQuantity: -qty,
        newQuantity: updated.stockQuantity,
        type: 'SALE',
        reason: `Order placed #${orderId}`,
        referenceOrder: orderId,
        performedBy: user?._id || null,
        performedByName: user?.name || 'Customer Checkout'
      });
    }

    return { success: true, deducted };
  } catch (error) {
    // ROLLBACK: If any item failed, restore all previously deducted items in this transaction
    for (const d of deducted) {
      await Product.findByIdAndUpdate(d.product, {
        $inc: { stockQuantity: d.qty },
        inStock: true
      });

      await StockMovement.create({
        product: d.product,
        productId: d.productId,
        productName: d.name,
        previousQuantity: d.newStock,
        changeQuantity: d.qty,
        newQuantity: d.prevStock,
        type: 'ADJUSTMENT',
        reason: `Rollback deduction for failed order #${orderId}: ${error.message}`,
        referenceOrder: orderId,
        performedByName: 'System Inventory Compensation'
      });
    }

    throw error;
  }
};

/**
 * Restores stock for a cancelled or returned order.
 * Idempotent: will never restore stock twice for the same order.
 */
const restoreOrderStock = async (order, reason = '', adminUser = null) => {
  if (order.cancellation && order.cancellation.stockRestored) {
    return { success: true, message: 'Stock already restored previously.', restoredCount: 0 };
  }

  const restored = [];

  for (const item of order.items) {
    const current = await Product.findOne({ id: item.productId });
    if (!current) continue;

    const previousQty = current.stockQuantity || 0;
    const addQty = item.quantity;
    const newQty = previousQty + addQty;

    const updated = await Product.findByIdAndUpdate(
      current._id,
      {
        $inc: { stockQuantity: addQty },
        inStock: true
      },
      { new: true }
    );

    await StockMovement.create({
      product: current._id,
      productId: current.id,
      productName: current.name,
      sku: current.sku || '',
      variantSize: item.size || '',
      previousQuantity: previousQty,
      changeQuantity: addQty,
      newQuantity: newQty,
      type: 'CANCELLATION',
      reason: reason || `Order cancelled #${order.orderId}`,
      referenceOrder: order.orderId,
      performedBy: adminUser?._id || null,
      performedByName: adminUser?.name || 'Admin Operations'
    });

    restored.push({ productId: current.id, qty: addQty });
  }

  return { success: true, restoredCount: restored.length, restored };
};

/**
 * Manual stock adjustment with mandatory reason and audit entry
 */
const adjustStock = async ({
  productId,
  changeQuantity,
  newQuantity,
  type = 'ADJUSTMENT',
  reason,
  adminUser
}) => {
  if (!reason || reason.trim() === '') {
    throw new Error('A mandatory reason must be provided for stock adjustments.');
  }

  const product = await Product.findOne({
    $or: [{ id: productId }, { _id: productId }]
  });

  if (!product) {
    throw new Error(`Product '${productId}' not found.`);
  }

  const prevStock = product.stockQuantity || 0;
  let targetStock;
  let delta;

  if (typeof newQuantity === 'number') {
    targetStock = Math.max(0, newQuantity);
    delta = targetStock - prevStock;
  } else if (typeof changeQuantity === 'number') {
    delta = changeQuantity;
    targetStock = Math.max(0, prevStock + delta);
  } else {
    throw new Error('Either newQuantity or changeQuantity must be specified.');
  }

  product.stockQuantity = targetStock;
  product.inStock = targetStock > 0;
  await product.save();

  const movement = await StockMovement.create({
    product: product._id,
    productId: product.id,
    productName: product.name,
    sku: product.sku || '',
    previousQuantity: prevStock,
    changeQuantity: delta,
    newQuantity: targetStock,
    type,
    reason: reason.trim(),
    performedBy: adminUser?._id || null,
    performedByName: adminUser?.name || 'Administrator'
  });

  return { product, movement };
};

module.exports = {
  deductOrderStock,
  restoreOrderStock,
  adjustStock
};
