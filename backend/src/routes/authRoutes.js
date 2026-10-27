const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth mutations to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 attempts per 15-minute window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// Authentication Routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticate.optionalAuth, authController.getMe);

// Email OTP Signup Flow
router.post('/signup/send-otp', authLimiter, authController.sendSignupOtp);
router.post('/signup/verify-otp', authLimiter, authController.verifySignupOtp);
router.post('/signup/resend-otp', authLimiter, authController.resendSignupOtp);

// Account Profile & Address Management
router.put('/profile', authenticate, authController.updateProfile);
router.get('/addresses', authenticate, authController.getAddresses);
router.post('/addresses', authenticate, authController.addAddress);
router.delete('/addresses/:addressId', authenticate, authController.deleteAddress);
router.get('/orders', authenticate, authController.getOrders);

// Wishlist Management
router.get('/wishlist', authenticate, authController.getWishlist);
router.post('/wishlist/toggle', authenticate, authController.toggleWishlist);
router.post('/wishlist/sync', authenticate, authController.syncWishlist);

module.exports = router;
