import React from 'react';
import { Search, ShoppingBag, Heart, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';

export const DesktopNav = ({ onSearch, onSwitchTab }) => {
  const { cartCount, wishlist, showToast } = useCartWishlist();
  const navigate = useNavigate();

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
              alt="ZENVORO Logo" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #CBA243' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '2px', color: '#3D2314', fontFamily: 'serif' }}>
                ZENVORO
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: '600', letterSpacing: '1.5px', color: '#85532F', marginTop: '-3px' }}>
                ELEVATE YOUR INNER POWER
              </span>
            </div>
          </div>

          <button
            className="delivery-location-btn"
            style={{ marginLeft: '16px' }}
            onClick={() => showToast('Delivery location: Delhi NCR & Pan India (Free Express Shipping)')}
          >
            <MapPin size={16} color="#85532F" />
            <span>Deliver to <span className="location-name">New Delhi 110001</span></span>
            <ChevronDown size={14} color="#6B5547" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="desktop-search-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search Shilajit Gold, Nootropic Focus, Cellular Recovery Elixir..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Quick Nav Actions */}
        <div className="desktop-actions-group">
          <button
            className="desktop-nav-btn"
            onClick={() => handleNav('categories')}
          >
            <Sparkles size={16} color="#CBA243" />
            <span>The 3 Rituals</span>
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => showToast(`Wishlist contains ${wishlist.size} saved items`)}
          >
            <Heart size={18} color={wishlist.size > 0 ? '#DC2626' : '#3D2314'} />
            <span>Wishlist ({wishlist.size})</span>
          </button>

          <button
            className="desktop-nav-btn"
            style={{ position: 'relative' }}
            onClick={() => handleNav('cart')}
          >
            <ShoppingBag size={18} color="#85532F" />
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
    </div>
  );
};
