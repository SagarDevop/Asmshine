import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronRight,
  Search,
  Layers,
  Flame,
  Brain,
  Moon,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categoryPillMap = {
  inner_power: { label: 'Shilajit Gold', icon: Flame },
  brain_focus: { label: 'Mind & Focus', icon: Brain },
  deep_recovery: { label: 'Deep Sleep', icon: Moon }
};

export const Header = ({
  onSearch,
  categories = [],
  selectedCategory = null,
  onSelectCategory = () => {},
  onSwitchTab
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('110001, Connaught Place');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
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
              alt="ZENVORO"
              className="fk-brand-logo-img"
            />
            <div className="fk-brand-text-block">
              <span className="fk-brand-name">ZENVORO</span>
              <span className="fk-brand-tagline">Ayurvedic Maison</span>
            </div>
          </div>

          {/* Minimal Delivery Location Pill */}
          <button
            type="button"
            className="fk-location-clean-pill"
            onClick={cycleLocation}
            title="Change Delivery Location"
          >
            <MapPin size={12} color="#85532F" />
            <span className="fk-location-text">{location}</span>
            <ChevronRight size={12} color="#85532F" />
          </button>
        </div>
      </div>

      {/* 2. Sticky Header with Search & Classy Category Pills */}
      <header className={`fk-sticky-container mobile-only ${isScrolled ? 'scrolled' : ''}`}>
        {/* Search Bar */}
        <div className="fk-search-bar-row">
          <div className="fk-search-pill-wrapper">
            <Search size={16} className="fk-search-icon" />
            <input
              type="text"
              className="fk-search-input-pill"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search Shilajit Gold, Nootropic, Elixir..."
            />
          </div>
        </div>

        {/* Minimal Classy Category Filter Track */}
        <div className="fk-category-pills-row no-scrollbar">
          {/* "All Rituals" Pill */}
          <button
            type="button"
            className={`fk-cat-pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            <Layers size={13} className="fk-cat-pill-icon" />
            <span>All Rituals</span>
          </button>

          {/* Dynamic Category Pills */}
          {categories.map((cat) => {
            const mapped = categoryPillMap[cat.id] || { label: cat.name, icon: Sparkles };
            const IconComp = mapped.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                className={`fk-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
              >
                <IconComp size={13} className="fk-cat-pill-icon" />
                <span>{mapped.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
