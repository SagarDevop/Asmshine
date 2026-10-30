import React, { useState, useEffect } from 'react';
import { Tag, Check } from 'lucide-react';
import { api } from '../../services/api';

export const OfferStrip = ({ offer, onCopyCode }) => {
  const [activeCoupon, setActiveCoupon] = useState(offer || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (offer) {
      setActiveCoupon(offer);
    } else {
      let isMounted = true;
      api.getAvailableCoupons().then((list) => {
        if (isMounted && list && list.length > 0) {
          setActiveCoupon(list[0]);
        }
      }).catch(() => {});
      return () => { isMounted = false; };
    }
  }, [offer]);

  if (!activeCoupon) return null;

  const code = activeCoupon.code;
  const label = activeCoupon.description || (activeCoupon.discountType === 'percentage' ? `Flat ${activeCoupon.discountValue}% Off Deal` : `Flat ₹${activeCoupon.discountValue} Off Deal`);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyCode) onCopyCode(code);
  };

  return (
    <div className="promo-strip" role="region" aria-label="Special Offers">
      <div className="promo-left">
        <Tag size={13} color="#1C8E8F" strokeWidth={2.4} />
        <span className="promo-short-text">{label}</span>
      </div>
      <button className="promo-badge" onClick={handleCopy} title="Copy coupon code">
        {copied ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Check size={11} strokeWidth={3} /> COPIED
          </span>
        ) : (
          <span>CODE: <strong>{code}</strong></span>
        )}
      </button>
    </div>
  );
};
