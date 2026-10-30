const mongoose = require('mongoose');
const Product = require('../models/Product');
const { initialProducts } = require('../data/seedData');
const { getDbStatus } = require('../config/db');

// In-memory cache & fallback store
let memoryProducts = [...initialProducts];

const removeMemoryProduct = (id) => {
  memoryProducts = memoryProducts.filter((p) => p.id !== id && p._id?.toString() !== id);
};

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

      // Strictly return ACTIVE products only. Exclude any archived or deleted items.
      const query = {
        status: 'active'
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

      const products = await Product.find(query, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).lean();
      return products;
    } catch (e) {
      console.warn('[ProductService] DB query failed, fallback to in-memory:', e.message);
    }
  }

  // In-memory filtering fallback (only active items)
  return memoryProducts.filter((p) => {
    if (p.status && p.status !== 'active') return false;
    if (filters.section && p.section !== filters.section) return false;
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchShort = p.shortName?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchHighlights = p.highlights?.some((h) => h.toLowerCase().includes(q));
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
      const isObjectId = mongoose.isValidObjectId(id);
      const found = await Product.findOne(
        {
          $or: [{ id }, { _id: isObjectId ? id : null }],
          status: 'active'
        },
        { _id: 0, __v: 0 }
      ).lean();

      if (found) return found;
      // If product is deleted or archived, return null immediately
      return null;
    } catch (e) {
      console.warn('[ProductService] DB lookup failed:', e.message);
    }
  }
  const mem = memoryProducts.find((p) => (p.id === id || p._id?.toString() === id) && p.status !== 'archived');
  return mem || null;
};

module.exports = { getAllProducts, getProductById, removeMemoryProduct };
