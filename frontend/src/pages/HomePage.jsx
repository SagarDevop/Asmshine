import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { DesktopNav } from '../components/navigation/DesktopNav';
import { BottomNav } from '../components/navigation/BottomNav';
import { HeroBanner } from '../components/ui/HeroBanner';
import { DealsForYou } from '../components/ui/DealsForYou';
import { DiwaliSaleSection } from '../components/ui/DiwaliSaleSection';
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
  const [loadError, setLoadError] = useState(null);
  const { toastMessage, showToast } = useCartWishlist();

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [cats, bans, prods] = await Promise.all([
        api.getCategories(),
        api.getBanners(),
        api.getProducts()
      ]);
      setCategories(cats || []);
      setBanners(bans);
      setAllProducts(prods || []);
    } catch (err) {
      console.error('Failed to load home page data:', err);
      setLoadError(err.message || 'Unable to connect to live catalog server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Cross-tab and focus sync so when admin deletes or updates product, home view updates immediately
    const handleSync = (e) => {
      if (e.data?.type === 'PRODUCTS_UPDATED') {
        fetchData();
      }
    };

    let channel = null;
    try {
      channel = new BroadcastChannel('asm_admin_sync');
      channel.addEventListener('message', handleSync);
    } catch {}

    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSwitchTab = (tab) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'home') navigate('/');
    else if (tab === 'categories') navigate('/categories');
    else if (tab === 'about') navigate('/about');
    else if (tab === 'cart') navigate('/cart');
    else if (tab === 'account') navigate('/account');
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
          onSelectCategory={(catId) => {
            navigate(`/categories?category=${catId || 'all'}`, { state: { category: catId || 'all' } });
          }}
          onSwitchTab={handleSwitchTab}
        />

        <main className="main-content">
          {loadError && (
            <div style={{ margin: '14px 14px 6px 14px', padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#991B1B', fontWeight: 600, fontSize: '12px' }}>{loadError}</span>
              <button
                type="button"
                onClick={fetchData}
                style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* 1. Interactive Flipkart-Style Sale Carousel (Festive Posters) */}
          <HeroBanner
            banners={banners}
            banner={banners?.hero}
            products={allProducts}
            onExplore={handleExploreHero}
            onSelectProduct={handleSelectProduct}
          />

          {/* 2. Deals for You (Live Timer & Fast Horizontal Rail) */}
          <DealsForYou
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onNavigateAll={() => handleSwitchTab('categories')}
          />

          {/* 3. Diwali Mega Sale (Festive Deep Cleaning Specials) */}
          <DiwaliSaleSection
            banners={banners}
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onNavigateAll={() => handleSwitchTab('categories')}
          />

          {/* 4. Bestsellers Cleaning Essentials */}
          <ProductSection
            title="Bestsellers"
            badge="4.8★ & ABOVE"
            subtitle="Most loved cleaning essentials trusted by 50,000+ homes"
            actionText="View All"
            actionLinkStyle="chevron"
            products={displayedProducts}
            loading={loading}
            showRating={true}
            sizePosition="below"
            onActionClick={() => handleSwitchTab('categories')}
            onSelectProduct={handleSelectProduct}
          />

          {/* 5. Clean Trust & Assurance Strip */}
          <FlipkartPromoBanners
            onSelectProduct={handleSelectProduct}
            onNavigateCategories={() => handleSwitchTab('categories')}
          />
        </main>

        {/* Desktop & Mobile Footer */}
        <footer className="desktop-footer">
          <div className="desktop-footer-inner">
            <span>© 2026 ASM Shine. All rights reserved.</span>
            <span>ADVANCED CLEANING &amp; HYGIENE SOLUTIONS</span>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab="home"
        onTabChange={handleSwitchTab}
      />
    </div>
  );
};
