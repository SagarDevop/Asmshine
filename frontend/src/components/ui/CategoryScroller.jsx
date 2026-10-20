import React from 'react';
import {
  Sparkles,
  Backpack,
  Briefcase,
  Luggage,
  ShoppingBag,
  Compass,
  Package
} from 'lucide-react';

const iconMap = {
  backpacks: Backpack,
  laptop_bags: Briefcase,
  travel_duffels: Luggage,
  totes: ShoppingBag,
  slings_crossbody: Compass,
  wallets_organizers: Package
};

export const CategoryScroller = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <section className="categories-section" aria-label="Product Categories">
      <div className="categories-track no-scrollbar">
        {categories.map((cat) => {
          const IconComp = iconMap[cat.id] || Sparkles;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`category-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <div className="category-icon-box">
                <IconComp size={22} strokeWidth={1.9} color="#1C8E8F" />
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
