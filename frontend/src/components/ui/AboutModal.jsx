import React from 'react';
import { X, Sparkles, ShieldCheck, Zap, Brain, Moon, Award } from 'lucide-react';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="about-modal-backdrop" onClick={onClose}>
      <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="about-modal-header">
          <div className="about-brand-row">
            <img src="/favicon.svg" alt="ASM SHINE Logo" className="about-logo" style={{ borderRadius: '10px' }} />
            <div>
              <h3 className="about-title">About ASM SHINE</h3>
              <p className="about-subtitle">Hygiene &amp; Cleaning Solutions</p>
            </div>
          </div>
          <button className="about-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="about-body">
          <p className="about-intro">
            <strong>ASM SHINE</strong> is India’s premier home and commercial hygiene brand, engineering specialized <strong>power toilet cleaners, Colin-style glass sprays, bathroom descalers, disinfectant floor washes, and dishwash gels</strong> for sparkling spotless spaces.
          </p>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <ShieldCheck size={20} color="#0284C7" />
              </div>
              <div className="about-feature-info">
                <h4>99.9% Certified Germ Kill</h4>
                <p>NABL lab certified bactericidal and antiviral formulations for complete home safety.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Sparkles size={20} color="#0284C7" />
              </div>
              <div className="about-feature-info">
                <h4>Streak-Free Mirror Shine</h4>
                <p>Anti-dust shield technology delivering crystal clarity across glass, mirrors & tiles.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Zap size={20} color="#0284C7" />
              </div>
              <div className="about-feature-info">
                <h4>10X Hard Water Descaling</h4>
                <p>Dissolves stubborn yellow limescale and calcium marks without abrasive scrubbing.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Award size={20} color="#0284C7" />
              </div>
              <div className="about-feature-info">
                <h4>Zero Choking Acid Fumes</h4>
                <p>Gentle on lungs, tiles, and fittings with refreshing ocean and citrus essential oils.</p>
              </div>
            </div>
          </div>

          <div className="about-contact-box">
            <h4>Customer Care &amp; Institutional Supply</h4>
            <p>Email: <strong>care@asmshine.com</strong></p>
            <p>Toll-Free Helpline: <strong>1800-ASM-SHINE (276-744)</strong></p>
            <p>New Delhi 110001, India</p>
          </div>
        </div>

        <div className="about-footer">
          <button className="about-done-btn" onClick={onClose}>
            Back to Cleaning Range
          </button>
        </div>
      </div>
    </div>
  );
};
