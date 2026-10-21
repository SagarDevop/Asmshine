import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Star,
  Plus,
  Sparkles,
  Layers,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { api, STATIC_CATEGORIES } from '../services/api';
import { SearchOverlay } from '../components/search/SearchOverlay';

const categoryIconMap = {
  all: Layers,
  toilet_care: ShieldCheck,
  bathroom_care: Bath,
  glass_care: SprayCan,
  floor_care: Brush,
  dishwash: Utensils,
  kitchen_care: CookingPot,
  laundry_care: Shirt,
  hand_hygiene: Droplets
};

export const CategoriesPage = ({
  onBack,
  onSelectProduct,
  initialCategory = 'all'
}) => {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { cartCount, addToCart } = useCartWishlist();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleOpenCart = () => {
    navigate('/cart');
  };

  const handleSelectProduct = (product) => {
    if (onSelectProduct) onSelectProduct(product);
    else navigate(`/product/${product.id}`);
  };

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data || []);
    });
  }, []);

  const allCategoriesList = [
    { id: 'all', name: 'All Products', desc: 'ASM Shine Home Hygiene & Cleaning Collection' },
    ...STATIC_CATEGORIES
  ];

  const currentCategoryObj = allCategoriesList.find((c) => c.id === selectedCat) || allCategoriesList[0];

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.category !== selectedCat) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="categories-page-view">
      {/* 1. Flipkart-style Top Bar */}
      <header className="page-top-header">
        <button
          type="button"
          className="page-back-btn"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="page-header-title-box">
          <span className="page-header-title">ASM Shine Cleaning Range</span>
          <span className="page-header-subtitle">Spotless Hygiene &amp; Care</span>
        </div>
        <div className="pdp-cart-icon-wrap" onClick={handleOpenCart}>
          <button type="button" className="page-action-btn" aria-label="Cart">
            <ShoppingBag size={21} />
          </button>
          {cartCount > 0 && <span className="pdp-cart-badge">{cartCount}</span>}
        </div>
      </header>

      {/* 2. Search Input Strip */}
      <div className="cat-search-strip">
        <div
          className="cat-search-box"
          onClick={() => setIsSearchOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsSearchOpen(true);
          }}
        >
          <Search size={18} className="cat-search-icon" />
          <input
            type="search"
            placeholder="Search toilet, bathroom, glass Colin, floor cleaner..."
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchOpen(true);
            }}
            readOnly
            className="cat-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="cat-search-clear"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Flipkart Split Layout: Vertical Left Tabs + Right Products */}
      <div className="cat-split-layout">
        {/* Left Vertical Category Nav */}
        <aside className="cat-sidebar no-scrollbar">
          {allCategoriesList.map((cat) => {
            const IconComp = categoryIconMap[cat.id] || ShoppingBag;
            const isActive = selectedCat === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                className={`cat-side-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                <div className={`cat-side-icon-box ${isActive ? 'active' : ''}`}>
                  <IconComp size={20} />
                </div>
                <span className="cat-side-label">{cat.name}</span>
                {isActive && <div className="cat-side-indicator" />}
              </button>
            );
          })}
        </aside>

        {/* Right Product Grid & Details Pane */}
        <main className="cat-content-pane no-scrollbar">
          {/* Active Category Header Banner */}
          <div className="cat-banner-card">
            <div className="cat-banner-tag">AUTHENTIC ASM SHINE HYGIENE</div>
            <h2 className="cat-banner-title">{currentCategoryObj.name}</h2>
            <p className="cat-banner-sub">
              {filteredProducts.length} varieties available in collection
            </p>
          </div>

          {/* Product Items List */}
          {filteredProducts.length === 0 ? (
            <div className="cat-empty-state">
              <Sparkles size={32} color="#0284C7" />
              <p>No cleaning products found matching your search</p>
              <button
                type="button"
                className="cat-reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCat('all');
                }}
              >
                View All 3 Rituals
              </button>
            </div>
          ) : (
            <div className="cat-products-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="cat-product-card"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="cat-prod-img-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cat-prod-img"
                    />
                    {product.badge && (
                      <span className="cat-prod-badge">{product.badge}</span>
                    )}
                  </div>

                  <div className="cat-prod-details">
                    <h3 className="cat-prod-name">{product.name}</h3>

                    {/* Rating Pill */}
                    <div className="cat-prod-rating-pill">
                      <span>{product.rating || '4.9'}</span>
                      <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                      {product.reviewCount && (
                        <span className="cat-prod-reviews-count">({product.reviewCount})</span>
                      )}
                    </div>

                    {/* Price Row */}
                    <div className="cat-prod-price-row">
                      <span className="cat-prod-price">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="cat-prod-mrp">₹{product.originalPrice}</span>
                      )}
                      {product.discountPercent && (
                        <span className="cat-prod-disc">{product.discountPercent}% off</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Flipkart-Style Full White Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />
    </div>
  );
};
