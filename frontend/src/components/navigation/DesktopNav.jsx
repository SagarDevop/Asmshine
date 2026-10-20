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
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <img 
              src="/images/logo.png" 
              alt="ANCHAY Logo" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #1C8E8F' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '2px', color: '#0F2327', fontFamily: 'serif' }}>
                ANCHAY
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: '600', letterSpacing: '1.5px', color: '#1C8E8F', marginTop: '-3px' }}>
                PREMIUM BAGS & CARRYWEAR
              </span>
            </div>
          </div>

          <button
            className="delivery-location-btn"
            style={{ marginLeft: '16px' }}
            onClick={() => showToast('Delivery location: Delhi NCR & Pan India (Free Express Shipping)')}
          >
            <MapPin size={16} color="#1C8E8F" />
            <span>Deliver to <span className="location-name">New Delhi 110001</span></span>
            <ChevronDown size={14} color="#3D5A60" />
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
              placeholder="Search bags, totes, backpacks, duffels, slings..."
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
            <Sparkles size={16} color="#1C8E8F" />
            <span>Catalog</span>
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => showToast(`Wishlist contains ${wishlist.size} saved items`)}
          >
            <Heart size={18} color={wishlist.size > 0 ? '#DC2626' : '#0F2327'} />
            <span>Wishlist ({wishlist.size})</span>
          </button>

          <button
            className="desktop-nav-btn"
            style={{ position: 'relative' }}
            onClick={() => handleNav('cart')}
          >
            <ShoppingBag size={18} color="#1C8E8F" />
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
