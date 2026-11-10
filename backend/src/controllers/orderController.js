
const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const StoreSettings = require('../models/StoreSettings');
const IdempotencyKey = require('../models/IdempotencyKey');
const inventoryService = require('../services/inventoryService');
const couponService = require('../services/couponService');
const realtimeHub = require('../services/realtimeHub');

/**
 * Normalizes checkout request payload into a deterministic canonical structure
 * ensuring identical orders generate identical hashes regardless of key ordering.
 */
const normalizeCheckoutPayload = (userId, items, shippingAddress, paymentMethod, couponCode) => {
  const normalizedItems = (Array.isArray(items) ? items : [])
    .map((it) => ({
      productId: String(it.productId || it.product?._id || it.product?.id || it.id || '').trim(),
      quantity: Number(it.quantity) || 1,
      size: String(it.size || '').trim()
    }))
    .sort((a, b) => `${a.productId}:${a.size}`.localeCompare(`${b.productId}:${b.size}`));

  const normalizedAddress = {
    fullName: String(shippingAddress?.fullName || shippingAddress?.name || '').trim().toLowerCase(),
    phone: String(shippingAddress?.phone || '').trim(),
    pincode: String(shippingAddress?.pincode || '').trim(),
    street: String(shippingAddress?.street || '').trim().toLowerCase(),
    city: String(shippingAddress?.city || '').trim().toLowerCase(),
    state: String(shippingAddress?.state || '').trim().toLowerCase(),
    type: String(shippingAddress?.type || 'HOME').trim().toUpperCase()
  };

  return {
    userId: String(userId || '').trim(),
    items: normalizedItems,
    shippingAddress: normalizedAddress,
    paymentMethod: String(paymentMethod || 'cod').trim().toLowerCase(),
    couponCode: String(couponCode || '').trim().toUpperCase()
  };
};

/**
 * POST /api/v1/orders
 * Creates an authoritative order backed by MongoDB with server-side price validation
 */
