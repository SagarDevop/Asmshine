import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronRight,
  Search,
  Backpack,
  Briefcase,
  Luggage,
  ShoppingBag,
  Compass,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchOverlay } from '../search/SearchOverlay';

const CATEGORY_TABS = [
  {
    id: 'all',
    label: 'For You',
    icon: ShoppingBag,
    bgColor: '#FFF7ED',       // Warm pastel gold/amber (matches screenshot 'For You')
    borderColor: '#FED7AA',
    iconColor: '#EA580C'
  },
  {
    id: 'backpacks',
    label: 'Backpacks',
    icon: Backpack,
    bgColor: '#ECFDF5',       // Soft pastel mint
    borderColor: '#A7F3D0',
    iconColor: '#059669'
  },
  {
    id: 'laptop_bags',
    label: 'Laptop Bags',
    icon: Briefcase,
    bgColor: '#EFF6FF',       // Soft pastel sky blue
    borderColor: '#BFDBFE',
    iconColor: '#2563EB'
  },
  {
    id: 'travel_duffels',
    label: 'Travel Duffels',
    icon: Luggage,
    bgColor: '#FFF1F2',       // Soft pastel peach / rose
    borderColor: '#FECDD3',
    iconColor: '#E11D48'
  },
  {
    id: 'totes',
    label: 'Tote Bags',
    icon: ShoppingBag,
    bgColor: '#FAF5FF',       // Soft pastel lilac / purple
    borderColor: '#E9D5FF',
    iconColor: '#9333EA'
  },
  {
    id: 'slings_crossbody',
    label: 'Slings',
    icon: Compass,
    bgColor: '#F0FDFA',       // Soft pastel teal
    borderColor: '#99F6E4',
    iconColor: '#0D9488'
  },
  {
    id: 'wallets_organizers',
    label: 'Organizers',
    icon: Package,
    bgColor: '#F8FAFC',       // Soft pastel slate
    borderColor: '#CBD5E1',
    iconColor: '#475569'
  }
];

export const Header = ({
  onSearch,
  selectedCategory = null,
  onSelectCategory = () => {},
  onSwitchTab
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, setLocation] = useState('110001, Connaught Place');
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

  const cycleLocation = () => {
    setLocation((prev) =>
      prev.includes('Connaught Place')
        ? '400001, South Mumbai'
        : prev.includes('South Mumbai')
        ? '560001, MG Road, Bengaluru'
        : '110001, Connaught Place'
    );
  };

  return (
    <>
      {/* 1. Sleek Minimal Upper Header */}
      <div className="fk-upper-header mobile-only">
        <div className="fk-brand-location-bar">
          {/* Brand Logo & Name */}
          <div
            className="fk-brand-identity"
            onClick={() => {
              if (onSwitchTab) onSwitchTab('home');
              else navigate('/');
            }}
          >
            <img
              src="/images/logo.png"
              alt="ANCHAY"
              className="fk-brand-logo-img"
            />
            <div className="fk-brand-text-block">
              <span className="fk-brand-name">ANCHAY</span>
              <span className="fk-brand-tagline">Premium Bags</span>
            </div>
          </div>

          {/* Minimal Delivery Location Pill */}
          <button
            type="button"
            className="fk-location-clean-pill"
            onClick={cycleLocation}
            title="Change Delivery Location"
          >
            <MapPin size={12} color="#1C8E8F" />
            <span className="fk-location-text">{location}</span>
            <ChevronRight size={12} color="#1C8E8F" />
          </button>
        </div>
      </div>

      {/* 2. Sticky Header with Search & Flipkart Squircle Category Tabs */}
      <header className={`fk-sticky-container mobile-only ${isScrolled ? 'scrolled' : ''}`}>
        {/* Search Bar Row with subtle light blue ambient gradient */}
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

        {/* Flipkart Category Tabs Track */}
        <div className="fk-category-tabs-track no-scrollbar">
          {CATEGORY_TABS.map((cat) => {
            const isActive = (!selectedCategory && cat.id === 'all') || selectedCategory === cat.id;
            const IconComp = cat.icon;

            return (
              <button
                type="button"
                key={cat.id}
                className={`fk-cat-tab-btn ${isActive ? 'active' : ''}`}
                onClick={(e) => handleTabClick(cat.id, e)}
              >
                {/* Squircle Icon Box: smoothly disappears/collapses when user scrolls down! */}
                <div
                  className="fk-cat-squircle-box"
                  style={{
                    backgroundColor: cat.bgColor,
                    borderColor: cat.borderColor,
                    color: cat.iconColor
                  }}
                >
                  <IconComp size={21} strokeWidth={1.9} />
                </div>

                {/* Category Text Label: stays stuck under the search bar */}
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

