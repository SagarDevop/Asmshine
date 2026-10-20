import React from 'react';
import { Home, Grid2X2, BadgeCheck, ShoppingBag, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';

export const BottomNav = ({ activeTab: activeTabProp, onTabChange }) => {
  const { cartCount, showToast } = useCartWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active tab from pathname if not explicitly passed
  let activeTab = activeTabProp;
  if (!activeTab) {
    if (location.pathname === '/categories') activeTab = 'categories';
    else if (location.pathname === '/about') activeTab = 'about';
    else if (location.pathname === '/cart') activeTab = 'cart';
    else if (location.pathname === '/') activeTab = 'home';
    else activeTab = '';
  }

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
      return;
    }

    if (tabId === 'home') navigate('/');
    else if (tabId === 'categories') navigate('/categories');
    else if (tabId === 'about') navigate('/about');
    else if (tabId === 'cart') navigate('/cart');
    else if (tabId === 'account') {
      showToast('Anchay Club: Welcome to the VIP Carrywear Circle');
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Bags', icon: Grid2X2 },
    { id: 'about', label: 'About', icon: BadgeCheck },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              className={`nav-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <div className="nav-icon-wrapper">
                <IconComponent
                  size={20}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  fill={isActive && tab.id === 'home' ? 'rgba(28, 142, 143, 0.15)' : 'none'}
                />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="nav-badge-pill">{tab.badge}</span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
