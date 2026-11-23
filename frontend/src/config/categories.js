/**
 * ASM Shine - Centralized Category Configuration
 * Single Source of Truth across Frontend and Admin Panel.
 *
 * Official Category List (9 items):
 * - 1 Frontend filter only: 'all-products'
 * - 8 assignable product categories
 */

export const OFFICIAL_CATEGORIES = [
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

export const FRONTEND_FILTER_CATEGORIES = [
  {
    id: 'all-products',
    name: 'All Products',
    icon: 'Layers',
    desc: 'ASM Shine Home Hygiene & Cleaning Collection',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938241/asm-shine/categories/all.jpg'
  },
  ...OFFICIAL_CATEGORIES
];

// Mapping dictionary of legacy category identifiers found in existing records
export const LEGACY_CATEGORY_MAP = {
  everyday_essentials: 'Everyday Essentials',
  dishwash_solutions: 'Dishwash Solutions',
  laundry_fabrics: 'Laundry & Fabrics',
  bathroom_surfaces: 'Bathroom & Surfaces',
  floor_care: 'Floor Care',
  glass_care: 'Glass Care',
  toilet_care: 'Toilet Care',
  bathroom_care: 'Bathroom Care',
  dishwash: 'Dishwash Gel',
  kitchen_care: 'Kitchen Care',
  laundry_care: 'Laundry Care'
};

export const isLegacyCategory = (category) => {
  if (!category) return false;
  return !OFFICIAL_CATEGORIES.some((c) => c.id === category);
};

export const getCategoryDisplayName = (categoryId) => {
  if (!categoryId) return '';
  if (categoryId === 'all' || categoryId === 'all-products') return 'All Products';
  const official = OFFICIAL_CATEGORIES.find((c) => c.id === categoryId);
  if (official) return official.name;
  if (LEGACY_CATEGORY_MAP[categoryId]) return LEGACY_CATEGORY_MAP[categoryId];
  return categoryId.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};
