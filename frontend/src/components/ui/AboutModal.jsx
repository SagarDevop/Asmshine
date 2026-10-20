import React from 'react';
import { X, Sparkles, ShieldCheck, Zap, Brain, Moon, Award } from 'lucide-react';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="about-modal-backdrop" onClick={onClose}>
      <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="about-modal-header">
          <div className="about-brand-row">
            <img src="/images/logo.png" alt="ANCHAY Logo" className="about-logo" style={{ borderRadius: '50%' }} />
            <div>
              <h3 className="about-title">About ANCHAY</h3>
              <p className="about-subtitle">Premium Bags & Carrywear</p>
            </div>
          </div>
          <button className="about-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="about-body">
          <p className="about-intro">
            <strong>ANCHAY</strong> is India’s foremost modern carrywear maison, crafting premium <strong>backpacks, totes, travel duffels, and everyday carry essentials</strong> for the modern lifestyle.
          </p>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#EBF8F8', color: '#1C8E8F' }}>
                <Zap size={20} color="#1C8E8F" />
              </div>
              <div className="about-feature-info">
                <h4>Ergonomic Weight Balance</h4>
                <p>Designed for comfort with pressure-relieving air-mesh straps and reinforced balance.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#EBF8F8', color: '#1C8E8F' }}>
                <Brain size={20} color="#1C8E8F" />
              </div>
              <div className="about-feature-info">
                <h4>Smart Modular Storage</h4>
                <p>Padded laptop sleeves, quick-access pockets, and organized everyday compartments.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#EBF8F8', color: '#1C8E8F' }}>
                <Moon size={20} color="#1C8E8F" />
              </div>
              <div className="about-feature-info">
                <h4>Weather-Resistant Fabric</h4>
                <p>Water-repellent durable outer weave engineered to withstand urban commutes & travel.</p>
              </div>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon" style={{ background: '#EBF8F8', color: '#1C8E8F' }}>
                <ShieldCheck size={20} color="#1C8E8F" />
              </div>
              <div className="about-feature-info">
                <h4>Rigorous Quality Assurance</h4>
                <p>Reinforced stitching, Japanese YKK zippers, and 1-year craftsmanship warranty.</p>
              </div>
            </div>
          </div>

          <div className="about-contact-box">
            <h4>Customer Concierge & Support</h4>
            <p>Email: <strong>concierge@anchaybags.com</strong></p>
            <p>Toll-Free: <strong>1800-ANCHAY-BAGS (262-429)</strong></p>
            <p>New Delhi 110001, India</p>
          </div>
        </div>

        <div className="about-footer">
          <button className="about-done-btn" onClick={onClose}>
            Back to Bag Collection
          </button>
        </div>
      </div>
    </div>
  );
};
