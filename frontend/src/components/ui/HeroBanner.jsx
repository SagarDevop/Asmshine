import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = ({ banners, products = [], onExplore, onSelectProduct }) => {
  const initialSlides = banners?.heroSlides && banners.heroSlides.length > 0
    ? banners.heroSlides
    : [
        {
          id: 'slide_diwali_toilet',
          title: 'ASM Smart Clean Toilet Cleaner 500ml @ ₹69',
          productId: 'asm_toilet_1',
          image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938228/asm-shine/banners/banner_diwali_toilet.png'
        },
        {
          id: 'slide_floor_cleaner_5l',
          title: 'ASM Shine Floor Cleaner 5 Litre @ ₹249',
          productId: 'asm_floor_1',
          image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938229/asm-shine/banners/banner_floor_cleaner_5l.jpg'
        }
      ];

  // Only show slides whose products actually exist and are active
  const slides = Array.isArray(products) && products.length > 0
    ? initialSlides.filter((s) => !s.productId || products.some((p) => (p.id === s.productId || p._id === s.productId) && p.status !== 'archived' && p.status !== 'inactive'))
    : initialSlides;

  const activeSlides = slides.length > 0 ? slides : initialSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slides every 4.5 seconds
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
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

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handleCtaClick = () => {
    if (currentSlide?.productId && onSelectProduct) {
      if (Array.isArray(products) && products.length > 0) {
        const found = products.find(
          (p) => p.id === currentSlide.productId || p._id === currentSlide.productId
        );
        if (found) {
          onSelectProduct(found);
          return;
        }
      }
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
      aria-label="Promotional Posters"
    >
      {/* Pure Flipkart-Style Graphic Poster Banner without HTML text overlay */}
      <div className="fk-hero-full-slide" onClick={handleCtaClick}>
        <img
          src={currentSlide?.image || 'https://res.cloudinary.com/dheyj35ys/image/upload/v1792938228/asm-shine/banners/banner_diwali_toilet.png'}
          alt={currentSlide?.title || 'ASM Shine Promotional Poster'}
          className="fk-hero-full-img"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/banners/banner_diwali_toilet.png';
          }}
        />
      </div>

      {/* Prev / Next Minimal Arrow Buttons */}
      <button
        type="button"
        className="fk-carousel-nav-btn prev"
        onClick={handlePrev}
        aria-label="Previous Poster"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className="fk-carousel-nav-btn next"
        onClick={handleNext}
        aria-label="Next Poster"
      >
        <ChevronRight size={16} />
      </button>

      {/* Sleek Flipkart Bottom Dots */}
      <div className="fk-carousel-dots-row">
        {activeSlides.map((s, idx) => (
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
