const Coupon = require('../models/Coupon');
const { logAdminAction } = require('../services/auditService');

/**
 * GET /api/v1/admin/coupons
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/coupons
 */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description = '',
      discountType = 'percentage',
      discountValue,
      minOrderValue = 0,
      maxDiscountAmount = 0,
      usageLimit = 0,
      validFrom,
      validUntil,
      isActive = true
    } = req.body;

    if (!code || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and discount value are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists.`
      });
    }

    const numVal = Number(discountValue);
    if (numVal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than zero.'
      });
    }

    if (discountType === 'percentage' && numVal > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%.'
      });
    }

    const coupon = new Coupon({
      code: cleanCode,
      description,
      discountType,
      discountValue: numVal,
      minOrderValue: Math.max(0, Number(minOrderValue) || 0),
      maxDiscountAmount: Math.max(0, Number(maxDiscountAmount) || 0),
      usageLimit: Math.max(0, parseInt(usageLimit, 10) || 0),
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: Boolean(isActive)
    });

    await coupon.save();

    await logAdminAction({
      req,
      action: 'COUPON_CREATE',
      resourceType: 'Coupon',
      resourceId: coupon.code,
      details: { code: coupon.code, discountType, discountValue: numVal }
    });

    res.status(201).json({
      success: true,
      message: `Coupon '${coupon.code}' created successfully.`,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/coupons/:id
 */
const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const {
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
    if (usageLimit !== undefined) coupon.usageLimit = parseInt(usageLimit, 10);
    if (validFrom !== undefined) coupon.validFrom = validFrom ? new Date(validFrom) : null;
    if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    await logAdminAction({
      req,
      action: 'COUPON_UPDATE',
      resourceType: 'Coupon',
      resourceId: coupon.code,
      details: { code: coupon.code, isActive: coupon.isActive }
    });

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' updated successfully.`,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/coupons/:id
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await logAdminAction({
      req,
      action: 'COUPON_DELETE',
      resourceType: 'Coupon',
      resourceId: coupon.code,
      details: { code: coupon.code }
    });

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
