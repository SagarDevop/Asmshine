import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';

export const DealsForYou = ({ onSelectProduct, onNavigateAll }) => {
  // Curated Flash & Budget Deals matching the store's top offers
  const deals = [
    {
      id: 'asm_toilet_1',
      name: 'ASM Smart Clean Toilet Cleaner',
      size: '500 ml Pack',
      dealPrice: 69,
      mrp: 135,
      discount: '49% off',
      badge: 'SPECIAL ₹69',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg'
    },
    {
      id: 'asm_dish_1',
      name: 'ASM Shine Smart Wash Dishwash Liquid',
      size: '500 ml Bottle',
      dealPrice: 89,
      mrp: 125,
      discount: '29% off',
      badge: 'UNDER ₹99',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg'
    },
    {
      id: 'asm_glass_1',
      name: 'ASM Crystal Clear Glass Spray',
      size: '500 ml Trigger',
      dealPrice: 119,
      mrp: 165,
      discount: '28% off',
      badge: 'TOP DEAL',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg'
    },
    {
      id: 'asm_hand_1',
      name: 'ASM PureShield Handwash Refill',
      size: '500 ml Pump',
      dealPrice: 79,
      mrp: 110,
      discount: '28% off',
      badge: 'STEAL DEAL',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg'
    },
    {
      id: 'asm_bath_1',
      name: 'ASM Shine Bathroom Descaler',
      size: '1 Liter Bottle',
      dealPrice: 129,
      mrp: 179,
      discount: '28% off',
      badge: 'HARD WATER',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg'
    },
    {
      id: 'asm_floor_1',
      name: 'ASM Shine Surface & Floor Cleaner',
      size: '1 Liter Bottle',
      dealPrice: 149,
      mrp: 219,
      discount: '32% off',
      badge: 'BEST VALUE',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg'
    }
  ];

  // Subtle live countdown timer: 05h : 24m : 18s
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (n) => String(n).padStart(2, '0');

  const handleCardClick = (deal) => {
    if (onSelectProduct) {
      onSelectProduct({ id: deal.id });
    }
  };

  return (
    <section className="fk-deals-section" aria-label="Deals for You">
      {/* Clean Minimal Header with Timer */}
      <div className="fk-deals-header">
        <div className="fk-deals-title-group">
          <h2 className="fk-deals-title">Deals for You</h2>
          <div className="fk-deals-timer" title="Deal ends soon">
            <Clock size={12} className="fk-timer-icon" />
            <span className="fk-timer-text">
              Ends in {formatNum(timeLeft.hours)}h : {formatNum(timeLeft.minutes)}m : {formatNum(timeLeft.seconds)}s
            </span>
          </div>
        </div>

        <button
          type="button"
          className="fk-deals-view-all"
          onClick={onNavigateAll}
          aria-label="View all deals"
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scrollable Rail of Deal Cards */}
      <div className="fk-deals-scroll-rail">
        {deals.map((deal) => (
          <article
            key={deal.id + deal.dealPrice}
            className="fk-deal-card"
            onClick={() => handleCardClick(deal)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(deal);
              }
            }}
          >
            {/* Top Deal Badge */}
            <span className="fk-deal-badge">{deal.badge}</span>

            {/* Product Thumbnail */}
            <div className="fk-deal-img-wrap">
              <img
                src={deal.image}
                alt={deal.name}
                className="fk-deal-img"
                loading="lazy"
              />
            </div>

            {/* Product Info */}
            <div className="fk-deal-body">
              <h3 className="fk-deal-name" title={deal.name}>
                {deal.name}
              </h3>
              <span className="fk-deal-size">{deal.size}</span>

              {/* Price & Discount Row (No cluttering Add button) */}
              <div className="fk-deal-price-row">
                <div className="fk-deal-pricing">
                  <span className="fk-deal-price">₹{deal.dealPrice}</span>
                  <span className="fk-deal-mrp">₹{deal.mrp}</span>
                </div>
                <span className="fk-deal-discount-tag">
                  {deal.discount}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
