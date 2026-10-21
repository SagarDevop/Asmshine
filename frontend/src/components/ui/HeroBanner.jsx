import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = ({ banners, onExplore, onSelectProduct }) => {
  const slides = banners?.heroSlides || [
    {
      id: 'slide_diwali_toilet',
      title: 'ASM Smart Clean Toilet Cleaner 500ml @ ₹69',
      productId: 'asm_toilet_1',
      image: '/images/banners/banner_diwali_toilet.png'
    },
    {
      id: 'slide_floor_cleaner_5l',
      title: 'ASM Shine Floor Cleaner 5 Litre @ ₹249',
      productId: 'asm_floor_1',
      image: '/images/banners/banner_floor_cleaner_5l.jpg'
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
      aria-label="Promotional Posters"
    >
      {/* Pure Flipkart-Style Graphic Poster Banner without HTML text overlay */}
      <div className="fk-hero-full-slide" onClick={handleCtaClick}>
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="fk-hero-full-img"
          loading="eager"
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
