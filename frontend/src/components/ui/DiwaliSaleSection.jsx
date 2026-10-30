import React from 'react';
import { ChevronRight } from 'lucide-react';

export const DiwaliSaleSection = ({ banners, products = [], onSelectProduct, onNavigateAll }) => {
  // 1. Prioritize dynamic festive products provided by backend banners API
  let festiveCards = [];

  if (Array.isArray(banners?.festiveProducts) && banners.festiveProducts.length > 0) {
    festiveCards = banners.festiveProducts;
  } else if (Array.isArray(products) && products.length > 0) {
    // 2. Or dynamically derive from live active catalog in MongoDB
    const activeProducts = products.filter(
      (p) => p.status !== 'archived' && p.status !== 'inactive'
    );

    // Look for products tagged by admin as festive deal
    let curated = activeProducts.filter((p) => p.isFestiveDeal === true);
    if (curated.length === 0) {
      curated = activeProducts.slice(0, 2);
    } else if (curated.length === 1 && activeProducts.length > 1) {
      const remaining = activeProducts.find((p) => p.id !== curated[0].id);
      if (remaining) curated.push(remaining);
    }

    festiveCards = curated.slice(0, 2).map((p, idx) => ({
      id: p.id || p._id,
      badge: p.festiveBadge || (idx === 0 ? 'FESTIVE SPECIAL' : 'VALUE PACK'),
      title: p.shortName || p.name,
      size: p.size || 'Standard Pack',
      price: p.price,
      mrp: p.originalPrice || Math.round(p.price * 1.3),
      discount: p.discountPercent ? `${p.discountPercent}% off` : 'Special Offer',
      image: p.image
    }));
  }

  // If no active products are available, safely hide section
  if (festiveCards.length === 0) return null;

  const handleCardClick = (id) => {
    if (onSelectProduct) {
      onSelectProduct({ id });
    }
  };

  return (
    <section className="fk-diwali-poster-block" aria-label="Diwali Mega Sale Poster">
      {/* Background Poster Artwork */}
      <img
        src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938233/asm-shine/banners/diwali_poster_bg.jpg"
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

        {/* 2 Embedded Product Cards Inside the Poster (100% Dynamic & Admin Controlled) */}
        <div className="fk-diwali-poster-cards-row">
          {festiveCards.map((product) => (
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
                  className="fk-poster-card-img"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
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
          <span className="fk-diwali-bullet">•</span>
          <span>100% Spotless Home Guarantee</span>
        </div>
      </div>
    </section>
  );
};
