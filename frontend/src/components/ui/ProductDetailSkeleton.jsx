import React from 'react';
import { ArrowLeft, Share2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';

/**
 * ProductDetailSkeleton:
 * Full-page structural skeleton for ProductDetailPage.
 * Eliminates layout shifts and preserves user interactivity (back button, brand logo, cart navigation).
 */
export const ProductDetailSkeleton = ({ onBack }) => {
  const navigate = useNavigate();
  const { cartCount } = useCartWishlist();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="pdp-page" aria-busy="true" aria-label="Loading product details">
      {/* 1. Top Navigation Bar (Fully functional even while data is resolving) */}
      <header className="pdp-top-header">
        <button
          type="button"
          className="pdp-nav-btn"
          onClick={handleBack}
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="pdp-header-brand" onClick={() => navigate('/')}>
          <img src="/favicon.svg" alt="ASM SHINE" className="pdp-logo-mini" style={{ borderRadius: '8px' }} />
          <span className="pdp-brand-text">ASM SHINE</span>
        </div>

        <div className="pdp-header-actions">
          <button
            type="button"
            className="pdp-nav-btn"
            aria-label="Share"
            disabled
            style={{ opacity: 0.6 }}
          >
            <Share2 size={20} />
          </button>
          <div
            className="pdp-cart-icon-wrap"
            onClick={() => navigate('/cart')}
            style={{ cursor: 'pointer' }}
          >
            <button type="button" className="pdp-nav-btn" aria-label="Cart">
              <ShoppingBag size={21} />
            </button>
            {cartCount > 0 && <span className="pdp-cart-badge">{cartCount}</span>}
          </div>
        </div>
      </header>

      {/* Main PDP Container */}
      <div className="pdp-content-container">
        {/* 2. Hero Media Showcase Skeleton */}
        <div className="pdp-media-card">
          <div className="pdp-image-viewport pdp-skeleton-viewport skeleton-shimmer">
            {/* Top-Right Wishlist placeholder */}
            <div
              className="skeleton-circle skeleton-shimmer"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '38px',
                height: '38px',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            />
            {/* Bottom-Left Assured Tag placeholder */}
            <div
              className="skeleton-box skeleton-shimmer"
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                width: '130px',
                height: '24px',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        {/* 3. Title, Rating & Pricing Section Skeleton */}
        <section className="pdp-section pdp-info-card">
          <div className="pdp-skeleton-tag skeleton-shimmer" />
          <div className="pdp-skeleton-title-1 skeleton-shimmer" />
          <div className="pdp-skeleton-title-2 skeleton-shimmer" />

          {/* Rating Pill Row */}
          <div className="pdp-skeleton-rating-row">
            <div className="pdp-skeleton-pill skeleton-shimmer" />
            <div className="pdp-skeleton-reviews-text skeleton-shimmer" />
          </div>

          {/* Price Breakdown Skeleton */}
          <div className="pdp-skeleton-price-block">
            <div className="skeleton-box skeleton-shimmer" style={{ width: '80px', height: '14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="pdp-skeleton-price-main skeleton-shimmer" />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '50px', height: '18px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '60px', height: '18px' }} />
            </div>
            <div className="pdp-skeleton-subnote skeleton-shimmer" />
          </div>
        </section>

        {/* 4. Marketplace Links Skeleton */}
        <section className="pdp-section pdp-marketplaces-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="skeleton-box skeleton-shimmer" style={{ width: '150px', height: '18px' }} />
            <div className="skeleton-box skeleton-shimmer" style={{ width: '110px', height: '14px' }} />
          </div>
          <div className="pdp-skeleton-mp-grid">
            <div className="pdp-skeleton-mp-btn skeleton-shimmer" />
            <div className="pdp-skeleton-mp-btn skeleton-shimmer" />
            <div className="pdp-skeleton-mp-btn skeleton-shimmer" />
          </div>
        </section>

        {/* 5. Available Offers Skeleton */}
        <section className="pdp-section pdp-offers-card">
          <div className="skeleton-box skeleton-shimmer" style={{ width: '160px', height: '16px', marginBottom: '10px' }} />
          <div className="pdp-skeleton-offer-item skeleton-shimmer" />
          <div className="pdp-skeleton-offer-item skeleton-shimmer" style={{ height: '40px' }} />
        </section>

        {/* 6. Variant Chips Skeleton */}
        <section className="pdp-section pdp-variants-card">
          <div className="skeleton-box skeleton-shimmer" style={{ width: '170px', height: '16px', marginBottom: '8px' }} />
          <div className="pdp-skeleton-chips-grid">
            <div className="pdp-skeleton-chip skeleton-shimmer" />
            <div className="pdp-skeleton-chip skeleton-shimmer" />
            <div className="pdp-skeleton-chip skeleton-shimmer" />
          </div>
        </section>

        {/* 7. Delivery & Assurance Skeleton */}
        <section className="pdp-section pdp-delivery-card">
          <div className="pdp-skeleton-delivery-row">
            <div className="skeleton-box skeleton-shimmer" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
            <div className="pdp-skeleton-pin skeleton-shimmer" />
          </div>
          <div className="pdp-skeleton-delivery-row">
            <div className="skeleton-box skeleton-shimmer" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
            <div className="skeleton-box skeleton-shimmer" style={{ width: '260px', height: '16px' }} />
          </div>
          <div className="pdp-skeleton-badges">
            <div className="pdp-skeleton-badge-pill skeleton-shimmer" />
            <div className="pdp-skeleton-badge-pill skeleton-shimmer" />
            <div className="pdp-skeleton-badge-pill skeleton-shimmer" />
          </div>
        </section>
      </div>

      {/* 8. Bottom Sticky Action Bar Skeleton */}
      <div className="pdp-skeleton-bottom-bar">
        <div className="pdp-skeleton-btn skeleton-shimmer" style={{ border: '1px solid #CBD5E1' }} />
        <div className="pdp-skeleton-btn skeleton-shimmer" style={{ background: '#E2E8F0' }} />
      </div>
    </div>
  );
};
