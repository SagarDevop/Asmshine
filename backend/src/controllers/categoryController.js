const Category = require('../models/Category');
const { initialCategories } = require('../data/seedData');
const { getDbStatus } = require('../config/db');

const getCategories = async (req, res, next) => {
  try {
    const { connected } = getDbStatus();
    if (connected) {
      try {
        const count = await Category.countDocuments();
        if (count === 0) {
          for (const cat of initialCategories) {
            await Category.findOneAndUpdate(
              { id: cat.id },
              { $set: cat },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
        const categories = await Category.find({}, { _id: 0, __v: 0 }).sort({ createdAt: 1 }).lean();
        return res.status(200).json({
          success: true,
          count: categories.length,
          data: categories
        });
      } catch (err) {
        console.warn('[CategoryController] DB fetch failed, falling back to in-memory:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      count: initialCategories.length,
      data: initialCategories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories };

