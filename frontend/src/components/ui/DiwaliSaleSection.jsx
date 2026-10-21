import React from 'react';
import { ChevronRight } from 'lucide-react';

export const DiwaliSaleSection = ({ onSelectProduct, onNavigateAll }) => {
  // Hero Festive Deal: 5L Floor Cleaner Canister
  const heroDeal = {
    id: 'asm_floor_1',
    badge: 'FESTIVE HERO DEAL',
    title: 'ASM Shine 5 Litre Floor Cleaner',
    description: 'Hospital-grade mirror reflection for vitrified tiles, marble & granite. Cuts through festival footprints & stubborn grime.',
    price: 249,
    mrp: 399,
    discount: '38% off',
    image: '/images/banners/banner_floor_cleaner_5l.jpg'
  };

  // 3 Essential Festive Cleaning Categories
  const festivePicks = [
    {
      id: 'asm_toilet_1',
      badge: 'FESTIVE SPECIAL',
      category: 'RESTROOM HYGIENE',
      title: 'ASM Smart Clean Toilet Cleaner',
      size: '500 ml Pack',
      price: 69,
      mrp: 135,
      discount: '49% off',
      image: '/images/products/product_disinfectant.png'
    },
    {
      id: 'asm_glass_1',
      badge: 'STREAK-FREE',
      category: 'MIRRORS & GLASS',
      title: 'ASM Crystal Clear Glass Spray',
      size: '500 ml Trigger',
      price: 119,
      mrp: 165,
      discount: '28% off',
      image: '/images/products/product_glass_cleaner.png'
    },
    {
      id: 'asm_bath_1',
      badge: 'HARD WATER EXPERT',
      category: 'TILES & BASINS',
      title: 'ASM Ceramic Descaler Cleaner',
      size: '1 Liter Deep Clean',
      price: 179,
      mrp: 249,
      discount: '28% off',
      image: '/images/products/product_bathroom_cleaner.png'
    }
  ];

  const handleSelect = (id) => {
    if (onSelectProduct) {
      onSelectProduct({ id });
    }
  };

  return (
    <section className="fk-diwali-section" aria-label="Diwali Mega Sale">
      {/* 1. Curated Festive Header Bar */}
      <div className="fk-diwali-header-bar">
        <div className="fk-diwali-header-info">
          <span className="fk-diwali-kicker">FESTIVE CLEANING STORE</span>
          <h2 className="fk-diwali-main-heading">Diwali Mega Sale</h2>
          <p className="fk-diwali-sub-heading">A Cleaner Home, Brighter Celebrations</p>
        </div>

        <div className="fk-diwali-header-actions">
          <span className="fk-diwali-offer-pill">UP TO 49% OFF</span>
          {onNavigateAll && (
            <button
              type="button"
              className="fk-diwali-see-all-btn"
              onClick={onNavigateAll}
              aria-label="View all festive products"
            >
              <span>Explore</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Featured Hero Spotlight Card (Wide) */}
      <div
        className="fk-diwali-hero-spotlight"
        onClick={() => handleSelect(heroDeal.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(heroDeal.id);
          }
        }}
      >
        <div className="fk-diwali-spotlight-text">
          <span className="fk-diwali-spotlight-badge">{heroDeal.badge}</span>
          <h3 className="fk-diwali-spotlight-title">{heroDeal.title}</h3>
          <p className="fk-diwali-spotlight-desc">{heroDeal.description}</p>

          <div className="fk-diwali-spotlight-price-row">
            <div className="fk-diwali-spotlight-pricing">
              <span className="fk-diwali-spotlight-price">₹{heroDeal.price}</span>
              <span className="fk-diwali-spotlight-mrp">₹{heroDeal.mrp}</span>
            </div>
            <span className="fk-diwali-spotlight-discount">{heroDeal.discount}</span>
          </div>
        </div>

        <div className="fk-diwali-spotlight-img-wrap">
          <img
            src={heroDeal.image}
            alt={heroDeal.title}
            className="fk-diwali-spotlight-img"
            loading="lazy"
          />
        </div>
      </div>

      {/* 3. 3-Card Grid for Essential Cleaning Categories */}
      <div className="fk-diwali-trio-grid">
        {festivePicks.map((item) => (
          <article
            key={item.id}
            className="fk-diwali-mini-card"
            onClick={() => handleSelect(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(item.id);
              }
            }}
          >
            <span className="fk-diwali-mini-badge">{item.badge}</span>

            <div className="fk-diwali-mini-img-wrap">
              <img
                src={item.image}
                alt={item.title}
                className="fk-diwali-mini-img"
                loading="lazy"
              />
            </div>

            <div className="fk-diwali-mini-body">
              <span className="fk-diwali-mini-cat">{item.category}</span>
              <h4 className="fk-diwali-mini-title" title={item.title}>{item.title}</h4>
              <span className="fk-diwali-mini-size">{item.size}</span>

              <div className="fk-diwali-mini-price-row">
                <div className="fk-diwali-mini-pricing">
                  <span className="fk-diwali-mini-price">₹{item.price}</span>
                  <span className="fk-diwali-mini-mrp">₹{item.mrp}</span>
                </div>
                <span className="fk-diwali-mini-discount">{item.discount}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 4. Minimal Festive Trust Footnote */}
      <div className="fk-diwali-footnote">
        <span>Guaranteed Pre-Diwali Express Dispatch Active</span>
        <span className="fk-diwali-bullet">•</span>
        <span>100% Streak-Free & Germ Kill Certified</span>
      </div>
    </section>
  );
};
