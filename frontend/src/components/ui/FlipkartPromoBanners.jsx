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
        { productId: 'asm_toilet_1', quantity: 1 },
        { productId: 'asm_bath_1', quantity: 1 },
        { productId: 'asm_glass_1', quantity: 1 }
      ],
      'The ASM Sparkle Trio (Toilet + Bathroom + Glass Cleaner) added to cart! Flat ₹275 saved.'
    );
  };

  return (
    <section className="fk-minimal-promo-section" aria-label="Special Offers and Guarantees">
      {/* 1. Full-Width Luxury Cleaning Trio Box Banner */}
      <div className="fk-trio-feature-banner" onClick={handleAddTrioCombo}>
        <img
          src="/images/banners/hero_banner_photo.png"
          alt="The ASM Sparkle Trio Set"
          className="fk-trio-bg-img"
        />
        <div className="fk-trio-gradient-overlay" />

        <div className="fk-trio-content-overlay">
          <div className="fk-trio-tag-row">
            <span className="fk-trio-deal-tag">
              <Sparkles size={11} /> LIMITED HYGIENE BUNDLE
            </span>
            <span className="fk-trio-save-badge">SAVE FLAT ₹275</span>
          </div>

          <h3 className="fk-trio-title">The ASM Complete Sparkle Trio</h3>
          <p className="fk-trio-subtitle">Toilet Cleaner 1L + Bathroom Descaler 1L + Colin Glass Spray 500ml</p>

          <div className="fk-trio-cta-row">
            <div className="fk-trio-pricing">
              <span className="fk-trio-price">₹399</span>
              <span className="fk-trio-mrp">₹674</span>
              <span className="fk-trio-off">41% OFF</span>
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
          <ShieldCheck size={18} color="#0284C7" />
          <span>99.9% Certified Germ Kill</span>
        </div>
        <div className="fk-min-trust-item">
          <Truck size={18} color="#0284C7" />
          <span>Free Express Doorstep Delivery</span>
        </div>
        <div className="fk-min-trust-item">
          <Sparkles size={18} color="#0284C7" />
          <span>100% Mirror-Shine Guarantee</span>
        </div>
        <div className="fk-min-trust-item">
          <Zap size={18} color="#0284C7" />
          <span>Instant 5% Prepaid UPI Off</span>
        </div>
      </div>
    </section>
  );
};
