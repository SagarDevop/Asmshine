import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  ChevronRight,
  Star,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const TRENDING_SEARCHES = [
  { text: 'Power Toilet Cleaner (Harpic Power)', query: 'Toilet' },
  { text: 'Colin Glass & Mirror Spray', query: 'Glass' },
  { text: 'Bathroom & Tiles Hard Water Descaler', query: 'Bathroom' },
  { text: 'Citrus Fresh Floor Disinfectant', query: 'Floor' },
  { text: 'Turbo Lemon Dishwash Gel', query: 'Dishwash' },
  { text: 'Kitchen Chimney Degreaser', query: 'Degreaser' }
];

const RITUAL_CARDS = [
  {
    id: 'asm_toilet_1',
    category: 'toilet_care',
    name: 'Power Toilet Cleaner 1L',
    subtitle: '10x Limescale Removal',
    discount: '27% OFF',
    icon: ShieldCheck,
    color: '#4F46E5'
  },
  {
    id: 'asm_glass_1',
    category: 'glass_care',
    name: 'Colin Glass Spray 500ml',
    subtitle: 'Streak-Free Mirror Shine',
    discount: '28% OFF',
    icon: SprayCan,
    color: '#0284C7'
  },
  {
    id: 'asm_bath_1',
    category: 'bathroom_care',
    name: 'Bathroom Tiles Descaler',
    subtitle: 'Removes Hard Water Stains',
    discount: '28% OFF',
    icon: Bath,
    color: '#0D9488'
  }
];

