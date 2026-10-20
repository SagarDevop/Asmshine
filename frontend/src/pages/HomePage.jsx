import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { DesktopNav } from '../components/navigation/DesktopNav';
import { BottomNav } from '../components/navigation/BottomNav';
import { OfferStrip } from '../components/ui/OfferStrip';
import { HeroBanner } from '../components/ui/HeroBanner';
import { ProductSection } from '../components/ui/ProductSection';
import { FlipkartPromoBanners } from '../components/ui/FlipkartPromoBanners';
import { useCartWishlist } from '../context/CartWishlistContext';
import { api } from '../services/api';

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toastMessage, showToast } = useCartWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, bans, prods] = await Promise.all([
          api.getCategories(),
          api.getBanners(),
          api.getProducts()
        ]);
        setCategories(cats);
        setBanners(bans);
        setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSwitchTab = (tab) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'home') navigate('/');
    else if (tab === 'categories') navigate('/categories');
    else if (tab === 'about') navigate('/about');
    else if (tab === 'cart') navigate('/cart');
    else if (tab === 'account') {
      showToast('Anchay Circle: Welcome to the VIP Carrywear Club');
    }
  };

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
  };

  // Filter products by selected category or search term
  const filterProducts = (list) => {
    return list.filter((p) => {
      if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'trio_ritual' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const displayedProducts = filterProducts(allProducts);

  const handleCopyOffer = (code) => {
    showToast(`Coupon ${code} copied to clipboard`);
  };

  const handleExploreHero = () => {
    const el = document.querySelector('.product-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      {/* Desktop Navigation */}
      <DesktopNav
        onSearch={setSearchQuery}
        onSwitchTab={handleSwitchTab}
      />

      {/* Screen Container */}
      <div className="screen-container">
        {/* Mobile Header with Flipkart Category Bar */}
        <Header
          onSearch={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSwitchTab={handleSwitchTab}
        />

        <main className="main-content">
          {/* 1. Promotional Offer Strip */}
          <OfferStrip offer={banners?.announcement} onCopyCode={handleCopyOffer} />

          {/* 2. Interactive Flipkart-Style Sale Carousel */}
          <HeroBanner
            banners={banners}
            banner={banners?.hero}
            onExplore={handleExploreHero}
            onSelectProduct={handleSelectProduct}
          />

          {/* 3. Featured Bags (Rendered cleanly without duplication) */}
          <ProductSection
            title="Featured Bags & Carrywear"
            badge="BESTSELLERS"
            subtitle="Engineered for Daily Commute, Work & Travel"
            actionText="View All"
            actionLinkStyle="chevron"
            products={displayedProducts}
            showRating={true}
            sizePosition="below"
            onActionClick={() => handleSwitchTab('categories')}
            onSelectProduct={handleSelectProduct}
          />

          {/* 4. Flipkart-Style Promotional Offer Banners & Purity Standards */}
          <FlipkartPromoBanners
            onSelectProduct={handleSelectProduct}
            onNavigateCategories={() => handleSwitchTab('categories')}
          />
        </main>

        {/* Desktop & Mobile Footer */}
        <footer className="desktop-footer">
          <div className="desktop-footer-inner">
            <span>© 2026 Anchay Bags. All rights reserved.</span>
            <span>CRAFTED FOR MODERN JOURNEYS</span>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab="home"
        onTabChange={handleSwitchTab}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="toast-notice" role="alert">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
