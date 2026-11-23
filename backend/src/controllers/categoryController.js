const Category = require('../models/Category');
const { initialCategories } = require('../data/seedData');
const { getDbStatus } = require('../config/db');

let categoriesSeeded = false;

const getCategories = async (req, res, next) => {
  try {
    // Set lightweight browser/CDN cache headers for fast category rendering
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    const { connected } = getDbStatus();
    if (connected) {
      try {
        if (!categoriesSeeded) {
          categoriesSeeded = true;
          for (const cat of initialCategories) {
            await Category.findOneAndUpdate(
              { id: cat.id },
              { $set: cat },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
        const officialIds = initialCategories.map((c) => c.id);
        const categories = await Category.find({ id: { $in: officialIds } }, { _id: 0, __v: 0 }).lean();
        categories.sort((a, b) => officialIds.indexOf(a.id) - officialIds.indexOf(b.id));

        return res.status(200).json({
          success: true,
          count: categories.length > 0 ? categories.length : initialCategories.length,
          data: categories.length > 0 ? categories : initialCategories
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

