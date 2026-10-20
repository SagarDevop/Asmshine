import React, { useState } from 'react';
import { Tag, Check } from 'lucide-react';

export const OfferStrip = ({ offer, onCopyCode }) => {
  const code = offer?.code || 'POWER20';
  const [copied, setCopied] = useState(false);

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
        <span className="promo-short-text">Flat 20% Off Launch Deal</span>
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
