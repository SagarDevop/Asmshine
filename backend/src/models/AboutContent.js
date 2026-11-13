const mongoose = require('mongoose');

const DEFAULT_PILLARS = [
  {
    step: 1,
    title: '10X Limescale Dissolution',
    description:
      'Organic descaling agents break molecular calcium and yellow mineral deposits in commodes and bathroom tiles in under 5 minutes without eroding grout or chrome faucets.',
    icon: 'ShieldCheck',
    isEnabled: true
  },
  {
    step: 2,
    title: 'Streak-Free Colin Power',
    description:
      'Anti-static polymer film repels dust and dissolves oily fingerprints instantly, ensuring 100% crystal transparency on mirrors, dining tables, and car windshields.',
    icon: 'SprayCan',
    isEnabled: true
  },
  {
    step: 3,
    title: '99.9% Antimicrobial Shield',
    description:
      'Hospital-grade disinfection verified by NABL labs, eradicating viruses, bacteria, and mold while releasing fresh ocean and citrus aromatherapy notes.',
    icon: 'Sparkles',
    isEnabled: true
  }
];

const DEFAULT_COMPARISON_ITEMS = [
  {
    feature: 'Hard Water TDS Removal',
    asmShine: '10X Fast Descaling',
    ordinaryCleaners: 'Requires hard scrubbing'
  },
  {
    feature: 'Fume Safety',
    asmShine: 'Zero Choking Fumes',
    ordinaryCleaners: 'Pungent acid odor'
  },
  {
    feature: 'Vertical Cling Viscosity',
    asmShine: 'Thick Active Gel',
    ordinaryCleaners: 'Watery runoff'
  },
  {
    feature: 'Mirror & Glass Clarity',
    asmShine: '100% Zero Streaks',
    ordinaryCleaners: 'Leaves cloudy film'
  }
];

const pillarSchema = new mongoose.Schema({
  step: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'ShieldCheck' },
  isEnabled: { type: Boolean, default: true }
}, { _id: false });

const comparisonItemSchema = new mongoose.Schema({
  feature: { type: String, required: true },
  asmShine: { type: String, default: '' },
  ordinaryCleaners: { type: String, default: '' }
}, { _id: false });

const aboutContentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'PUBLISHED',
      index: true
    },
    version: {
      type: Number,
      default: 1
    },

    // 1. Hero Section
    hero: {
      brandName: { type: String, default: 'ASM SHINE' },
      heading: { type: String, default: 'The ASM Shine Standard' },
      tagline: { type: String, default: 'SPOTLESS CLEAN • SPARKLING SHINE' },
      badge: { type: String, default: 'ADVANCED HYGIENE & CLEANING' },
      image: { type: String, default: '/images/banners/hero_banner_photo.png' },
      imageAlt: { type: String, default: 'ASM Shine Hygiene Formulations' },
      metaChips: {
        type: [String],
        default: ['99.9% Certified Germ Kill', '10X Limescale Cutter', 'Zero Harsh Acid Fumes']
      },
      isVisible: { type: Boolean, default: true }
    },

    // 2. The Genesis Story / Manifesto
    story: {
      tag: { type: String, default: 'OUR STORY & PURPOSE' },
      title: { type: String, default: 'Formulated For Indian Water & Homes' },
      description: {
        type: String,
        default:
          'Conventional cleaners in India rely on harsh, choking hydrochloric acid or watery detergents that fail against heavy borewell water stains and stubborn kitchen grease. ASM Shine was formulated to redefine hygiene — combining thick vertical-clinging polymers, bio-active descalers, and natural essential oils that eradicate 99.9% of bacteria while leaving surfaces sparkling like mirrors.'
      },
      isVisible: { type: Boolean, default: true }
    },

    // 3. Mission & Vision
    mission: {
      title: { type: String, default: 'Our Mission: Safer, Healthier Homes' },
      description: {
        type: String,
        default:
          'To deliver laboratory-grade disinfection without hazardous chemical fumes, ensuring every Indian family enjoys hospital-grade hygiene, sparkling surfaces, and long-lasting freshness.'
      },
      image: { type: String, default: '/images/banners/hero_banner_photo.png' },
      isVisible: { type: Boolean, default: true }
    },
    vision: {
      title: { type: String, default: 'Our Vision: Sustainable Indian Hygiene' },
      description: {
        type: String,
        default:
          'Pioneering non-corrosive, plumbing-safe cleaning technologies that respect family health, protect domestic plumbing, and deliver instant stain removal across Pan-India homes.'
      },
      image: { type: String, default: '' },
      isVisible: { type: Boolean, default: true }
    },

    // 4. 3 Pillars (Why Choose ASM Shine)
    pillars: {
      type: [pillarSchema],
      default: () => DEFAULT_PILLARS
    },
    pillarsVisible: { type: Boolean, default: true },

    // 5. Comparison Table (The Verdict)
    comparison: {
      tag: { type: String, default: 'THE VERDICT' },
      title: { type: String, default: 'ASM Shine vs Conventional Cleaners' },
      items: {
        type: [comparisonItemSchema],
        default: () => DEFAULT_COMPARISON_ITEMS
      },
      isVisible: { type: Boolean, default: true }
    },

    // 6. Product Showcase Section
    productShowcase: {
      heading: { type: String, default: 'Specialized Cleaning Formulations' },
      description: {
        type: String,
        default:
          'Engineered for Indian homes and commercial spaces. Discover targeted solutions for toilets, glass, tiles, kitchens, and floors.'
      },
      isVisible: { type: Boolean, default: true }
    },

    // 7. Direct Manufacturer Support / Contact
    contact: {
      tag: { type: String, default: 'CUSTOMER CARE' },
      title: { type: String, default: 'Direct Manufacturer Support' },
      helpline: { type: String, default: '1800-ASM-SHINE (276-744)' },
      email: { type: String, default: 'care@asmshine.com' },
      address: { type: String, default: 'ASM Shine Hygiene Labs Pvt Ltd, New Delhi 110001' },
      operatingHours: { type: String, default: 'Monday – Saturday, 9:00 AM – 6:00 PM IST' },
      isVisible: { type: Boolean, default: true }
    },

    // 8. SEO Metadata
    seo: {
      metaTitle: {
        type: String,
        default: 'About Us — The ASM Shine Standard of Hygiene & Cleanliness'
      },
      metaDescription: {
        type: String,
        default:
          'Discover how ASM Shine engineers high-performance toilet cleaners, surface sprays, and kitchen degreasers for Indian hard water with zero harsh acid fumes.'
      },
      canonicalUrl: {
        type: String,
        default: 'https://www.asmshine.com/about'
      },
      ogTitle: {
        type: String,
        default: 'About ASM Shine — Advanced Cleaning & Hygiene Solutions'
      },
      ogDescription: {
        type: String,
        default:
          'Formulated specifically for Indian water conditions. Hospital-grade 99.9% germ kill with 10X limescale dissolution.'
      },
      ogImage: {
        type: String,
        default: '/images/banners/hero_banner_photo.png'
      },
      keywords: {
        type: [String],
        default: [
          'ASM Shine',
          'cleaners India',
          'toilet cleaner',
          'glass spray',
          'hard water descaler',
          'hygiene labs'
        ]
      }
    },

    publishedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
);

/**
 * Singleton getter for Published content.
 * Automatically seeds the existing About Us content if no record exists.
 */
aboutContentSchema.statics.getPublishedContent = async function () {
  let content = await this.findOne({ status: 'PUBLISHED' }).sort({ updatedAt: -1 });
  if (!content) {
    content = await this.create({ status: 'PUBLISHED' });
    console.log('[AboutContent] Seeded initial published About Us content.');
  } else if (!content.pillars || content.pillars.length === 0) {
    content.pillars = DEFAULT_PILLARS;
    if (!content.comparison || !content.comparison.items || content.comparison.items.length === 0) {
      content.comparison = content.comparison || {};
      content.comparison.items = DEFAULT_COMPARISON_ITEMS;
    }
    await content.save();
    console.log('[AboutContent] Auto-healed empty pillars and comparison items.');
  }
  return content;
};

/**
 * Singleton getter for Draft content.
 * Returns existing draft or creates one cloned from published content.
 */
aboutContentSchema.statics.getDraftContent = async function () {
  let draft = await this.findOne({ status: 'DRAFT' });
  if (!draft) {
    const published = await this.getPublishedContent();
    const publishedObj = published.toObject();
    delete publishedObj._id;
    delete publishedObj.createdAt;
    delete publishedObj.updatedAt;
    delete publishedObj.__v;

    draft = await this.create({
      ...publishedObj,
      status: 'DRAFT'
    });
    console.log('[AboutContent] Created draft clone from published About Us content.');
  }
  return draft;
};

module.exports = mongoose.model('AboutContent', aboutContentSchema);
