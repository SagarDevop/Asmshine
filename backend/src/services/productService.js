const Product = require('../models/Product');
const { initialProducts } = require('../data/seedData');
const { getDbStatus } = require('../config/db');

// In-memory cache & fallback store
let memoryProducts = [...initialProducts];

const getAllProducts = async (filters = {}) => {
  const { connected } = getDbStatus();
  if (connected) {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        for (const prod of initialProducts) {
          await Product.findOneAndUpdate(
            { id: prod.id },
            { $set: prod },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        console.log('[Database] Auto-seeded initial ASM Shine products to MongoDB');
      }

      const query = {
        // Target active catalog products (ASM Shine collection)
        id: { $in: initialProducts.map(p => p.id) }
      };

      if (filters.section) {
        query.section = filters.section;
      }

      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim();
        const regex = { $regex: q, $options: 'i' };
        query.$or = [
          { name: regex },
          { shortName: regex },
          { description: regex },
          { highlights: regex },
          { category: regex }
        ];
      }

      const products = await Product.find(query, { _id: 0, __v: 0 }).lean();
      return products;
    } catch (e) {
      console.warn('[ProductService] DB query failed, fallback to in-memory:', e.message);
    }
  }

  // In-memory filtering fallback
  return memoryProducts.filter(p => {
    if (filters.section && p.section !== filters.section) return false;
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchShort = p.shortName?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchHighlights = p.highlights?.some(h => h.toLowerCase().includes(q));
      if (!matchName && !matchShort && !matchDesc && !matchCat && !matchHighlights) return false;
    }
    return true;
  });
};

const getProductById = async (id) => {
  if (!id) return null;
  const { connected } = getDbStatus();
  if (connected) {
    try {
      const found = await Product.findOne({ id }, { _id: 0, __v: 0 }).lean();
      if (found) return found;
    } catch (e) {
      console.warn('[ProductService] DB lookup failed, fallback to in-memory:', e.message);
    }
  }
  return memoryProducts.find(p => p.id === id) || null;
};

module.exports = { getAllProducts, getProductById };

