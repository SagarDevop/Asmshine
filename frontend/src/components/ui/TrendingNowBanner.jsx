import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ASM Shine – "Trending Now" Promotional Banner
 * Clean, full-width responsive banner component replacing outdated Diwali content.
 * Maintains native landscape aspect ratio (1024/524), eliminates CLS,
 * and navigates to the existing Hand Hygiene category page on click / "Shop Now".
 */
export const TrendingNowBanner = ({ banners, onNavigateCategory }) => {
  const navigate = useNavigate();

  const bannerImage = banners?.trendingBanner?.image || '/images/banners/trending_now_banner.jpg';
  const targetCategory = banners?.trendingBanner?.category || 'hand_hygiene';

  const handleBannerClick = () => {
    if (onNavigateCategory) {
      onNavigateCategory(targetCategory);
    } else {
      navigate(`/categories?category=${targetCategory}`, { state: { category: targetCategory } });
    }
  };

  return (
    <section className="asm-trending-banner-section" aria-label="ASM Shine Trending Now Promotional Banner">
      <div
        className="asm-trending-banner-wrap"
        onClick={handleBannerClick}
        role="button"
        tabIndex={0}
        aria-label="ASM Shine Trending Now - Popular choices. Trusted care. Shop Hand Wash Now"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBannerClick();
          }
        }}
      >
        <img
          src={bannerImage}
          alt="ASM Shine Trending Now - Popular choices. Trusted care. Shop Hand Wash"
          className="asm-trending-banner-img"
          width="1024"
          height="524"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
};

// Backward-compatible alias for any legacy imports
export const DiwaliSaleSection = TrendingNowBanner;
export default TrendingNowBanner;
