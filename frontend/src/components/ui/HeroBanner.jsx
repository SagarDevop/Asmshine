import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = ({ banners, banner, onExplore, onSelectProduct }) => {
  const slides = banners?.heroSlides || [
    {
      id: 'slide_1',
      tag: 'URBAN TECH • 45% OFF',
      title: 'Anchay Apex Urban Pro 28L',
      subtitle: 'Water-Resistant Weave • 15.6" Laptop Armour',
      ctaText: 'Shop Backpack',
      productId: 'bag_1',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'slide_2',
      tag: 'TRAVEL & WEEKENDER',
      title: 'Anchay Nomad Weekender 45L',
      subtitle: 'Flight Cabin Approved • Dedicated Shoe Tunnel',
      ctaText: 'Explore Travel',
      productId: 'bag_12',
      image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'slide_3',
      tag: 'EXECUTIVE COLLECTION',
      title: 'Anchay Oxford Leather Briefcase',
      subtitle: 'Handcrafted Full-Grain Finish • Padded Dividers',
      ctaText: 'View Briefcase',
      productId: 'bag_7',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
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
