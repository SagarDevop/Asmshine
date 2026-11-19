const express = require('express');
const router = express.Router();
const { getProducts, getProductById, addProductReview } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', authenticate, addProductReview);

module.exports = router;