const createOrder = async (req, res, next) => {
  let idempotencyDoc = null;
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'cod',
      couponCode = ''
    } = req.body;

    // 0. Enforce Idempotency (Handles duplicate network requests and double-clicks)
    const idempotencyKey = (
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body?.idempotencyKey ||
      ''
    ).trim();

    if (idempotencyKey && req.user) {
      const canonicalPayload = normalizeCheckoutPayload(
        req.user._id,
        items,
        shippingAddress,
        paymentMethod,
        couponCode
      );
      const requestHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(canonicalPayload))
        .digest('hex');

      try {
        idempotencyDoc = await IdempotencyKey.create({
          key: idempotencyKey,
          user: req.user._id,
          endpoint: req.originalUrl || '/api/v1/orders',
          requestHash,
          status: 'PROCESSING'
        });
      } catch (idempErr) {
        if (idempErr.code === 11000) {
          const existing = await IdempotencyKey.findOne({
            key: idempotencyKey,
            user: req.user._id
          });

          if (existing) {
            // Defect 1: Idempotency Payload Mismatch Check (IETF RFC 9457)
            if (existing.requestHash !== requestHash) {
              return res.status(422).json({
                success: false,
                message: 'Idempotency key has already been used with a different request payload.'
              });
            }

            // In-flight request check
            if (existing.status === 'PROCESSING') {
              return res.status(409).json({
                success: false,
                message: 'An order request with this idempotency key is currently processing. Please wait.'
              });
            }

            // Already completed request replay
            if (existing.status === 'COMPLETED') {
              return res.status(existing.responseStatus || 200).json({
                ...existing.responseBody,
                idempotentReplay: true
              });
            }

            // Defect 2: Failed Idempotency Key Retry Handling
            if (existing.status === 'FAILED') {
              // Atomically claim the failed record for retry
              const claimed = await IdempotencyKey.findOneAndUpdate(
                { _id: existing._id, status: 'FAILED' },
                { $set: { status: 'PROCESSING', requestHash } },
                { new: true }
              );

              if (!claimed) {
                // Another concurrent request claimed the failed record
                return res.status(409).json({
                  success: false,
                  message: 'An order retry request with this idempotency key is currently processing. Please wait.'
                });
              }

              idempotencyDoc = claimed;
            }
          }
        } else {
          throw idempErr;
        }
      }
    }

    // 1. Validate items presence
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // 2. Validate shipping address fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required.'
      });
    }

    const recipientName = (shippingAddress.fullName || shippingAddress.name || '').trim();
    const phone = (shippingAddress.phone || '').trim();
    const pincode = (shippingAddress.pincode || '').trim();
    const street = (shippingAddress.street || '').trim();
    const city = (shippingAddress.city || '').trim();
    const state = (shippingAddress.state || '').trim();
    const type = (shippingAddress.type || 'HOME').toUpperCase();

    if (!recipientName || !phone || !pincode || !street || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields (full name, phone, pincode, street, city, state) are required.'
      });
    }

    // 3. Collect product IDs from items
    const rawIds = items.map((i) => (i.productId || i.product?.id || i.product?._id || '').toString()).filter(Boolean);
    const objectIds = rawIds.filter((id) => mongoose.isValidObjectId(id));

    const dbProducts = await Product.find({
      $or: [
        { id: { $in: rawIds } },
        { _id: { $in: objectIds } }
      ]
    }).lean();

    // 4. Validate each item and calculate prices strictly from DB
    let totalMRP = 0;
    let itemsSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = (item.productId || item.product?.id || item.product?._id || '').toString();
      const product = dbProducts.find(
        (p) => p.id === pid || p._id.toString() === pid
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${pid}' is no longer available in the catalogue.`
        });
      }

      if (product.inStock === false) {
        return res.status(400).json({
          success: false,
          message: `Product '${product.name}' is currently out of stock.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Resolve size-specific price if specified
      let unitPrice = product.price;
      let unitMRP = product.originalPrice || product.price;
      let selectedImage = product.image;

      if (item.size && Array.isArray(product.availableSizes)) {
        const sizeVariant = product.availableSizes.find(
          (s) => s.size.toLowerCase() === item.size.toLowerCase()
        );
        if (sizeVariant) {
          if (sizeVariant.price) unitPrice = sizeVariant.price;
          if (sizeVariant.originalPrice) unitMRP = sizeVariant.originalPrice;
          if (sizeVariant.image) selectedImage = sizeVariant.image;
        }
      }

      const itemTotal = unitPrice * qty;
      const itemMRP = unitMRP * qty;

      itemsSubtotal += itemTotal;
      totalMRP += itemMRP;

      verifiedItems.push({
        productId: product.id || pid,
        name: product.name,
        image: selectedImage,
        size: item.size || product.size || '',
        quantity: qty,
        unitPrice,
        unitMRP,
        totalPrice: itemTotal,
        totalMRP: itemMRP
      });
    }

    const productDiscount = Math.max(0, totalMRP - itemsSubtotal);

    // 5. Generate cryptographically secure ASM- order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = crypto.randomInt(100000, 999999).toString();
    const orderId = `ASM-${dateStr}-${randPart}`;

    // 6. Calculate coupon discount dynamically from MongoDB with atomic usage reservation
    let couponDiscount = 0;
    let appliedCouponDoc = null;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon) {
      try {
        const dbCoupon = await Coupon.findOne({ code: cleanCoupon, isActive: true });
        if (dbCoupon) {
          const check = dbCoupon.isValidForOrder(itemsSubtotal, req.user?._id);
          if (check.valid) {
            // Defect 3: Atomic conditional update ensuring both global usageLimit AND userUsageLimit
            const atomicConditions = [
              {
                $or: [
                  { usageLimit: { $lte: 0 } },
                  { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
                ]
              }
            ];

            if (req.user && dbCoupon.userUsageLimit > 0) {
              atomicConditions.push({
                $expr: {
                  $lt: [
                    {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$usedBy', []] },
                          as: 'entry',
                          cond: { $eq: ['$$entry.user', req.user._id] }
                        }
                      }
                    },
                    '$userUsageLimit'
                  ]
                }
              });
            }

            const atomicQuery = {
              _id: dbCoupon._id,
              isActive: true,
              $and: atomicConditions
            };

            const updateAction = {
              $inc: { usedCount: 1 }
            };
            if (req.user) {
              updateAction.$push = {
                usedBy: { user: req.user._id, orderId, usedAt: new Date() }
              };
            }
            const updatedCoupon = await Coupon.findOneAndUpdate(atomicQuery, updateAction, { new: true });
            if (updatedCoupon) {
              couponDiscount = dbCoupon.calculateDiscount(itemsSubtotal);
              appliedCouponDoc = updatedCoupon;
            } else {
              console.warn(`[Order] Coupon ${cleanCoupon} limit reached concurrently.`);
            }
          }
        }
      } catch (couponErr) {
        console.warn('[Order] Coupon validation error:', couponErr.message);
      }
    }

    // 7. Payment method resolution (prepaid discounts disabled until verified gateway integration)
    const validPaymentMethods = ['upi', 'card', 'netbanking', 'cod'];
    const chosenPayment = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cod';
    const isCOD = chosenPayment === 'cod';
    const prepaidDiscount = 0; // Disabled: unearned discount cannot be granted without gateway settlement

    // 8. Calculate dynamic delivery fee from StoreSettings
    const storeSettings = await StoreSettings.getSettings();
    const threshold = Number(storeSettings?.freeShippingThreshold) || 499;
    const standardFee = Number(storeSettings?.standardDeliveryFee) || 49;
    const netOrderValue = Math.max(0, itemsSubtotal - couponDiscount);
    const deliveryFee = netOrderValue >= threshold ? 0 : standardFee;

    const finalAmount = Math.max(0, itemsSubtotal - couponDiscount - prepaidDiscount + deliveryFee);

    // 9. Status & inventory reservation logic:
    // Only Cash on Delivery (COD) orders are confirmed and stock-deducted immediately.
    // Online payments (UPI, Card, Netbanking) remain in PENDING_PAYMENT until real gateway settlement.
    const initialStatus = isCOD ? 'CONFIRMED' : 'PENDING_PAYMENT';

    if (isCOD) {
      await inventoryService.deductOrderStock(verifiedItems, orderId, req.user);
    }

    // 10. Create and save Order in MongoDB
    const newOrder = new Order({
      orderId,
      user: req.user._id,
      items: verifiedItems,
      shippingAddress: {
        fullName: recipientName,
        phone,
        pincode,
        street,
        city,
        state,
        type: ['HOME', 'WORK', 'OTHER'].includes(type) ? type : 'HOME'
      },
      pricing: {
        totalMRP,
        itemsSubtotal,
        productDiscount,
        couponDiscount,
        prepaidDiscount,
        deliveryFee,
        finalAmount
      },
      totalAmount: finalAmount,
      status: initialStatus,
      paymentMethod: chosenPayment,
      paymentStatus: 'pending',
      coupon: {
        code: cleanCoupon,
        discountAmount: couponDiscount
      },
      timeline: [
        {
          status: initialStatus,
          title: isCOD ? 'Order Placed (COD)' : 'Payment Pending',
          note: isCOD
            ? `Order placed via Cash on Delivery (COD). Confirmed for dispatch.`
            : `Order registered via ${chosenPayment.toUpperCase()}. Payment gateway integration pending. Inventory will be allocated upon payment verification.`,
          timestamp: new Date(),
          updatedBy: req.user.name || 'Customer'
        }
      ]
    });

    await newOrder.save();

    // 11. Broadcast to admin fulfillment stream only for confirmed orders
    if (isCOD) {
      try {
        realtimeHub.notifyNewOrder(newOrder);
      } catch (rtErr) {
        console.warn('[Order] Realtime broadcast error:', rtErr.message);
      }
    }

    // 9. Clear user's active cart in MongoDB after successful order placement
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [] }
      );
    } catch (cartErr) {
      console.warn('[Order] Could not clear cart after order placement:', cartErr.message);
    }

    // 10. Auto-persist phone and shipping address to user profile if missing
    try {
      if (req.user) {
        let userNeedsUpdate = false;
        if (!req.user.phone && phone) {
          req.user.phone = phone;
          userNeedsUpdate = true;
        }
        if (!req.user.addresses || req.user.addresses.length === 0) {
          const addrType = ['HOME', 'WORK', 'OTHER'].includes(type) ? type : 'HOME';
          req.user.addresses = [{
            name: recipientName,
            fullName: recipientName,
            phone,
            street,
            city,
            state,
            pincode,
            type: addrType,
            isDefault: true
          }];
          userNeedsUpdate = true;
        }
        if (userNeedsUpdate) {
          await req.user.save();
        }
      }
    } catch (userErr) {
      console.warn('[Order] User phone/address profile auto-update warning:', userErr.message);
    }

    const responsePayload = {
      success: true,
      message: 'Order placed successfully.',
      order: {
        id: newOrder.orderId,
        orderId: newOrder.orderId,
        _id: newOrder._id,
        items: newOrder.items,
        shippingAddress: newOrder.shippingAddress,
        pricing: newOrder.pricing,
        coupon: newOrder.coupon,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        createdAt: newOrder.createdAt
      }
    };

    // Complete idempotency record
    if (idempotencyDoc) {
      try {
        idempotencyDoc.status = 'COMPLETED';
        idempotencyDoc.responseStatus = 201;
        idempotencyDoc.responseBody = responsePayload;
        idempotencyDoc.orderId = newOrder.orderId;
        await idempotencyDoc.save();
      } catch (idempSaveErr) {
        console.warn('[Order] Could not persist idempotency completion:', idempSaveErr.message);
      }
    }

    res.status(201).json(responsePayload);
  } catch (err) {
    if (appliedCouponDoc) {
      try {
        await Coupon.findOneAndUpdate(
          { _id: appliedCouponDoc._id, usedCount: { $gt: 0 } },
          {
            $inc: { usedCount: -1 },
            $pull: { usedBy: { orderId } }
          }
        );
      } catch (rollbackErr) {}
    }
    if (idempotencyDoc) {
      try {
        idempotencyDoc.status = 'FAILED';
        await idempotencyDoc.save();
      } catch (idempFailErr) {}
    }
    next(err);
  }
};

/**
 * GET /api/v1/orders
 * Returns orders placed by the currently authenticated user
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o) => ({
      id: o.orderId,
      orderId: o.orderId,
      _id: o._id,
      items: (o.items || []).map((it) => ({
        ...it,
        price: it.unitPrice || it.price || 0
      })),
      shippingAddress: o.shippingAddress,
      pricing: o.pricing,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      shippingDetails: o.shippingDetails || {},
      cancellation: o.cancellation || null,
      timeline: o.timeline || []
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
      data: formattedOrders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/:id
 * Retrieve details for a specific order owned by authenticated user
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const order = await Order.findOne({
      $or: [
        { orderId: id },
        { _id: isObjectId ? id : null }
      ]
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isStaff = req.user && ['superadmin', 'admin', 'order_manager'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        _id: order._id,
        items: (order.items || []).map((it) => ({
          ...it,
          price: it.unitPrice || it.price || 0
        })),
        shippingAddress: order.shippingAddress,
        pricing: order.pricing,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingDetails: order.shippingDetails || {},
        cancellation: order.cancellation || null,
        timeline: order.timeline || []
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/orders/:id/cancel
 * Allows authenticated customers to cancel eligible orders (CONFIRMED/PENDING_CONFIRMATION)
 * and safely restores inventory.
 */
const cancelCustomerOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const isObjectId = mongoose.isValidObjectId(id);
    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: isObjectId ? id : null }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to cancel this order.'
      });
    }

    if (!['PENDING_CONFIRMATION', 'PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it has been shipped or completed. Current status is '${order.status}'. Please contact support.`
      });
    }

    order.status = 'CANCELLED';
    order.cancellation = {
      cancelledAt: new Date(),
      reason: reason.trim(),
      cancelledBy: req.user._id,
      stockRestored: true
    };
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: 'CANCELLED',
      title: 'Order Cancelled',
      note: reason.trim(),
      timestamp: new Date(),
      updatedBy: req.user.name || 'Customer'
    });

    await order.save();

    // Safely restore stock (idempotent)
    await inventoryService.restoreOrderStock(order, reason.trim(), req.user);

    // Defect 4: Idempotent coupon usage restoration via shared service
    await couponService.restoreOrderCoupon(order);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/track/:id
 * Strictly authenticated and authorization-verified order tracking (prevents IDOR)
 */
const publicTrackOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const isObjectId = mongoose.isValidObjectId(id.trim());
    const order = await Order.findOne({
      $or: [{ orderId: id.trim() }, { _id: isObjectId ? id.trim() : null }]
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with reference ID #${id}`
      });
    }

    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isStaff = req.user && ['superadmin', 'admin', 'order_manager'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to track this order.'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        _id: order._id,
        items: (order.items || []).map((it) => ({
          name: it.name,
          image: it.image,
          size: it.size,
          quantity: it.quantity,
          unitPrice: it.unitPrice || it.price || 0,
          price: it.unitPrice || it.price || 0,
          totalPrice: it.totalPrice || ((it.unitPrice || it.price || 0) * (it.quantity || 1)),
          totalMRP: it.totalMRP
        })),
        shippingAddress: order.shippingAddress,
        pricing: order.pricing,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingDetails: order.shippingDetails || {},
        cancellation: order.cancellation || null,
        timeline: order.timeline || []
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelCustomerOrder,
  publicTrackOrder,
  normalizeCheckoutPayload
};