export const SearchOverlay = ({ isOpen, onClose, initialQuery = '' }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Load products on mount
  useEffect(() => {
    api.getProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    });
  }, []);

  // Update query if initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter products live as query changes
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setFilteredProducts([]);
      return;
    }

    const matches = products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(trimmed);
      const shortNameMatch = p.shortName?.toLowerCase().includes(trimmed);
      const descMatch = p.description?.toLowerCase().includes(trimmed);
      const catMatch = p.category?.toLowerCase().includes(trimmed);
      const badgeMatch = p.badge?.toLowerCase().includes(trimmed);
      const sizeMatch = p.size?.toLowerCase().includes(trimmed);
      const highlightMatch = p.highlights?.some((h) => h.toLowerCase().includes(trimmed));
      return nameMatch || shortNameMatch || descMatch || catMatch || badgeMatch || sizeMatch || highlightMatch;
    });

    setFilteredProducts(matches);
  }, [query, products]);

  if (!isOpen) return null;

  const handleSelectProduct = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSelectTrending = (trendingQuery) => {
    setQuery(trendingQuery);
    inputRef.current?.focus();
  };

  return (
    <div className="fk-search-overlay-root" role="dialog" aria-modal="true" aria-label="Search Formulations">
      {/* Top Fixed Search Bar */}
      <header className="fk-search-overlay-header">
        <button
          type="button"
          className="fk-search-back-btn"
          onClick={onClose}
          aria-label="Close search"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="fk-search-input-box">
          <Search size={17} className="fk-search-box-icon" />
          <input
            ref={inputRef}
            type="search"
            className="fk-search-live-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search toilet, Colin glass, floor cleaner, bathroom descaler..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              className="fk-search-clear-btn"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main White Page Results Area */}
      <div className="fk-search-overlay-body no-scrollbar">
        {/* CASE 1: Query is active and matches found */}
        {query.trim() && filteredProducts.length > 0 && (
          <div className="fk-search-results-section">
            <div className="fk-search-results-heading">
              <span>MATCHING CLEANING PRODUCTS ({filteredProducts.length})</span>
            </div>

            <div className="fk-search-results-list">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="fk-search-result-card"
                  onClick={() => handleSelectProduct(prod.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectProduct(prod.id);
                    }
                  }}
                >
                  <div className="fk-result-thumb-box img-container-placeholder">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="fk-result-thumb-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="fk-result-info">
                    <div className="fk-result-tag-row">
                      <span className="fk-result-category-pill">
                        {prod.category?.toUpperCase()?.replace('_', ' ') || 'HYGIENE'}
                      </span>
                      {prod.badge && (
                        <span className="fk-result-badge-pill">{prod.badge}</span>
                      )}
                    </div>

                    <h4 className="fk-result-title">{prod.name}</h4>

                    <div className="fk-result-price-row">
                      <span className="fk-result-price">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="fk-result-mrp">₹{prod.originalPrice}</span>
                      )}
                      {prod.discountPercent && (
                        <span className="fk-result-discount">
                          {prod.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="fk-result-meta-row">
                      <span className="fk-result-rating">
                        {prod.rating || 4.9} <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                      </span>
                      <span className="fk-result-certified">
                        <CheckCircle2 size={12} color="#15803D" /> Authentic ASM Shine
                      </span>
                    </div>
                  </div>

                  <div className="fk-result-action">
                    <ChevronRight size={18} className="fk-result-arrow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASE 2: Query is active but NO results found */}
        {query.trim() && filteredProducts.length === 0 && (
          <div className="fk-search-empty-state">
            <div className="fk-empty-search-icon">
              <Search size={32} color="#1C8E8F" />
            </div>
            <h3 className="fk-empty-search-title">No Products Found</h3>
            <p className="fk-empty-search-text">
              We couldn't find any cleaning formulation matching "<strong>{query}</strong>".
            </p>
            <div className="fk-empty-search-suggestions">
              <span className="fk-suggestions-label">Try searching for:</span>
              <div className="fk-trending-chips">
                {TRENDING_SEARCHES.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="fk-trending-chip"
                    onClick={() => handleSelectTrending(item.query)}
                  >
                    <Search size={12} />
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: Query is empty — show Trending Searches and Explore Rituals */}
        {!query.trim() && (
          <div className="fk-search-landing-content">
            {/* Trending Searches */}
            <section className="fk-trending-section">
              <div className="fk-section-title-row">
                <TrendingUp size={15} color="#1C8E8F" />
                <span className="fk-section-title-text">POPULAR SEARCHES</span>
              </div>
              <div className="fk-trending-chips">
                {TRENDING_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="fk-trending-chip"
                    onClick={() => handleSelectTrending(item.query)}
                  >
                    <Search size={12} className="fk-chip-icon" />
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Explore Popular Bag Styles */}
            <section className="fk-rituals-section">
              <div className="fk-section-title-row">
                <Sparkles size={15} color="#1C8E8F" />
                <span className="fk-section-title-text">POPULAR BAG STYLES</span>
              </div>
              <div className="fk-ritual-cards-grid">
                {RITUAL_CARDS.map((ritual) => {
                  const Icon = ritual.icon;
                  return (
                    <div
                      key={ritual.id}
                      className="fk-ritual-quick-card"
                      onClick={() => handleSelectProduct(ritual.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectProduct(ritual.id);
                        }
                      }}
                    >
                      <div
                        className="fk-ritual-icon-bubble"
                        style={{ backgroundColor: `${ritual.color}15`, color: ritual.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="fk-ritual-card-info">
                        <strong className="fk-ritual-card-title">{ritual.name}</strong>
                        <span className="fk-ritual-card-sub">{ritual.subtitle}</span>
                      </div>
                      <span className="fk-ritual-card-discount">{ritual.discount}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Trust Assurances */}
            <div className="fk-search-assurances">
              <div className="fk-assurance-item">
                <CheckCircle2 size={13} color="#15803D" />
                <span>100% Water-Resistant & Heavy-Duty YKK Zips</span>
              </div>
              <div className="fk-assurance-item">
                <CheckCircle2 size={13} color="#15803D" />
                <span>1-Year Craftsmanship Warranty</span>
              </div>
              <div className="fk-assurance-item">
                <CheckCircle2 size={13} color="#15803D" />
                <span>Free Express Delivery Across India</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchOverlay;
