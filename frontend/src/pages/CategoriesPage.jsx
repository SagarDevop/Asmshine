import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Star,
  Plus,
  Sparkles,
  Layers,
  Backpack,
  Briefcase,
  Luggage,
  Compass,
  Package,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { api, STATIC_CATEGORIES } from '../services/api';
import { SearchOverlay } from '../components/search/SearchOverlay';

const categoryIconMap = {
  all: Layers,
  backpacks: Backpack,
  laptop_bags: Briefcase,
  travel_duffels: Luggage,
  totes: ShoppingBag,
  slings_crossbody: Compass,
  wallets_organizers: Package
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
    { id: 'all', name: 'All Bags', desc: 'Anchay Complete Carrywear & Bag Collection' },
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
          <span className="page-header-title">Anchay Bag Collection</span>
          <span className="page-header-subtitle">28 Handcrafted Varieties</span>
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
            placeholder="Search backpacks, briefcases, duffels, totes..."
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
            <div className="cat-banner-tag">AUTHENTIC ANCHAY CARRYWEAR</div>
            <h2 className="cat-banner-title">{currentCategoryObj.name}</h2>
            <p className="cat-banner-sub">
              {filteredProducts.length} varieties available in collection
            </p>
          </div>

          {/* Product Items List */}
          {filteredProducts.length === 0 ? (
            <div className="cat-empty-state">
              <Sparkles size={32} color="#1C8E8F" />
              <p>No bags found matching your search</p>
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
                    <div className="cat-prod-brand-row">
                      <span className="cat-prod-brand">ANCHAY BAGS</span>
                      {product.size && (
                        <span className="cat-prod-size-badge">{product.size}</span>
                      )}
                    </div>
                    <h3 className="cat-prod-name">{product.name}</h3>

                    {/* Rating Pill */}
                    <div className="cat-prod-rating-pill">
                      <span>{product.rating || '4.9'}</span>
                      <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
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

                    <button
                      type="button"
                      className="cat-prod-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id, 1);
                      }}
                    >
                      <Plus size={14} />
                      <span>ADD</span>
                    </button>
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
