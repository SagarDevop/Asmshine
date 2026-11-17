const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  getRazorpayKey
} = require('../controllers/paymentController');

// Razorpay standard checkout endpoints
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPaymentSignature);
router.get('/key', getRazorpayKey);
router.get('/payment/key', getRazorpayKey);

module.exports = router;
