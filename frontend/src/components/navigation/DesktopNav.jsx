import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { SearchOverlay } from '../search/SearchOverlay';

export const DesktopNav = ({ onSearch, onSwitchTab }) => {
  const { cartCount, wishlist, showToast } = useCartWishlist();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNav = (tab) => {
    if (onSwitchTab) {
      onSwitchTab(tab);
      return;
    }
    if (tab === 'home') navigate('/');
    else if (tab === 'cart') navigate('/cart');
    else if (tab === 'about') navigate('/about');
    else if (tab === 'categories') navigate('/categories');
  };

  return (
    <div className="desktop-header-wrapper">
      <div className="desktop-nav-container">
        {/* Brand Logo & Location */}
        <div className="desktop-brand-group">
          <div
            className="desktop-brand-logo"
            onClick={() => handleNav('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <img 
              src="/favicon.svg" 
              alt="ASM SHINE Logo" 
              style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '1.2px', color: '#1E293B', fontFamily: 'var(--font-base)' }}>
                ASM <span style={{ color: '#059669' }}>SHINE</span>
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: '700', letterSpacing: '1.5px', color: '#059669', marginTop: '-2px' }}>
                HYGIENE &amp; CLEANING
              </span>
            </div>
          </div>

          <button
            className="delivery-location-btn"
            style={{ marginLeft: '16px' }}
            onClick={() => showToast('Delivery location: Delhi NCR & Pan India (Free Express Shipping)')}
          >
            <MapPin size={16} color="#059669" />
            <span>Deliver to <span className="location-name">New Delhi 110001</span></span>
            <ChevronDown size={14} color="#64748B" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="desktop-search-bar">
          <div
            className="search-input-wrapper"
            onClick={() => setIsSearchOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsSearchOpen(true);
            }}
          >
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search Toilet Cleaner, Colin Glass, Floor cleaner, Dishwash..."
              onFocus={() => setIsSearchOpen(true)}
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              readOnly
            />
          </div>
        </div>

        {/* Desktop Quick Nav Actions */}
        <div className="desktop-actions-group">
          <button
            className="desktop-nav-btn"
            onClick={() => handleNav('categories')}
          >
            <Sparkles size={16} color="#059669" />
            <span>Catalog</span>
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => showToast(`Wishlist contains ${wishlist.size} saved items`)}
          >
            <Heart size={18} color={wishlist.size > 0 ? '#DC2626' : '#1E293B'} />
            <span>Wishlist ({wishlist.size})</span>
          </button>

          <button
            className="desktop-nav-btn"
            style={{ position: 'relative' }}
            onClick={() => handleNav('cart')}
          >
            <ShoppingBag size={18} color="#059669" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="nav-badge-pill" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: '4px' }}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => handleNav('about')}
          >
            <span>Our Philosophy</span>
          </button>
        </div>
      </div>

      {/* Flipkart-Style Full White Search Overlay on Desktop */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
