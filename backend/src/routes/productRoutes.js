const express = require('express');
const router = express.Router();
const { getProducts, getProductById, addProductReview } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', addProductReview);

module.exports = router;
