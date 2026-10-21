import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchOverlay } from '../search/SearchOverlay';
import { useCartWishlist } from '../../context/CartWishlistContext';

const CATEGORY_TABS = [
  {
    id: 'all',
    label: 'All Shine',
    image: '/images/categories/all.jpg'
  },
  {
    id: 'toilet_care',
    label: 'Toilet',
    image: '/images/categories/toilet_care.jpg'
  },
  {
    id: 'bathroom_care',
    label: 'Bathroom',
    image: '/images/categories/bathroom_care.jpg'
  },
  {
    id: 'glass_care',
    label: 'Glass & Colin',
    image: '/images/categories/glass_care.jpg'
  },
  {
    id: 'floor_care',
    label: 'Floor Cleaner',
    image: '/images/categories/floor_care.jpg'
  },
  {
    id: 'dishwash',
    label: 'Dishwash',
    image: '/images/categories/dishwash.jpg'
  },
  {
    id: 'kitchen_care',
    label: 'Kitchen Care',
    image: '/images/categories/kitchen_care.jpg'
  },
  {
    id: 'laundry_care',
    label: 'Laundry Care',
    image: '/images/categories/laundry_care.jpg'
  },
  {
    id: 'hand_hygiene',
    label: 'Hand Wash',
    image: '/images/categories/hand_hygiene.jpg'
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, setLocation] = useState('1, Jhanjhari, Banda, Uttar Pradesh');
  const [activeMode, setActiveMode] = useState('asm_shine');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 28);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId, e) => {
    if (tabId === 'all') {
      onSelectCategory(null);
    } else {
      onSelectCategory(tabId);
    }
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
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

  const cycleLocation = () => {
    setLocation((prev) => {
      let nextLoc = '1, Jhanjhari, Banda, Uttar Pradesh';
      if (prev.includes('Jhanjhari')) nextLoc = '110001, Connaught Place, New Delhi';
      else if (prev.includes('Connaught Place')) nextLoc = '400001, South Mumbai';
      else if (prev.includes('South Mumbai')) nextLoc = '560001, MG Road, Bengaluru';
      else nextLoc = '1, Jhanjhari, Banda, Uttar Pradesh';

      showToast(`Delivering to ${nextLoc}`);
      return nextLoc;
    });
  };

  return (
    <>
      <header className={`fk-mobile-header-root mobile-only ${isScrolled ? 'scrolled' : ''}`}>
        {/* Full Sky Blue to White Gradient Wrapper (Exactly matching screenshot) */}
        <div className="fk-header-gradient-wrapper">
          {/* 1. Top 3 Mode Pills (ASM SHINE Yellow / Super Combos / Refill Store) */}
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
                  <SprayCan size={17} color="#059669" />
              
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

          {/* 2. Middle Location & Rewards/Coins Row */}
          <div className="fk-location-rewards-row">
            <div
              className="fk-location-clickable"
              onClick={cycleLocation}
              title="Click to change location"
            >
              <MapPin size={15} className="fk-loc-pin-icon" fill="#1E293B" color="#1E293B" />
              <span className="fk-location-name-text">{location}</span>
              <ChevronRight size={14} className="fk-loc-chevron-icon" />
            </div>

            <div className="fk-header-rewards-group">
              {/* Purple Voucher Button */}
              <button
                type="button"
                className="fk-voucher-btn"
                onClick={() => showToast('🎟️ 15% OFF Flipkart Voucher applied!')}
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
                onClick={() => showToast('Flipkart SuperCoin Balance: 0')}
                title="SuperCoins"
              >
                <div className="fk-coin-icon-circle">
                  <Zap size={10} color="#F59E0B" fill="#F59E0B" />
                </div>
                <span className="fk-supercoin-balance">0</span>
              </button>
            </div>
          </div>

          {/* 3. Flipkart Blue Border Search Bar */}
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
        </div>

        {/* 4. Flipkart Category Tabs Track */}
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
    </>
  );
};
