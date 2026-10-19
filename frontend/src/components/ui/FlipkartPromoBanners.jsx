import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useCartWishlist } from '../../context/CartWishlistContext';

export const FlipkartPromoBanners = ({ onSelectProduct }) => {
  const { addComboToCart } = useCartWishlist();

  const handleAddTrioCombo = (e) => {
    e.stopPropagation();
    addComboToCart(
      [
        { productId: 'prod_1', quantity: 1 },
        { productId: 'prod_2', quantity: 1 },
        { productId: 'prod_3', quantity: 1 }
      ],
      'The Sacred Trio Box added to cart! Flat ₹2,998 saved.'
    );
  };

  return (
    <section className="fk-minimal-promo-section" aria-label="Special Offers and Guarantees">
      {/* 1. Full-Width Luxury Sacred Trio Box Banner */}
      <div className="fk-trio-feature-banner" onClick={handleAddTrioCombo}>
        <img
          src="/images/banners/zenvoro_banner_bundle.jpg"
          alt="The Sacred Trio Ritual Box"
          className="fk-trio-bg-img"
        />
        <div className="fk-trio-gradient-overlay" />

        <div className="fk-trio-content-overlay">
          <div className="fk-trio-tag-row">
            <span className="fk-trio-deal-tag">
              <Sparkles size={11} /> LIMITED LAUNCH DEAL
            </span>
            <span className="fk-trio-save-badge">SAVE FLAT ₹2,998</span>
          </div>

          <h3 className="fk-trio-title">The Sacred Trio Ritual Box</h3>
          <p className="fk-trio-subtitle">All 3 Flagship Formulations + Complimentary Gold Dosing Spoon</p>

          <div className="fk-trio-cta-row">
            <div className="fk-trio-pricing">
              <span className="fk-trio-price">₹3,999</span>
              <span className="fk-trio-mrp">₹6,997</span>
              <span className="fk-trio-off">43% OFF</span>
            </div>

            <button
              type="button"
              className="fk-trio-add-btn"
              onClick={handleAddTrioCombo}
            >
              <ShoppingBag size={14} />
              <span>ADD TRIO TO CART</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spacious, Clean 4-Item Trust & Assurance Strip */}
      <div className="fk-minimal-trust-strip">
        <div className="fk-min-trust-item">
          <ShieldCheck size={18} color="#85532F" />
          <span>100% Himalayan Certified</span>
        </div>
        <div className="fk-min-trust-item">
          <Truck size={18} color="#85532F" />
          <span>Free Express Air Delivery</span>
        </div>
        <div className="fk-min-trust-item">
          <RotateCcw size={18} color="#85532F" />
          <span>7-Day Quality Assured</span>
        </div>
        <div className="fk-min-trust-item">
          <Zap size={18} color="#85532F" />
          <span>Instant 5% Prepaid UPI Off</span>
        </div>
      </div>
    </section>
  );
};
