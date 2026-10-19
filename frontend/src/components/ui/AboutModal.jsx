import React from 'react';
import { X, Sparkles, ShieldCheck, Zap, Brain, Moon, Award } from 'lucide-react';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="about-modal-backdrop" onClick={onClose}>
      <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="about-modal-header">
          <div className="about-brand-row">
            <img src="/images/logo.png" alt="ZENVORO Logo" className="about-logo" style={{ borderRadius: '50%' }} />
            <div>
              <h3 className="about-title">About ZENVORO</h3>
              <p className="about-subtitle">Elevate Your Inner Power • Bio-Ayurvedic Maison</p>
            </div>
          </div>
          <button className="about-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="about-body">
          <p className="about-intro">
            <strong>ZENVORO</strong> is India’s foremost luxury wellness maison, formulating <strong>Himalayan Shilajit Gold Resin, Nootropic Focus, and Cellular Recovery Elixirs</strong> for peak human performance.
          </p>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
                <Zap size={20} color="#CBA243" />
              </div>
              <div className="about-feature-info">
                <h4>18,000+ Ft Himalayan Shilajit</h4>
                <p>Pure grade-A resin with &gt;80% bioactive Fulvic Acid and 24K gold dust.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
                <Brain size={20} color="#CBA243" />
              </div>
              <div className="about-feature-info">
                <h4>Clinical Nootropic Nutrients</h4>
                <p>Lion's Mane and Organic Brahmi for sharp focus with zero caffeine crash.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
                <Moon size={20} color="#CBA243" />
              </div>
              <div className="about-feature-info">
                <h4>Cellular Sleep & Recovery</h4>
                <p>Sublingual Kashmiri Saffron drops for deep, restorative REM sleep cycles.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
                <ShieldCheck size={20} color="#CBA243" />
              </div>
              <div className="about-feature-info">
                <h4>Ayush & NABL 3rd-Party Certified</h4>
                <p>100% heavy metal free, zero chemical binders, GMP manufactured in India.</p>
              </div>
            </div>
          </div>

          <div className="about-contact-box">
            <h4>Patron Concierge & Support</h4>
            <p>Email: <strong>concierge@zenvorowellness.com</strong></p>
            <p>Toll-Free: <strong>1800-ZENVORO (936-8676)</strong></p>
            <p>New Delhi 110001, India</p>
          </div>
        </div>

        <div className="about-footer">
          <button className="about-done-btn" onClick={onClose}>
            Back to Wellness Rituals
          </button>
        </div>
      </div>
    </div>
  );
};
