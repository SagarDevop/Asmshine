import React from 'react';
import { ChevronRight } from 'lucide-react';


export const FlipkartPromoBanners = ({ onSelectProduct, onNavigateCategories }) => {
  // Exactly 2 curated essentials for the Super Saver combo poster
  const comboProducts = [
    {
      id: 'asm_bath_1',
      badge: 'DESCALER ₹89',
      title: 'ASM Heavy-Duty Bathroom Cleaner',
      size: '500 ml Bottle',
      price: 89,
      mrp: 179,
      discount: '50% off',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg'
    },
    {
      id: 'asm_glass_1',
      badge: 'SPARKLE ₹79',
      title: 'ASM Crystal Clear Glass Cleaner',
      size: '500 ml Trigger Spray',
      price: 79,
      mrp: 165,
      discount: '52% off',
      image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg'
    }
  ];

  const handleCardClick = (id) => {
    if (onSelectProduct) {
      onSelectProduct({ id });
    }
  };

  return (
    <section className="fk-minimal-promo-section" aria-label="Special Offers and Guarantees">
      {/* Authentic Commercial Poster with 2 Embedded Product Cards */}
      <div className="fk-combo-poster-block" aria-label="Super Saver Cleaning Combo Poster">
        {/* Background Poster Artwork */}
        <img
          src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938231/asm-shine/banners/combo_poster_bg.jpg"
          alt="Spotless Home Combo Specials"
          className="fk-combo-poster-backdrop"
          loading="lazy"
        />
        <div className="fk-combo-poster-overlay" />

        {/* Content Placed Directly Inside the Poster Canvas */}
        <div className="fk-combo-poster-content">
          {/* Poster Header */}
          <div className="fk-combo-poster-header">
            <div className="fk-combo-poster-tag-row">
              <span className="fk-combo-poster-tag">SUPER SAVER SPECIALS</span>
              {onNavigateCategories && (
                <button
                  type="button"
                  className="fk-combo-poster-more-btn"
                  onClick={onNavigateCategories}
                  aria-label="View all cleaning combos"
                >
                  <span>View All</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
            <h2 className="fk-combo-poster-title">Spotless Home Specials</h2>
            <p className="fk-combo-poster-sub">Sparkling Clean Tiles, Glass &amp; Surface Essentials</p>
          </div>

          {/* 2 Embedded Product Cards Inside the Poster */}
          <div className="fk-combo-poster-cards-row">
            {comboProducts.map((product) => (
              <article
                key={product.id}
                className="fk-poster-product-card fk-combo-card"
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
                <span className="fk-poster-card-badge fk-combo-badge">{product.badge}</span>

                {/* Product Thumbnail */}
                <div className="fk-poster-card-img-wrap">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="fk-poster-card-img"
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

          {/* Bottom Dispatch / Quality Guarantee Strip Inside Poster */}
          <div className="fk-combo-poster-footer">
            <span>99.9% Limescale &amp; Germ Removal</span>
            <span className="fk-combo-poster-dot">•</span>
            <span>100% Streak-Free Shine</span>
          </div>
        </div>
      </div>

      {/* 2. Minimal 4-Item Trust & Assurance Grid with 3D Visual Badges */}
      <div className="fk-trust-cards-grid" aria-label="Brand Guarantees">
        <div className="fk-trust-card">
          <div className="fk-trust-icon-box">
            <img
              src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938259/asm-shine/trust/trust_germ_kill.jpg"
              alt="99.9% Germ Kill Protection"
              className="fk-trust-img"
              loading="lazy"
            />
          </div>
          <div className="fk-trust-info">
            <h4 className="fk-trust-title">99.9% Germ Kill</h4>
            <p className="fk-trust-desc">Lab Certified Safe</p>
          </div>
        </div>

        <div className="fk-trust-card">
          <div className="fk-trust-icon-box">
            <img
              src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938258/asm-shine/trust/trust_express_delivery.jpg"
              alt="Express Doorstep Delivery"
              className="fk-trust-img"
              loading="lazy"
            />
          </div>
          <div className="fk-trust-info">
            <h4 className="fk-trust-title">Express Delivery</h4>
            <p className="fk-trust-desc">Doorstep Dispatch</p>
          </div>
        </div>

        <div className="fk-trust-card">
          <div className="fk-trust-icon-box">
            <img
              src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938261/asm-shine/trust/trust_mirror_shine.jpg"
              alt="100% Mirror-Shine Guarantee"
              className="fk-trust-img"
              loading="lazy"
            />
          </div>
          <div className="fk-trust-info">
            <h4 className="fk-trust-title">Mirror-Shine</h4>
            <p className="fk-trust-desc">100% Quality Seal</p>
          </div>
        </div>

        <div className="fk-trust-card">
          <div className="fk-trust-icon-box">
            <img
              src="https://res.cloudinary.com/dheyj35ys/image/upload/v1792938262/asm-shine/trust/trust_upi_discount.jpg"
              alt="Instant 5% Prepaid UPI Off"
              className="fk-trust-img"
              loading="lazy"
            />
          </div>
          <div className="fk-trust-info">
            <h4 className="fk-trust-title">Instant 5% Off</h4>
            <p className="fk-trust-desc">Prepaid UPI Savings</p>
          </div>
        </div>
      </div>
    </section>
  );
};


