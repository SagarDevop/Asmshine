const express = require('express');
const router = express.Router();
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const bannerRoutes = require('./bannerRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const couponRoutes = require('./couponRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const policyRoutes = require('./policyRoutes');
const aboutRoutes = require('./aboutRoutes');
const paymentRoutes = require('./paymentRoutes');
const { getDbStatus } = require('../config/db');

// Health Check endpoint
router.get('/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus
  });
});

// Ultra-lightweight Keep-Alive / Ping endpoints (Zero DB overhead to prevent Render sleep)
router.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'ASM Shine backend is awake and active',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

router.get('/keep-alive', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'ASM Shine backend is awake and active',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Resources
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/coupons', couponRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/policies', policyRoutes);
router.use('/about', aboutRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
