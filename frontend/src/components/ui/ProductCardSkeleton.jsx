import React from 'react';

/**
 * ProductCardSkeleton:
 * High-fidelity placeholder for ProductCard while catalog data is loading.
 * Exact 1:1 structural copy with .product-card and .product-media-container.
 */
export const ProductCardSkeleton = () => {
  return (
    <article
      className="product-card skeleton-card"
      aria-hidden="true"
      tabIndex={-1}
    >
      {/* Product Media Area (106% aspect ratio matching .product-media-container) */}
      <div className="product-media-container">
        <div className="skeleton-media-box skeleton-shimmer" />
        {/* Rating Pill Placeholder */}
        <div className="skeleton-rating-badge skeleton-shimmer" />
      </div>

      {/* Details Area */}
      <div className="skeleton-details-col">
        {/* Title line 1 & 2 */}
        <div className="skeleton-title-line skeleton-shimmer" style={{ width: '85%' }} />
        <div className="skeleton-title-line skeleton-shimmer" style={{ width: '58%', height: '12px' }} />

        {/* Pricing Row */}
        <div className="skeleton-price-row">
          <div className="skeleton-price-pill skeleton-shimmer" />
          <div className="skeleton-mrp-pill skeleton-shimmer" />
          <div className="skeleton-disc-pill skeleton-shimmer" />
        </div>
      </div>
    </article>
  );
};
