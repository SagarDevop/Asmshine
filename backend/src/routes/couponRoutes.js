const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Public customer routes for coupons
router.get('/available', couponController.getAvailableCoupons);
router.get('/', couponController.getAvailableCoupons);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
