import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductCard = ({ product, showRating = true, sizePosition = 'below', onSelectProduct }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = React.useState(false);

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const isOutOfStock =
    product.inStock === false ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0) ||
    product.status === 'archived' ||
    product.status === 'inactive';

  return (
    <article
      className={`product-card clickable ${isOutOfStock ? 'out-of-stock' : ''}`}
      id={`product-${product.id}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Product Image Area with overlays */}
      <div className="product-media-container img-container-placeholder" style={{ position: 'relative' }}>
        {isOutOfStock && (
          <span className="product-stock-overlay-badge">
            Out of Stock
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`product-img img-fade ${imgLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />

        {/* Rating Badge (bottom-left overlay on image) */}
        {showRating && product.rating && (
          <div className="rating-badge">
            <span>{product.rating}</span>
            <Star size={11} className="star-icon" />
            {product.reviewCount && (
              <span className="reviews-count">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Product Details & Pricing */}
      <div className="product-details">
        <h3 className="product-name" title={product.name}>
          {product.shortName || product.name}
        </h3>

        <div className="price-row">
          <span className="price-current">₹{product.price}</span>
          {product.originalPrice && (
            <span className="price-original">₹{product.originalPrice}</span>
          )}
          {product.discountPercent && (
            <span className="price-discount">{product.discountPercent}% off</span>
          )}
        </div>
      </div>
    </article>
  );
};
