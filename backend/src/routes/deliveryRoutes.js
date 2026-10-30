const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Public endpoints
router.get('/settings', deliveryController.getDeliverySettings);
router.get('/estimate', deliveryController.estimateDelivery);
router.get('/pincode/:pincode', deliveryController.getPincodeDetails);

module.exports = router;
