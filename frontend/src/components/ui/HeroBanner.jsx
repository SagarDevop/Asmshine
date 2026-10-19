import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = ({ banners, banner, onExplore, onSelectProduct }) => {
  const slides = banners?.heroSlides || [
    {
      id: 'slide_1',
      tag: 'LAUNCH OFFER • 40% OFF',
      title: 'Himalayan Shilajit Gold',
      subtitle: 'Pure 24K Resin • Sourced at 18,000+ ft',
      ctaText: 'Order Now',
      productId: 'prod_1',
      image: '/images/banners/zenvoro_banner_shilajit.jpg'
    },
    {
      id: 'slide_2',
      tag: 'THE SACRED TRIO',
      title: 'Complete 3-Ritual Box',
      subtitle: 'Save Flat ₹2,998 + Free Brass Spoon',
      ctaText: 'Claim Deal',
      productId: 'prod_1',
      image: '/images/banners/zenvoro_banner_bundle.jpg'
    },
    {
      id: 'slide_3',
      tag: 'DAILY FOCUS • 35% OFF',
      title: 'Mind & Focus Zenith',
      subtitle: 'Zero Brain Fog • 100% Herbal Synergy',
      ctaText: 'Explore',
      productId: 'prod_2',
      image: '/images/banners/zenvoro_hero_banner.png'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slides every 4.5 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
  };

  const currentSlide = slides[currentIndex];

  const handleCtaClick = () => {
    if (currentSlide.productId && onSelectProduct) {
      onSelectProduct({ id: currentSlide.productId });
    } else if (onExplore) {
      onExplore();
    }
  };

  return (
    <div
      className="fk-hero-carousel-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Sale Banners"
    >
      {/* Full-Image Slide Card */}
      <div className="fk-hero-full-slide" onClick={handleCtaClick}>
        {/* 100% Full Background Image */}
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="fk-hero-full-img"
          loading="eager"
        />

        {/* Minimal Luxury Dark-to-Transparent Gradient Overlay */}
        <div className="fk-hero-gradient-overlay" />

        {/* Minimal Text Content (Left-Aligned, Short & Punchy) */}
        <div className="fk-hero-overlay-content">
          <span className="fk-hero-mini-tag">{currentSlide.tag}</span>
          <h2 className="fk-hero-main-title">{currentSlide.title}</h2>
          <p className="fk-hero-main-sub">{currentSlide.subtitle}</p>

          <button
            type="button"
            className="fk-hero-cta-pill"
            onClick={(e) => {
              e.stopPropagation();
              handleCtaClick();
            }}
          >
            <span>{currentSlide.ctaText}</span>
            <ChevronRight size={13} strokeWidth={2.8} />
          </button>
        </div>
      </div>

      {/* Prev / Next Minimal Arrow Buttons */}
      <button
        type="button"
        className="fk-carousel-nav-btn prev"
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className="fk-carousel-nav-btn next"
        onClick={handleNext}
        aria-label="Next Slide"
      >
        <ChevronRight size={16} />
      </button>

      {/* Sleek Bottom Dots */}
      <div className="fk-carousel-dots-row">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            type="button"
            className={`fk-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
