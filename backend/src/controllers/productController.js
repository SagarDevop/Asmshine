const mongoose = require('mongoose');
const Product = require('../models/Product');
const productService = require('../services/productService');

const getProducts = async (req, res, next) => {
  try {
    const { section, category, search } = req.query;
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
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

    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
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
    const { rating = 5, title, comment } = req.body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID parameter is required'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to write a review'
      });
    }

    const cleanComment = (comment || '').trim();
    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your review feedback'
      });
    }

    // Auto-resolve author name from authenticated user profile
    const cleanAuthor = (user.name || req.body.author || 'Verified Customer').trim();

    // Auto-resolve location: provided by client, or from user's saved addresses, or default
    let cleanLocation = (req.body.location || '').trim();
    if (!cleanLocation && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defAddr.city && defAddr.state) {
        cleanLocation = `${defAddr.city}, ${defAddr.state}`;
      } else if (defAddr.city) {
        cleanLocation = defAddr.city;
      }
    }
    if (!cleanLocation) {
      cleanLocation = 'Verified Buyer';
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanTitle = (title || '').trim() || (numRating >= 4 ? 'Great Quality!' : 'Customer Review');

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
      title: cleanTitle,
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
