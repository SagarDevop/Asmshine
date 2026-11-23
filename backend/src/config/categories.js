/**
 * ASM Shine - Centralized Category Configuration (Backend)
 * Single Source of Truth for product categories across APIs & validation.
 *
 * 9 Categories total:
 * - 1 Frontend filter: 'all-products'
 * - 8 assignable product categories
 */

const OFFICIAL_CATEGORIES = [
  {
    id: 'toilet-cleaner',
    name: 'Toilet Cleaner',
    icon: 'ShieldCheck',
    desc: 'Power Disinfectant & Hard Limescale Remover',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938256/asm-shine/categories/toilet_care.jpg'
  },
  {
    id: 'bathroom-tiles',
    name: 'Bathroom & Tiles',
    icon: 'Bath',
    desc: 'Hard Water Descaler & Soap Scum Removal',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938242/asm-shine/categories/bathroom_care.jpg'
  },
  {
    id: 'glass-colin',
    name: 'Glass & Colin',
    icon: 'SprayCan',
    desc: 'Streak-Free Crystal Shine Spray (Colin Style)',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938247/asm-shine/categories/glass_care.jpg'
  },
  {
    id: 'floor-cleaner',
    name: 'Floor Cleaner',
    icon: 'Brush',
    desc: 'Citrus & Pine Disinfectant Surface Cleansers',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938246/asm-shine/categories/floor_care.jpg'
  },
  {
    id: 'dish-wash-gel',
    name: 'Dish Wash Gel',
    icon: 'Utensils',
    desc: 'Concentrated Turbo Lemon Anti-Grease Gel',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938244/asm-shine/categories/dishwash.jpg'
  },
  {
    id: 'kitchen-chimney',
    name: 'Kitchen & Chimney',
    icon: 'CookingPot',
    desc: 'Heavy-Duty Degreaser & Burnt Oil Remover',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938253/asm-shine/categories/kitchen_care.jpg'
  },
  {
    id: 'laundry-detergent',
    name: 'Laundry Detergent',
    icon: 'Shirt',
    desc: 'Ultra Fabric Care Liquid Detergent & Brightener',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938254/asm-shine/categories/laundry_care.jpg'
  },
  {
    id: 'hand-hygiene',
    name: 'Hand Hygiene',
    icon: 'Droplets',
    desc: 'Antibacterial Aloe & Vitamin E Handwash',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938250/asm-shine/categories/hand_hygiene.jpg'
  }
];

const OFFICIAL_CATEGORY_IDS = OFFICIAL_CATEGORIES.map((c) => c.id);

const FILTER_ONLY_SLUGS = ['all', 'all-products'];

const isFilterOnlyCategory = (category) => {
  return FILTER_ONLY_SLUGS.includes(category);
};

module.exports = {
  OFFICIAL_CATEGORIES,
  OFFICIAL_CATEGORY_IDS,
  FILTER_ONLY_SLUGS,
  isFilterOnlyCategory
};
