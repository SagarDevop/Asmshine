import React from 'react';

/**
 * CatProductCardSkeleton:
 * High-fidelity placeholder for .cat-product-card in CategoriesPage.
 * Matches 96x96 image thumbnail + name + rating + price row.
 */
export const CatProductCardSkeleton = () => {
  return (
    <div className="cat-product-card skeleton-card" aria-hidden="true">
      {/* 96x96 Image Box */}
      <div className="cat-prod-img-wrap skeleton-wrap">
        <div className="skeleton-cat-thumb skeleton-shimmer" />
      </div>

      {/* Product Details */}
      <div className="skeleton-cat-details">
        {/* Title Lines */}
        <div className="skeleton-title-line skeleton-shimmer" style={{ width: '82%', height: '14px' }} />
        <div className="skeleton-title-line skeleton-shimmer" style={{ width: '54%', height: '12px' }} />

        {/* Rating Pill Placeholder */}
        <div className="skeleton-box skeleton-shimmer" style={{ width: '46px', height: '18px', borderRadius: '4px', margin: '2px 0' }} />

        {/* Price Row */}
        <div className="skeleton-price-row" style={{ marginTop: '2px', gap: '6px' }}>
          <div className="skeleton-box skeleton-shimmer" style={{ width: '50px', height: '16px', borderRadius: '4px' }} />
          <div className="skeleton-box skeleton-shimmer" style={{ width: '38px', height: '13px', borderRadius: '4px' }} />
          <div className="skeleton-box skeleton-shimmer" style={{ width: '42px', height: '13px', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
};
