import React from 'react';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Bath,
  SprayCan,
  Brush,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Share2,
  Sparkles,
  ShoppingBag,
  Layers,
  Award,
  Clock,
  Zap,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';

export const AboutPage = ({ onBack, onExploreCatalog }) => {
  const navigate = useNavigate();
  const { showToast } = useCartWishlist();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleExplore = () => {
    if (onExploreCatalog) onExploreCatalog();
    else navigate('/categories');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ASM Shine — Spotless Clean & Powerful Hygiene',
          text: 'Discover ASM Shine: High-performance Toilet Cleaners, Glass Colin Sprays, Bathroom Descalers & Floor Cleansers',
          url: window.location.href
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast('Page link copied to clipboard');
    }
  };

  return (
    <div className="about-page-view">
      {/* 1. Sleek Top Bar */}
      <header className="page-top-header">
        <button
          type="button"
          className="page-back-btn"
          onClick={handleBack}
          aria-label="Back to Home"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="page-header-title-box" onClick={handleBack}>
          <img src="/favicon.svg" alt="ASM SHINE" className="page-mini-logo" />
          <span className="page-header-title">The ASM Shine Standard</span>
        </div>
        <button
          type="button"
          className="page-action-btn"
          onClick={handleShare}
          aria-label="Share page"
        >
          <Share2 size={18} />
        </button>
      </header>

      {/* 2. Hero Card with Cleaning Visual */}
      <section className="about-hero-card">
        <img
          src="/images/banners/hero_banner_photo.png"
          alt="ASM Shine Hygiene Formulations"
          className="about-hero-bg-img"
        />
        <div className="about-hero-gradient" />

        <div className="about-hero-content">
          <div className="about-hero-badge">
            <Crown size={12} color="#E0F2FE" />
            <span>ADVANCED HYGIENE &amp; CLEANING</span>
          </div>

          <img
            src="/favicon.svg"
            alt="ASM SHINE Crest"
            className="about-hero-crest"
          />

          <h1 className="about-hero-heading">ASM SHINE</h1>
          <p className="about-hero-tagline">SPOTLESS CLEAN • SPARKLING SHINE</p>

          <div className="about-hero-meta-strip">
            <span className="about-meta-chip">99.9% Certified Germ Kill</span>
            <span className="about-meta-chip">10X Limescale Cutter</span>
            <span className="about-meta-chip">Zero Harsh Acid Fumes</span>
          </div>
        </div>
      </section>

      {/* 3. The Genesis Story / Manifesto */}
      <section className="about-manifesto-section">
        <span className="about-section-tag">OUR MISSION</span>
        <h2 className="about-manifesto-title">Formulated For Indian Water &amp; Homes</h2>
        <p className="about-manifesto-text">
          Conventional cleaners in India rely on harsh, choking hydrochloric acid or watery detergents that fail against heavy borewell water stains and stubborn kitchen grease. ASM Shine was formulated to redefine hygiene — combining thick vertical-clinging polymers, bio-active descalers, and natural essential oils that eradicate 99.9% of bacteria while leaving surfaces sparkling like mirrors.
        </p>
      </section>

      {/* 4. The 3-Stage Formulation Process */}
      <section className="about-process-section">
        <div className="about-section-header">
          <span className="about-section-tag">SCIENTIFIC PURITY</span>
          <h3 className="about-section-heading">The 3 Pillars of ASM Shine Clean</h3>
        </div>

        <div className="about-steps-grid">
          {/* Step 1 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">1</span>
              <div className="about-step-icon-wrap">
                <ShieldCheck size={16} color="#0284C7" />
              </div>
              <h4 className="about-step-title">10X Limescale Dissolution</h4>
            </div>
            <p className="about-step-desc">
              Organic descaling agents break molecular calcium and yellow mineral deposits in commodes and bathroom tiles in under 5 minutes without eroding grout or chrome faucets.
            </p>
          </div>

          {/* Step 2 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">2</span>
              <div className="about-step-icon-wrap">
                <SprayCan size={16} color="#0284C7" />
              </div>
              <h4 className="about-step-title">Streak-Free Colin Power</h4>
            </div>
            <p className="about-step-desc">
              Anti-static polymer film repels dust and dissolves oily fingerprints instantly, ensuring 100% crystal transparency on mirrors, dining tables, and car windshields.
            </p>
          </div>

          {/* Step 3 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">3</span>
              <div className="about-step-icon-wrap">
                <Sparkles size={16} color="#0284C7" />
              </div>
              <h4 className="about-step-title">99.9% Antimicrobial Shield</h4>
            </div>
            <p className="about-step-desc">
              Hospital-grade disinfection verified by NABL labs, eradicating viruses, bacteria, and mold while releasing fresh ocean and citrus aromatherapy notes.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Comparison Table */}
      <section className="about-compare-section">
        <div className="about-section-header">
          <span className="about-section-tag">THE VERDICT</span>
          <h3 className="about-section-heading">ASM Shine vs Conventional Cleaners</h3>
        </div>

        <div className="about-compare-table">
          <div className="about-compare-header">
            <span>Cleaning Standard</span>
            <span className="th-brand">ASM SHINE</span>
            <span className="th-other">Ordinary Cleaners</span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Hard Water TDS Removal</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 10X Fast Descaling
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Requires hard scrubbing
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Fume Safety</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Zero Choking Fumes
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Pungent acid odor
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Vertical Cling Viscosity</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Thick Active Gel
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Watery runoff
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Mirror &amp; Glass Clarity</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 100% Zero Streaks
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Leaves cloudy film
            </span>
          </div>
        </div>
      </section>

      {/* 6. Concierge & Contact */}
      <section className="about-concierge-section">
        <span className="about-section-tag">CUSTOMER CARE</span>
        <h3 className="about-section-heading">Direct Manufacturer Support</h3>

        <div className="about-concierge-card">
          <div className="about-concierge-row">
            <Phone size={16} color="#0284C7" />
            <div>
              <span className="concierge-lbl">Customer Care Helpline</span>
              <span className="concierge-val">1800-ASM-SHINE (276-744)</span>
            </div>
          </div>

          <a href="mailto:care@asmshine.com" className="about-concierge-row">
            <Mail size={16} color="#0284C7" />
            <div>
              <span className="concierge-lbl">Institutional &amp; Home Supply</span>
              <span className="concierge-val">care@asmshine.com</span>
            </div>
          </a>

          <div className="about-concierge-row">
            <MapPin size={16} color="#0284C7" />
            <div>
              <span className="concierge-lbl">Headquarters &amp; Laboratories</span>
              <span className="concierge-val">ASM Shine Hygiene Labs Pvt Ltd, New Delhi 110001</span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="about-cta-container">
          <button
            type="button"
            className="about-main-cta-btn"
            onClick={handleExplore}
          >
            <ShoppingBag size={15} />
            <span>EXPLORE ALL CLEANING PRODUCTS</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
