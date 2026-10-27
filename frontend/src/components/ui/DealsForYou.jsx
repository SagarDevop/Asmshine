import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export const DealsForYou = ({ onSelectProduct, onNavigateAll }) => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.getProducts().then((products) => {
      if (Array.isArray(products) && products.length > 0) {
        const formatted = products.slice(0, 6).map((p) => ({
          id: p.id || p._id,
          name: p.shortName || p.name,
          size: p.size || 'Standard Pack',
          dealPrice: p.price,
          mrp: p.originalPrice || Math.round(p.price * 1.3),
          discount: p.discountPercent ? `${p.discountPercent}% off` : 'Special Offer',
          badge: p.badge || (p.price < 99 ? 'UNDER ₹99' : 'TOP DEAL'),
          image: p.image
        }));
        setDeals(formatted);
      }
    }).catch(() => {});
  }, []);

  // Subtle live countdown timer: 05h : 24m : 18s
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (n) => String(n).padStart(2, '0');

  const handleCardClick = (deal) => {
    if (onSelectProduct) {
      onSelectProduct({ id: deal.id });
    }
  };

  if (deals.length === 0) return null;

  return (
    <section className="fk-deals-section" aria-label="Deals for You">
      {/* Clean Minimal Header with Timer */}
      <div className="fk-deals-header">
        <div className="fk-deals-title-group">
          <h2 className="fk-deals-title">Deals for You</h2>
          <div className="fk-deals-timer" title="Deal ends soon">
            <Clock size={12} className="fk-timer-icon" />
            <span className="fk-timer-text">
              Ends in {formatNum(timeLeft.hours)}h : {formatNum(timeLeft.minutes)}m : {formatNum(timeLeft.seconds)}s
            </span>
          </div>
        </div>

        <button
          type="button"
          className="fk-deals-view-all"
          onClick={onNavigateAll}
          aria-label="View all deals"
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scrollable Rail of Deal Cards */}
      <div className="fk-deals-scroll-rail">
        {deals.map((deal) => (
          <article
            key={deal.id + deal.dealPrice}
            className="fk-deal-card"
            onClick={() => handleCardClick(deal)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(deal);
              }
            }}
          >
            {/* Top Deal Badge */}
            <span className="fk-deal-badge">{deal.badge}</span>

            {/* Product Thumbnail */}
            <div className="fk-deal-img-wrap">
              <img
                src={deal.image}
                alt={deal.name}
                className="fk-deal-img"
                loading="lazy"
              />
            </div>

            {/* Product Info */}
            <div className="fk-deal-body">
              <h3 className="fk-deal-name" title={deal.name}>
                {deal.name}
              </h3>
              <span className="fk-deal-size">{deal.size}</span>

              {/* Price & Discount Row (No cluttering Add button) */}
              <div className="fk-deal-price-row">
                <div className="fk-deal-pricing">
                  <span className="fk-deal-price">₹{deal.dealPrice}</span>
                  <span className="fk-deal-mrp">₹{deal.mrp}</span>
                </div>
                <span className="fk-deal-discount-tag">
                  {deal.discount}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
