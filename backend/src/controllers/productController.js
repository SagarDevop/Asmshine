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

module.exports = { getProducts, getProductById };
