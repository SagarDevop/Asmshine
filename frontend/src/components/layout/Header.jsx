import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets,
  Plane,
  Tag,
  Zap,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchOverlay } from '../search/SearchOverlay';
import { AddressSelectModal } from '../ui/AddressSelectModal';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_TABS = [
  {
    id: 'all',
    label: 'All Shine',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938241/asm-shine/categories/all.jpg'
  },
  {
    id: 'toilet_care',
    label: 'Toilet',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938256/asm-shine/categories/toilet_care.jpg'
  },
  {
    id: 'bathroom_care',
    label: 'Bathroom',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938242/asm-shine/categories/bathroom_care.jpg'
  },
  {
    id: 'glass_care',
    label: 'Glass & Colin',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938247/asm-shine/categories/glass_care.jpg'
  },
  {
    id: 'floor_care',
    label: 'Floor Cleaner',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938246/asm-shine/categories/floor_care.jpg'
  },
  {
    id: 'dishwash',
    label: 'Dishwash',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938244/asm-shine/categories/dishwash.jpg'
  },
  {
    id: 'kitchen_care',
    label: 'Kitchen Care',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938253/asm-shine/categories/kitchen_care.jpg'
  },
  {
    id: 'laundry_care',
    label: 'Laundry Care',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938254/asm-shine/categories/laundry_care.jpg'
  },
  {
    id: 'hand_hygiene',
    label: 'Hand Wash',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938250/asm-shine/categories/hand_hygiene.jpg'
  }
];

