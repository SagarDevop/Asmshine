import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

/**
 * ProductGridSkeleton:
 * Renders an array of ProductCardSkeletons within the standard .product-grid layout.
 */
export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`prod-skel-${index}`} />
      ))}
    </div>
  );
};
