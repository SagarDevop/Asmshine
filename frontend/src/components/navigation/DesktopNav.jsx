import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  MapPin,
  ChevronDown,
  Sparkles,
  User,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from '../search/SearchOverlay';
import { AddressSelectModal } from '../ui/AddressSelectModal';

const CATEGORY_ITEMS = [
  { id: 'all', label: 'All Formulations', icon: Layers },
  { id: 'toilet_care', label: 'Toilet Cleaner', icon: ShieldCheck },
  { id: 'bathroom_care', label: 'Bathroom & Tiles', icon: Bath },
  { id: 'glass_care', label: 'Glass & Colin', icon: SprayCan },
  { id: 'floor_care', label: 'Floor Cleaner', icon: Brush },
  { id: 'dishwash', label: 'Dishwash Gel', icon: Utensils },
  { id: 'kitchen_care', label: 'Kitchen & Chimney', icon: CookingPot },
  { id: 'laundry_care', label: 'Laundry Detergent', icon: Shirt },
  { id: 'hand_hygiene', label: 'Hand Hygiene', icon: Droplets }
];

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
      {/* 1. Main Top Header Bar */}
      <div className="desktop-nav-container">
        {/* Brand Logo & Location */}
        <div className="desktop-brand-group">
          <div
            className="desktop-brand-logo"
            onClick={() => handleNav('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <img 
              src="/favicon.svg" 
              alt="ASM SHINE Logo" 
              style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.8px', color: '#1E293B', lineHeight: 1.1 }}>
                ASM <span style={{ color: '#2874F0' }}>SHINE</span>
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '1.4px', color: '#2874F0', marginTop: '1px' }}>
                HYGIENE &amp; CLEANING
              </span>
            </div>
          </div>

          <button
            type="button"
            className="delivery-location-btn"
            onClick={() => setIsAddressModalOpen(true)}
            title="Click to select or change delivery address"
          >
            <MapPin size={15} color="#2874F0" style={{ flexShrink: 0 }} />
            <div className="location-text-col">
              <span className="location-sub">Deliver to</span>
              <span className="location-name">{displayLocation}</span>
            </div>
            <ChevronDown size={14} color="#64748B" style={{ flexShrink: 0 }} />
          </button>
        </div>

        {/* Global Search Bar (Flipkart Style) */}
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
              placeholder="Search for Toilet Cleaner, Floor Cleaner, Colin Glass, Dishwash Gel..."
              onFocus={() => setIsSearchOpen(true)}
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              readOnly
            />
            <button
              type="button"
              className="search-submit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Desktop Quick Nav Actions */}
        <div className="desktop-actions-group">
          <button
            type="button"
            className="desktop-nav-btn"
            onClick={() => navigate('/about')}
            title="Learn about ASM Shine laboratory standard"
          >
            <span>About Us</span>
          </button>

          <button
            type="button"
            className="desktop-nav-btn"
            onClick={() => showToast(`Wishlist contains ${wishlist.size} saved items`)}
            title="Saved items in wishlist"
          >
            <div className="nav-icon-wrap">
              <Heart
                size={18}
                color={wishlist.size > 0 ? '#DC2626' : '#475569'}
                fill={wishlist.size > 0 ? '#DC2626' : 'none'}
              />
              {wishlist.size > 0 && (
                <span className="nav-badge-pill-count">{wishlist.size}</span>
              )}
            </div>
            <span>Wishlist</span>
          </button>

          <button
            type="button"
            className="desktop-nav-btn desktop-cart-btn"
            onClick={() => handleNav('cart')}
            title="View Shopping Cart"
          >
            <div className="nav-icon-wrap">
              <ShoppingBag size={18} color="#2874F0" />
              {cartCount > 0 && (
                <span className="nav-badge-pill-count cart">{cartCount}</span>
              )}
            </div>
            <span>Cart</span>
          </button>

          <button
            type="button"
            className="desktop-nav-btn desktop-account-btn"
            onClick={() => navigate(user ? '/account' : '/login')}
            id="desktop-account-btn"
          >
            <User size={18} color="#2874F0" />
            <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </button>
        </div>
      </div>

      {/* 2. Desktop Category Sub-Navbar Strip */}
      <div className="desktop-category-bar">
        <div className="desktop-category-inner">
          {CATEGORY_ITEMS.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className="desktop-category-pill"
                onClick={() => {
                  if (cat.id === 'all') navigate('/categories');
                  else navigate(`/categories?category=${cat.id}`, { state: { category: cat.id } });
                }}
              >
                <IconComp size={14} className="cat-pill-icon" />
                <span>{cat.label}</span>
              </button>
            );
          })}
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
