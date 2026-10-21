import React from 'react';
import { ChevronRight } from 'lucide-react';

export const DiwaliSaleSection = ({ onSelectProduct, onNavigateAll }) => {
  // Exactly 2 curated festive cards (Toilet Cleaner & 5L Floor Cleaner)
  const festiveProducts = [
    {
      id: 'asm_toilet_1',
      badge: 'FESTIVE ₹69',
      title: 'ASM Smart Clean Toilet Cleaner',
      size: '500 ml Bottle',
      price: 69,
      mrp: 135,
      discount: '49% off',
      image: '/images/products/product_disinfectant.png'
    },
    {
      id: 'asm_floor_1',
      badge: '5L VALUE PACK',
      title: 'ASM Shine 5L Floor Cleaner',
      size: '5 Litre Jumbo Pack',
      price: 249,
      mrp: 399,
      discount: '38% off',
      image: '/images/banners/banner_floor_cleaner_5l.jpg',
      isBannerThumb: true
    }
  ];

  const handleCardClick = (id) => {
    if (onSelectProduct) {
      onSelectProduct({ id });
    }
  };

  return (
    <section className="fk-diwali-poster-block" aria-label="Diwali Mega Sale Poster">
      {/* Background Poster Artwork */}
      <img
        src="/images/banners/diwali_poster_bg.jpg"
        alt="Diwali Festive Background"
        className="fk-diwali-poster-backdrop"
        loading="lazy"
      />
      <div className="fk-diwali-poster-overlay" />

      {/* Content Placed Directly Inside the Poster Canvas */}
      <div className="fk-diwali-poster-content">
        {/* Poster Header */}
        <div className="fk-diwali-poster-header">
          <div className="fk-diwali-poster-tag-row">
            <span className="fk-diwali-poster-tag">DIWALI SPECIAL OFFERS</span>
            {onNavigateAll && (
              <button
                type="button"
                className="fk-diwali-poster-more-btn"
                onClick={onNavigateAll}
                aria-label="View all festive deals"
              >
                <span>View All</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
          <h2 className="fk-diwali-poster-title">Diwali Mega Sale</h2>
          <p className="fk-diwali-poster-sub">A Cleaner Home, Brighter Celebrations</p>
        </div>

        {/* 2 Embedded Product Cards Inside the Poster */}
        <div className="fk-diwali-poster-cards-row">
          {festiveProducts.map((product) => (
            <article
              key={product.id}
              className="fk-poster-product-card"
              onClick={() => handleCardClick(product.id)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(product.id);
                }
              }}
            >
              {/* Product Badge */}
              <span className="fk-poster-card-badge">{product.badge}</span>

              {/* Product Thumbnail */}
              <div className="fk-poster-card-img-wrap">
                <img
                  src={product.image}
                  alt={product.title}
                  className={`fk-poster-card-img ${product.isBannerThumb ? 'banner-fit' : ''}`}
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="fk-poster-card-body">
                <h3 className="fk-poster-card-name" title={product.title}>
                  {product.title}
                </h3>
                <span className="fk-poster-card-size">{product.size}</span>

                {/* Price & Offer Row */}
                <div className="fk-poster-card-pricing-row">
                  <div className="fk-poster-card-prices">
                    <span className="fk-poster-card-price">₹{product.price}</span>
                    <span className="fk-poster-card-mrp">₹{product.mrp}</span>
                  </div>
                  <span className="fk-poster-card-discount">{product.discount}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Festive Dispatch Strip */}
        <div className="fk-diwali-poster-footer">
          <span>Pre-Diwali Express Dispatch Active</span>
          <span className="fk-diwali-poster-dot">•</span>
          <span>100% Spotless Home Guarantee</span>
        </div>
      </div>
    </section>
  );
};
