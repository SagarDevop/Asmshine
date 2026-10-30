const Product = require('../models/Product');
const { initialBanners } = require('../data/seedData');

/**
 * GET /api/v1/banners
 * Returns promotional announcement, active hero carousel slides,
 * and dynamically curated festive Diwali banner products.
 */
const getBanners = async (req, res, next) => {
  try {
    const activeProducts = await Product.find({ status: 'active' }).sort({ updatedAt: -1 }).lean();
    const activeIds = new Set(activeProducts.map((p) => p.id));

    // 1. Curate Festive Diwali Products (Controlled by Admin via isFestiveDeal flag or active catalog)
    let festive = activeProducts.filter((p) => p.isFestiveDeal === true);

    // Graceful fallback to active items if none specifically tagged
    if (festive.length === 0) {
      festive = activeProducts.slice(0, 2);
    } else if (festive.length === 1 && activeProducts.length > 1) {
      const other = activeProducts.find((p) => p.id !== festive[0].id);
      if (other) festive.push(other);
    }

    const formattedFestive = festive.slice(0, 2).map((p, idx) => ({
      id: p.id,
      badge: p.festiveBadge || (idx === 0 ? 'FESTIVE SPECIAL' : 'VALUE PACK'),
      title: p.shortName || p.name,
      size: p.size || 'Standard Pack',
      price: p.price,
      mrp: p.originalPrice || Math.round(p.price * 1.3),
      discount: p.discountPercent ? `${p.discountPercent}% off` : 'Special Offer',
      image: p.image,
      inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0)
    }));

    // 2. Filter hero slides so slides never link to deleted products
    const validHeroSlides = (initialBanners.heroSlides || []).filter((slide) => {
      if (!slide.productId) return true;
      return activeIds.has(slide.productId);
    });

    res.status(200).json({
      success: true,
      data: {
        ...initialBanners,
        heroSlides: validHeroSlides.length > 0 ? validHeroSlides : (initialBanners.heroSlides || []).slice(0, 2),
        festiveProducts: formattedFestive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBanners };
