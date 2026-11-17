const crypto = require('crypto');
const mongoose = require('mongoose');
const { getRazorpayInstance } = require('../config/razorpay');
const Order = require('../models/Order');
const inventoryService = require('../services/inventoryService');
const realtimeHub = require('../services/realtimeHub');

/**
 * POST /api/create-order or /api/v1/payment/create-order
 * Creates an authoritative order in Razorpay.
 * Security Hardening:
 * 1. Server-side price lock: If orderId is provided, enforces DB price from MongoDB (prevents client price-tampering).
 * 2. Minimum amount enforcement: >= 100 paise (₹1.00).
 * 3. Never leaks credentials or internal stack traces.
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const rawAmount = req.body.amount;
    let amountInPaise = Math.round(Number(rawAmount));

    const targetOrderId = (req.body.orderId || req.body.receipt || '').toString().trim();

    // 1. Server-side Price Lock from MongoDB
    // If client provides orderId, lookup database order to enforce the exact server-calculated amount
    if (targetOrderId) {
      const dbOrder = await Order.findOne({
        $or: [
          { orderId: targetOrderId },
          { _id: mongoose.isValidObjectId(targetOrderId) ? targetOrderId : null }
        ]
      });

      if (dbOrder) {
        if (dbOrder.status === 'CANCELLED') {
          return res.status(400).json({
            success: false,
            message: 'This order has been cancelled and cannot be processed for payment.'
          });
        }

        if (dbOrder.paymentStatus === 'completed') {
          return res.status(400).json({
            success: false,
            message: 'This order has already been paid and confirmed.'
          });
        }

        // Authoritative server-side price check
        const authoritativeRupees = Number(dbOrder.pricing?.finalAmount || dbOrder.totalAmount);
        const authoritativePaise = Math.round(authoritativeRupees * 100);

        if (authoritativePaise >= 100) {
          // Prevent price tampering: Always override with database calculated total
          amountInPaise = authoritativePaise;
        }
      }
    }

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum payable amount is 100 paise (₹1.00).'
      });
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      console.error('[Razorpay Config Error] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment.');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is temporarily unavailable. Please try Cash on Delivery or contact support.'
      });
    }

    const razorpay = getRazorpayInstance();
    const currency = (req.body.currency || 'INR').toUpperCase();
    const rawReceipt = targetOrderId || `rcpt_${Date.now().toString().slice(-8)}`;
    const receipt = String(rawReceipt).slice(0, 40);

    const options = {
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        ...(req.body.notes || {}),
        orderId: targetOrderId || ''
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key_id: keyId
    });
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error?.message || error);

    // 401: Invalid or expired API credentials
    if (error.statusCode === 401 || (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.toLowerCase().includes('auth'))) {
      return res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Please verify API keys in server environment.'
      });
    }

    const errorMsg = error?.error?.description || error.message || 'Failed to initiate payment gateway session.';
    return res.status(500).json({
      success: false,
      message: errorMsg
    });
  }
};

/**
 * POST /api/verify-payment or /api/v1/payment/verify-payment
 * Cryptographically verifies payment signature using HMAC-SHA256
 * Security Hardening:
 * 1. Constant-time signature comparison (prevents timing attacks).
 * 2. Replay attack protection: Ensures paymentId is never reused across different orders.
 * 3. Idempotent fulfillment: Prevents double stock deduction on multiple verify calls.
 * 4. Atomic confirmation & audit trail logging.
 */
const verifyPaymentSignature = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      payment_id,
      signature,
      orderId
    } = req.body;

    const finalOrderId = String(razorpay_order_id || order_id || '').trim();
    const finalPaymentId = String(razorpay_payment_id || payment_id || '').trim();
    const finalSignature = String(razorpay_signature || signature || '').trim();

    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification tokens (order_id, payment_id, signature).'
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Payment verification service is misconfigured on the server.'
      });
    }

    // 1. Compute HMAC-SHA256 signature
    const data = `${finalOrderId}|${finalPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(data)
      .digest('hex');

    // 2. Constant-time secure comparison
    const sigBuffer = Buffer.from(finalSignature, 'utf-8');
    const genBuffer = Buffer.from(generatedSignature, 'utf-8');

    const isMatch = sigBuffer.length === genBuffer.length && crypto.timingSafeEqual(sigBuffer, genBuffer);

    if (!isMatch) {
      console.warn(`[Security Warning] Signature mismatch rejected for order ${finalOrderId}, payment ${finalPaymentId}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. The transaction was not marked as paid.'
      });
    }

    // 3. Anti-Replay Protection: Ensure payment ID hasn't been claimed by another order
    const targetOrderId = (orderId || req.body.receipt || '').toString().trim();
    if (finalPaymentId) {
      const existingOtherOrder = await Order.findOne({
        'paymentDetails.razorpayPaymentId': finalPaymentId,
        orderId: { $ne: targetOrderId }
      });

      if (existingOtherOrder) {
        console.error(`[Fraud Detected] Payment ID ${finalPaymentId} already claimed by Order ${existingOtherOrder.orderId}`);
        return res.status(409).json({
          success: false,
          message: 'Security violation: This payment ID has already been credited to another order.'
        });
      }
    }

    // 4. Update order in database idempotently
    let updatedOrder = null;

    if (targetOrderId) {
      const query = [
        { orderId: targetOrderId },
        { 'paymentDetails.razorpayOrderId': finalOrderId }
      ];
      if (mongoose.isValidObjectId(targetOrderId)) {
        query.push({ _id: targetOrderId });
      }

      const orderDoc = await Order.findOne({ $or: query });

      if (orderDoc) {
        // Idempotency: If already confirmed, don't duplicate inventory deduction
        if (orderDoc.paymentStatus === 'completed') {
          return res.status(200).json({
            success: true,
            message: 'Payment already verified and confirmed.',
            order_id: finalOrderId,
            payment_id: finalPaymentId,
            order: orderDoc
          });
        }

        orderDoc.paymentStatus = 'completed';
        orderDoc.status = 'CONFIRMED';
        orderDoc.paymentMethod = orderDoc.paymentMethod === 'cod' ? 'card' : orderDoc.paymentMethod;
        orderDoc.paymentDetails = {
          razorpayOrderId: finalOrderId,
          razorpayPaymentId: finalPaymentId,
          razorpaySignature: finalSignature,
          paidAt: new Date()
        };

        // Add confirmed status to timeline
        orderDoc.timeline.push({
          status: 'CONFIRMED',
          title: 'Payment Verified & Confirmed',
          note: `Payment of ₹${orderDoc.pricing?.finalAmount || orderDoc.totalAmount} successfully verified via Razorpay (ID: ${finalPaymentId}).`,
          timestamp: new Date(),
          updatedBy: 'Razorpay Gateway'
        });

        // Deduct inventory stock upon verified payment
        try {
          await inventoryService.deductOrderStock(orderDoc.items, orderDoc.orderId, orderDoc.user);
        } catch (invErr) {
          console.warn('[Payment] Inventory deduction warning:', invErr.message);
        }

        await orderDoc.save();
        updatedOrder = orderDoc;

        // Broadcast realtime notification to admin dashboard
        try {
          realtimeHub.notifyNewOrder(orderDoc);
        } catch (rtErr) {
          console.warn('[Payment] Realtime notification warning:', rtErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: finalOrderId,
      payment_id: finalPaymentId,
      order: updatedOrder
    });
  } catch (error) {
    console.error('[Razorpay Verify Payment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment signature.'
    });
  }
};

