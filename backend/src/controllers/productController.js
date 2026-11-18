const mongoose = require('mongoose');
const Product = require('../models/Product');
const productService = require('../services/productService');

const getProducts = async (req, res, next) => {
  try {
    const { section, category, search } = req.query;
    const products = await productService.getAllProducts({ section, category, search });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID parameter is required'
      });
    }

    const product = await productService.getProductById(id.trim());
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id '${id}'`
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const addProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, location, rating = 5, title, comment } = req.body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID parameter is required'
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer name is required'
      });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanComment = (comment || '').trim();
    const cleanTitle = (title || '').trim();
    const cleanAuthor = author.trim();
    const cleanLocation = (location || 'Verified Buyer').trim();

    const isObjectId = mongoose.isValidObjectId(id);
    const product = await Product.findOne({
      $or: [{ id: id.trim() }, { _id: isObjectId ? id : null }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id '${id}'`
      });
    }

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author: cleanAuthor,
      location: cleanLocation,
      rating: numRating,
      date: 'Today',
      title: cleanTitle || 'Verified Experience',
      comment: cleanComment
    };

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    product.reviews.unshift(newReview);

    // Genuine recalculation of average rating & counts
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avgRating = Number((sumRatings / totalReviews).toFixed(1));

    product.rating = avgRating;
    product.reviewCount = String(totalReviews);
    product.ratingsCount = String(totalReviews);

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: newReview,
        rating: product.rating,
        reviewCount: product.reviewCount,
        reviews: product.reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, addProductReview };
