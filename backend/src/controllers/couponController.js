const Coupon = require('../models/Coupon');

/**
 * GET /api/v1/coupons/available
 * Fetch all currently active and non-expired coupons for customer storefront
 */
const getAvailableCoupons = async (req, res, next) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { validFrom: { $exists: false } },
        { validFrom: null },
        { validFrom: { $lte: now } }
      ]
    }).lean();

    // Filter out expired coupons or coupons that hit usage limits
    const validCoupons = coupons.filter((c) => {
      if (c.validUntil && new Date(c.validUntil) < now) {
        return false;
      }
      if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
        return false;
      }
      return true;
    });

    // Return sanitized public fields for frontend display
    const sanitized = validCoupons.map((c) => ({
      _id: c._id,
      code: c.code,
      description: c.description || (c.discountType === 'percentage' ? `Flat ${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`),
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0
    }));

    res.status(200).json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/coupons/validate
 * Validate a coupon code against order subtotal
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderSubtotal = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please provide a coupon code.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon code '${cleanCode}' is invalid or has expired.`
      });
    }

    const subtotal = Math.max(0, Number(orderSubtotal) || 0);
    const validity = coupon.isValidForOrder(subtotal);

    if (!validity.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: validity.message
      });
    }

    const discountAmount = coupon.calculateDiscount(subtotal);

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description || (coupon.discountType === 'percentage' ? `Flat ${coupon.discountValue}% OFF` : `Flat ₹${coupon.discountValue} OFF`),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount
      },
      discountAmount,
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount}.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableCoupons,
  validateCoupon
};
