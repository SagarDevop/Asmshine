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
        { productId: 'bag_1', quantity: 1 },
        { productId: 'bag_21', quantity: 1 }
      ],
      'The Urban Commuter Duo Set (Backpack + Sling) added to cart! Flat ₹1,500 saved.'
    );
  };

  return (
    <section className="fk-minimal-promo-section" aria-label="Special Offers and Guarantees">
      {/* 1. Full-Width Luxury Urban Duo Box Banner */}
      <div className="fk-trio-feature-banner" onClick={handleAddTrioCombo}>
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
          alt="The Urban Commuter Duo Set"
          className="fk-trio-bg-img"
        />
        <div className="fk-trio-gradient-overlay" />

        <div className="fk-trio-content-overlay">
          <div className="fk-trio-tag-row">
            <span className="fk-trio-deal-tag">
              <Sparkles size={11} /> LIMITED BUNDLE DEAL
            </span>
            <span className="fk-trio-save-badge">SAVE FLAT ₹1,500</span>
          </div>

          <h3 className="fk-trio-title">The Urban Commuter Duo Set</h3>
          <p className="fk-trio-subtitle">Apex Tech Backpack 28L + Matrix Modular Crossbody Sling 6L</p>

          <div className="fk-trio-cta-row">
            <div className="fk-trio-pricing">
              <span className="fk-trio-price">₹2,999</span>
              <span className="fk-trio-mrp">₹6,798</span>
              <span className="fk-trio-off">55% OFF</span>
            </div>

            <button
              type="button"
              className="fk-trio-add-btn"
              onClick={handleAddTrioCombo}
            >
              <ShoppingBag size={14} />
              <span>ADD DUO TO CART</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spacious, Clean 4-Item Trust & Assurance Strip */}
      <div className="fk-minimal-trust-strip">
        <div className="fk-min-trust-item">
          <ShieldCheck size={18} color="#1C8E8F" />
          <span>Water-Resistant Weave</span>
        </div>
        <div className="fk-min-trust-item">
          <Truck size={18} color="#1C8E8F" />
          <span>Free Express Air Delivery</span>
        </div>
        <div className="fk-min-trust-item">
          <RotateCcw size={18} color="#1C8E8F" />
          <span>1-Year Quality Warranty</span>
        </div>
        <div className="fk-min-trust-item">
          <Zap size={18} color="#1C8E8F" />
          <span>Instant 5% Prepaid UPI Off</span>
        </div>
      </div>
    </section>
  );
};