export const Header = ({
  onSearch,
  selectedCategory = null,
  onSelectCategory = () => {},
  onSwitchTab
}) => {
  const navigate = useNavigate();
  const { showToast } = useCartWishlist();
  const { user, selectedAddress } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('asm_shine');
  const sentinelRef = useRef(null);
  const headerRef = useRef(null);

  const displayLocation = selectedAddress
    ? `${selectedAddress.fullName || selectedAddress.name || 'Deliver to'}, ${selectedAddress.city || selectedAddress.state} - ${selectedAddress.pincode}`
    : 'Select Delivery Location';

  useEffect(() => {
    if (!sentinelRef.current || !headerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!headerRef.current) return;
        if (entry.isIntersecting) {
          headerRef.current.classList.remove('is-scrolled');
        } else {
          headerRef.current.classList.add('is-scrolled');
        }
      },
      {
        root: null,
        threshold: 0
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabClick = (tabId, e) => {
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }

    if (onSelectCategory) {
      onSelectCategory(tabId);
    } else {
      navigate(`/categories?category=${tabId}`, { state: { category: tabId } });
    }
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === 'asm_shine') {
      onSelectCategory(null);
      showToast('ASM Shine: Official Hygiene & Cleaners Store');
    } else if (mode === 'combos') {
      showToast('Super Combos: Complete Home Hygiene Kits at 40% OFF!');
    } else if (mode === 'refills') {
      showToast('Refill Store: Eco-friendly bulk refill packs & jars');
    }
  };

  return (
    <>
      {/* 1. Top Section: Flipkart Sky Blue Gradient Banner (Pills & Location) */}
      <div className="fk-header-top-banner mobile-only">
        {/* Top 3 Mode Pills (ASM SHINE Yellow / Super Combos / Refill Store) */}
        <div className="fk-top-pills-row">
          {/* Active Yellow Brand Pill: ASM on top, SHINE niche */}
          <button
            type="button"
            className={`fk-top-pill-btn ${activeMode === 'asm_shine' ? 'pill-yellow' : 'pill-white'}`}
            onClick={() => handleModeChange('asm_shine')}
          >
            <div className="fk-brand-pill-text">
              <span className="fk-pill-asm">ASM</span>
              <span className="fk-pill-shine">SHINE</span>
            </div>
          </button>

          {/* Cleaning Combos White Pill */}
          <button
            type="button"
            className={`fk-top-pill-btn ${activeMode === 'combos' ? 'pill-yellow' : 'pill-white'}`}
            onClick={() => handleModeChange('combos')}
          >
            <div className="fk-pill-icon-wrap">
              <div className="fk-tag-badge-icon">
                <SprayCan size={17} color="#2874F0" />
              </div>
            </div>
            <span className="fk-pill-label">Super Combos</span>
          </button>

          {/* Cleaning Refill Store White Pill */}
          <button
            type="button"
            className={`fk-top-pill-btn ${activeMode === 'refills' ? 'pill-yellow' : 'pill-white'}`}
            onClick={() => handleModeChange('refills')}
          >
            <div className="fk-pill-icon-wrap">
              <Droplets size={17} color="#0284C7" fill="#BAE6FD" />
            </div>
            <span className="fk-pill-label">Refill Store</span>
          </button>
        </div>

        {/* Middle Location & Rewards/Coins Row */}
        <div className="fk-location-rewards-row">
          <div
            className="fk-location-clickable"
            onClick={() => setIsAddressModalOpen(true)}
            title="Click to select or change delivery location"
          >
            <MapPin size={15} className="fk-loc-pin-icon" fill="#1E293B" color="#1E293B" />
            <span className="fk-location-name-text">{displayLocation}</span>
            <ChevronRight size={14} className="fk-loc-chevron-icon" />
          </div>

          <div className="fk-header-rewards-group">
            {/* Purple Voucher Button */}
            <button
              type="button"
              className="fk-voucher-btn"
              onClick={() => showToast('🎟️ 15% OFF ASM Shine Coupon applied!')}
              title="Special Coupons"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#7C3AED">
                <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z"/>
                <circle cx="9" cy="12" r="1.5" fill="#FFFFFF"/>
                <circle cx="15" cy="12" r="1.5" fill="#FFFFFF"/>
              </svg>
            </button>

            {/* SuperCoin Pill Button */}
            <button
              type="button"
              className="fk-supercoin-btn"
              onClick={() => showToast('ASM Shine Reward Coins: 0')}
              title="Reward Coins"
            >
              <div className="fk-coin-icon-circle">
                <Zap size={10} color="#F59E0B" fill="#F59E0B" />
              </div>
              <span className="fk-supercoin-balance">0</span>
            </button>

            {/* Mobile Account Profile Icon */}
            <button
              type="button"
              className="fk-account-mobile-btn"
              onClick={() => navigate(user ? '/account' : '/login')}
              title={user ? `Account (${user.name})` : 'Sign In / Account'}
              aria-label="Account"
              id="mobile-header-account-btn"
            >
              <User size={15} color="#2874F0" />
            </button>
          </div>
        </div>
      </div>

      {/* Sentinel trigger element */}
      <div ref={sentinelRef} className="fk-header-sentinel mobile-only" aria-hidden="true" />

      {/* 2. Pure Sticky Header (Search Bar AND Category Tabs - ALWAYS STUCK!) */}
      <header ref={headerRef} className="fk-mobile-sticky-header mobile-only">
        {/* Search Bar Row */}
        <div className="fk-search-bar-row">
          <div
            className="fk-search-pill-wrapper"
            onClick={() => setIsSearchOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsSearchOpen(true);
            }}
          >
            <Search size={18} className="fk-search-icon" />
            <input
              type="text"
              className="fk-search-input-pill"
              value={searchTerm}
              onFocus={() => setIsSearchOpen(true)}
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              readOnly
              placeholder="Search for Products"
            />
          </div>
        </div>

        {/* Flipkart Category Tabs Track (STUCK right below search bar) */}
        <div className="fk-category-tabs-track no-scrollbar">
          {CATEGORY_TABS.map((cat) => {
            const isActive = (!selectedCategory && cat.id === 'all') || selectedCategory === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                className={`fk-cat-tab-btn ${isActive ? 'active' : ''}`}
                onClick={(e) => handleTabClick(cat.id, e)}
              >
                {/* 3D Glossy E-Commerce Category Icon Image Box */}
                <div className="fk-cat-squircle-box">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="fk-cat-img"
                    loading="lazy"
                  />
                </div>

                {/* Category Text Label */}
                <span className="fk-cat-tab-label">{cat.label}</span>

                {/* Flipkart Active Underline Indicator Bar */}
                {isActive && <div className="fk-cat-active-bar" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* Flipkart-Style Full White Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchTerm}
      />

      {/* Dynamic Delivery Address Selection Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </>
  );
};