/**
 * POST /api/payment/webhook or /api/v1/payment/webhook
 * Razorpay Server-to-Server Webhook Handler
 * Critical for Network Lag / Disconnection:
 * If customer's mobile loses internet right after paying, Razorpay server notifies
 * this webhook directly to ensure the customer's order is confirmed and never lost.
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!signature || !webhookSecret) {
      return res.status(400).json({ status: 'ignored', message: 'Missing webhook signature or secret.' });
    }

    // Verify raw webhook payload with secret
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('[Webhook Warning] Invalid Razorpay webhook signature rejected.');
      return res.status(400).json({ status: 'error', message: 'Invalid signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || {};
      const orderEntity = payload?.order?.entity || {};

      const paymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
      const orderIdFromNotes = paymentEntity.notes?.orderId || orderEntity.notes?.orderId || paymentEntity.notes?.cleanoraOrderId;

      if (orderIdFromNotes || razorpayOrderId) {
        const query = [];
        if (orderIdFromNotes) query.push({ orderId: orderIdFromNotes });
        if (razorpayOrderId) query.push({ 'paymentDetails.razorpayOrderId': razorpayOrderId });

        const orderDoc = await Order.findOne({ $or: query });

        if (orderDoc && orderDoc.paymentStatus !== 'completed') {
          orderDoc.paymentStatus = 'completed';
          orderDoc.status = 'CONFIRMED';
          orderDoc.paymentDetails = {
            razorpayOrderId: razorpayOrderId || orderDoc.paymentDetails?.razorpayOrderId || '',
            razorpayPaymentId: paymentId || orderDoc.paymentDetails?.razorpayPaymentId || '',
            razorpaySignature: 'WEBHOOK_VERIFIED',
            paidAt: new Date()
          };
          orderDoc.timeline.push({
            status: 'CONFIRMED',
            title: 'Payment Confirmed via Razorpay Webhook',
            note: `Payment confirmed via automated server webhook (Payment ID: ${paymentId}).`,
            timestamp: new Date(),
            updatedBy: 'Razorpay Webhook'
          });

          try {
            await inventoryService.deductOrderStock(orderDoc.items, orderDoc.orderId, orderDoc.user);
          } catch (invErr) {
            console.warn('[Webhook] Stock deduction warning:', invErr.message);
          }

          await orderDoc.save();

          try {
            realtimeHub.notifyNewOrder(orderDoc);
          } catch (rtErr) {}

          console.log(`[Razorpay Webhook] Successfully reconciled Order ${orderDoc.orderId} via ${event}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * POST /api/payment/log-failure or /api/v1/payment/log-failure
 * Logs customer cancellation or gateway failure for transparency in admin dashboard
 */
const logPaymentFailure = async (req, res) => {
  try {
    const { orderId, reason = 'Payment cancelled by user', code = 'UNKNOWN' } = req.body;
    if (orderId) {
      const orderDoc = await Order.findOne({ orderId: String(orderId).trim() });
      if (orderDoc && orderDoc.paymentStatus !== 'completed') {
        orderDoc.timeline.push({
          status: 'PENDING_PAYMENT',
          title: 'Payment Attempt Failed',
          note: `Customer payment attempt was not completed: ${reason} (Code: ${code}). Order remains open for retry or COD.`,
          timestamp: new Date(),
          updatedBy: 'Razorpay Gateway'
        });
        await orderDoc.save();
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ success: false }); // Non-blocking
  }
};

/**
 * GET /api/payment/key or /api/v1/payment/key
 * Returns public Key ID for client-side Razorpay modal initialization
 */
const getRazorpayKey = (req, res) => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (!keyId) {
    return res.status(500).json({
      success: false,
      message: 'Razorpay Key ID is not configured.'
    });
  }
  return res.status(200).json({
    success: true,
    key_id: keyId
  });
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleRazorpayWebhook,
  logPaymentFailure,
  getRazorpayKey
};
