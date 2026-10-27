import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets
} from 'lucide-react';

const imageMap = {
  all: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938241/asm-shine/categories/all.jpg',
  toilet_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938256/asm-shine/categories/toilet_care.jpg',
  bathroom_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938242/asm-shine/categories/bathroom_care.jpg',
  glass_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938247/asm-shine/categories/glass_care.jpg',
  floor_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938246/asm-shine/categories/floor_care.jpg',
  dishwash: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938244/asm-shine/categories/dishwash.jpg',
  kitchen_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938253/asm-shine/categories/kitchen_care.jpg',
  laundry_care: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938254/asm-shine/categories/laundry_care.jpg',
  hand_hygiene: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938250/asm-shine/categories/hand_hygiene.jpg'
};

const iconMap = {
  toilet_care: ShieldCheck,
  bathroom_care: Bath,
  glass_care: SprayCan,
  floor_care: Brush,
  dishwash: Utensils,
  kitchen_care: CookingPot,
  laundry_care: Shirt,
  hand_hygiene: Droplets
};

export const CategoryScroller = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <section className="categories-section" aria-label="Product Categories">
      <div className="categories-track no-scrollbar">
        {categories.map((cat) => {
          const imgUrl = imageMap[cat.id];
          const IconComp = iconMap[cat.id] || Sparkles;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`category-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <div className="category-icon-box">
                {imgUrl ? (
                  <img src={imgUrl} alt={cat.name} className="desktop-cat-img" loading="lazy" />
                ) : (
                  <IconComp size={22} strokeWidth={1.9} color="#059669" />
                )}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
