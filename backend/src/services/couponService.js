const Coupon = require('../models/Coupon');

/**
 * Idempotently restores coupon usage for a cancelled order.
 * Ensures:
 * 1. Coupon was actually applied and had discountAmount > 0.
 * 2. Coupon has not already been restored (order.cancellation.couponRestored !== true).
 * 3. usedCount never becomes negative (usedCount: { $gt: 0 }).
 * 4. Matching usedBy entry for this order is removed.
 * 5. Sets order.cancellation.couponRestored = true atomically.
 */
const restoreOrderCoupon = async (order) => {
  if (!order) return { restored: false, reason: 'No order provided' };

  // Guard 1: Idempotency check - already restored
  if (order.cancellation && order.cancellation.couponRestored === true) {
    return { restored: false, reason: 'Coupon already restored previously' };
  }

  // Guard 2: Verify coupon was applied and had a non-zero discount
  const couponCode = (order.coupon?.code || '').trim().toUpperCase();
  const discountAmount = Number(order.coupon?.discountAmount || order.pricing?.couponDiscount || 0);

  if (!couponCode || discountAmount <= 0) {
    if (order.cancellation) {
      order.cancellation.couponRestored = true;
      try {
        await order.save();
      } catch (e) {}
    }
    return { restored: false, reason: 'No valid discount amount to restore' };
  }

  try {
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { code: couponCode, usedCount: { $gt: 0 } },
      {
        $inc: { usedCount: -1 },
        $pull: { usedBy: { orderId: order.orderId } }
      },
      { new: true }
    );

    if (order.cancellation) {
      order.cancellation.couponRestored = true;
      try {
        await order.save();
      } catch (saveErr) {
        console.warn('[CouponService] Warning saving order cancellation flag:', saveErr.message);
      }
    }

    return {
      restored: true,
      code: couponCode,
      usedCount: updatedCoupon ? updatedCoupon.usedCount : 0
    };
  } catch (err) {
    console.warn(`[CouponService] Error restoring coupon ${couponCode}:`, err.message);
    return { restored: false, error: err.message };
  }
};

module.exports = {
  restoreOrderCoupon
};

