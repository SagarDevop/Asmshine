const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { escapeRegex } = require('../utils/sanitize');

/**
 * Inventory Service:
 * Handles atomic inventory operations, variant-level stock tracking,
 * concurrency protection, and immutable stock movement auditing.
 */

/**
 * Atomically deducts inventory for a list of items upon order placement.
 * Decrements parent stock and variant stock (if size is specified).
 * If any product does not have sufficient stock, rolls back all prior deductions.
 */
const deductOrderStock = async (items, orderId, user = null) => {
  const deducted = [];
  const isObjectId = (id) => mongoose.isValidObjectId(id);

  try {
    for (const item of items) {
      const pid = item.productId;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const requestedSize = (item.size || '').trim();

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

      // 2. Validate parent stock availability
      const available = current.stockQuantity;
      if (available < qty) {
        throw new Error(
          `Insufficient stock for '${current.name}'. Requested: ${qty}, Available: ${available}`
        );
      }

      // 3. Validate variant stock availability if size is specified and variant exists
      let matchedVariant = null;
      if (requestedSize && Array.isArray(current.availableSizes)) {
        matchedVariant = current.availableSizes.find(
          (v) => v.size && v.size.toLowerCase() === requestedSize.toLowerCase()
        );
        if (matchedVariant) {
          const variantStock = matchedVariant.stockQuantity !== undefined ? matchedVariant.stockQuantity : available;
          if (variantStock < qty) {
            throw new Error(
              `Insufficient stock for '${current.name}' (${matchedVariant.size}). Requested: ${qty}, Available: ${variantStock}`
            );
          }
        }
      }

      // 4. Perform atomic conditional decrement
      let updated = null;

      if (matchedVariant) {
        // Atomically decrement BOTH parent stock AND matched variant stock
        const safeVariantSize = escapeRegex(matchedVariant.size);
        updated = await Product.findOneAndUpdate(
          {
            _id: current._id,
            $or: [
              { stockQuantity: { $gte: qty } },
              { stockQuantity: { $exists: false } },
              { stockQuantity: null }
            ],
            availableSizes: {
              $elemMatch: {
                size: new RegExp(`^${safeVariantSize}$`, 'i'),
                $or: [
                  { stockQuantity: { $gte: qty } },
                  { stockQuantity: { $exists: false } },
                  { stockQuantity: null }
                ]
              }
            }
          },
          {
            $inc: {
              stockQuantity: -qty,
              'availableSizes.$[elem].stockQuantity': -qty
            }
          },
          {
            new: true,
            arrayFilters: [{ 'elem.size': new RegExp(`^${safeVariantSize}$`, 'i') }]
          }
        );
      } else {
        // Atomically decrement parent stock only
        updated = await Product.findOneAndUpdate(
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
      }

      if (!updated) {
        throw new Error(
          `Concurrent stock reservation conflict for '${current.name}'. Please retry checkout.`
        );
      }

      // 5. Sync inStock flags for parent and variant
      let needsSave = false;
      if (updated.stockQuantity <= 0 && updated.inStock) {
        updated.inStock = false;
        needsSave = true;
      }
      if (matchedVariant && Array.isArray(updated.availableSizes)) {
        const updatedVariant = updated.availableSizes.find(
          (v) => v.size && v.size.toLowerCase() === requestedSize.toLowerCase()
        );
        if (updatedVariant && updatedVariant.stockQuantity <= 0 && updatedVariant.inStock) {
          updatedVariant.inStock = false;
          needsSave = true;
        }
      }
      if (needsSave) {
        await updated.save();
      }

      deducted.push({
        product: updated._id,
        productId: current.id,
        name: current.name,
        qty,
        variantSize: matchedVariant ? matchedVariant.size : '',
        hasVariant: Boolean(matchedVariant),
        prevStock: current.stockQuantity,
        newStock: updated.stockQuantity
      });

      // 6. Record immutable stock movement
      await StockMovement.create({
        product: updated._id,
        productId: current.id,
        productName: current.name,
        sku: (matchedVariant && matchedVariant.sku) || current.sku || '',
        variantSize: (matchedVariant && matchedVariant.size) || requestedSize || '',
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
      if (d.hasVariant && d.variantSize) {
        const safeVariant = escapeRegex(d.variantSize);
        await Product.findByIdAndUpdate(
          d.product,
          {
            $inc: {
              stockQuantity: d.qty,
              'availableSizes.$[elem].stockQuantity': d.qty
            },
            inStock: true
          },
          {
            arrayFilters: [{ 'elem.size': new RegExp(`^${safeVariant}$`, 'i') }]
          }
        );
      } else {
        await Product.findByIdAndUpdate(d.product, {
          $inc: { stockQuantity: d.qty },
          inStock: true
        });
      }

      await StockMovement.create({
        product: d.product,
        productId: d.productId,
        productName: d.name,
        variantSize: d.variantSize || '',
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
    const requestedSize = (item.size || '').trim();

    const hasMatchingVariant = requestedSize && Array.isArray(current.availableSizes) && current.availableSizes.some(
      (v) => v.size && v.size.toLowerCase() === requestedSize.toLowerCase()
    );

    if (hasMatchingVariant) {
      const safeVariant = escapeRegex(requestedSize);
      await Product.findByIdAndUpdate(
        current._id,
        {
          $inc: {
            stockQuantity: addQty,
            'availableSizes.$[elem].stockQuantity': addQty
          },
          inStock: true
        },
        {
          arrayFilters: [{ 'elem.size': new RegExp(`^${safeVariant}$`, 'i') }]
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        current._id,
        {
          $inc: { stockQuantity: addQty },
          inStock: true
        }
      );
    }

    await StockMovement.create({
      product: current._id,
      productId: current.id,
      productName: current.name,
      sku: current.sku || '',
      variantSize: requestedSize || '',
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
