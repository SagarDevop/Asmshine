import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, MapPin, ChevronDown, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../search/SearchOverlay';
import { AddressSelectModal } from '../ui/AddressSelectModal';

export const DesktopNav = ({ onSearch, onSwitchTab }) => {
  const { cartCount, wishlist, showToast } = useCartWishlist();
  const { user, selectedAddress } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const displayLocation = selectedAddress
    ? `${selectedAddress.city} - ${selectedAddress.pincode}`
    : 'Select Location';

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
                ASM <span style={{ color: '#2874F0' }}>SHINE</span>
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: '700', letterSpacing: '1.5px', color: '#2874F0', marginTop: '-2px' }}>
                HYGIENE &amp; CLEANING
              </span>
            </div>
          </div>

          <button
            className="delivery-location-btn"
            style={{ marginLeft: '16px' }}
            onClick={() => setIsAddressModalOpen(true)}
            title="Click to select or change delivery address"
          >
            <MapPin size={16} color="#2874F0" />
            <span>Deliver to <span className="location-name">{displayLocation}</span></span>
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
            <Sparkles size={16} color="#2874F0" />
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
            <ShoppingBag size={18} color="#2874F0" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="nav-badge-pill" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: '4px' }}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => navigate(user ? '/account' : '/login')}
            id="desktop-account-btn"
          >
            <User size={18} color="#2874F0" />
            <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
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

      {/* Dynamic Address Selection Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
};
