import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Heart, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="desktop-footer" style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '40px 20px 24px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        {/* Col 1: Brand & Promise */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img src="/favicon.svg" alt="ASM Shine" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              ASM SHINE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            Advanced household &amp; commercial cleaning formulations engineered for superior shine, deep disinfection, and everyday hygiene.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
            <ShieldCheck size={14} color="#16A34A" />
            <span>100% Authentic Guaranteed</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
            <li>
              <Link to="/categories" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
                All Products &amp; Combos
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
                About ASM Shine Labs
              </Link>
            </li>
            <li>
              <Link to="/cart" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link to="/account" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
                My Account &amp; Orders
              </Link>
            </li>
            <li>
              <Link to="/track-order" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
                Track Live Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & Policies (MANDATORY PHASE 5 INTEGRATION) */}
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
            Legal &amp; Policies
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
            <li>
              <Link to="/terms-and-conditions" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>
                Refund &amp; Return Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Support & Contact */}
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
            Customer Support
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="#2563EB" />
              <a href="mailto:support@asmshine.com" style={{ color: '#475569', textDecoration: 'none' }}>
                support@asmshine.com
              </a>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
              <Clock size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Monday – Saturday<br />9:00 AM – 6:00 PM IST</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="#2563EB" />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '18px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#64748B' }}>
        <span>© {new Date().getFullYear()} ASM Shine. All rights reserved.</span>
        <span>ADVANCED CLEANING &amp; HYGIENE SOLUTIONS</span>
      </div>
    </footer>
  );
};
export default Footer;
