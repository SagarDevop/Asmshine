import React from 'react';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Backpack,
  Briefcase,
  Luggage,
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
  Compass,
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
          title: 'Anchay Bags — Engineered For Modern Journeys',
          text: 'Discover Anchay: Handcrafted Backpacks, Executive Briefcases, Travel Duffels & Totes',
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
          <img src="/images/logo.png" alt="ANCHAY" className="page-mini-logo" />
          <span className="page-header-title">The Anchay Philosophy</span>
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

      {/* 2. Luxury Hero Card with Cinematic Bag Visual */}
      <section className="about-hero-card">
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80"
          alt="Anchay Bags Craftsmanship"
          className="about-hero-bg-img"
        />
        <div className="about-hero-gradient" />

        <div className="about-hero-content">
          <div className="about-hero-badge">
            <Crown size={12} color="#E0F2FE" />
            <span>PREMIUM CARRYWEAR MAISON</span>
          </div>

          <img
            src="/images/logo.png"
            alt="ANCHAY Crest"
            className="about-hero-crest"
          />

          <h1 className="about-hero-heading">ANCHAY</h1>
          <p className="about-hero-tagline">CRAFTED FOR MODERN JOURNEYS</p>

          <div className="about-hero-meta-strip">
            <span className="about-meta-chip">Water-Resistant Weave</span>
            <span className="about-meta-chip">YKK Reverse Hardware</span>
            <span className="about-meta-chip">1-Year Warranty</span>
          </div>
        </div>
      </section>

      {/* 3. The Genesis Story / Manifesto */}
      <section className="about-manifesto-section">
        <span className="about-section-tag">OUR PURPOSE</span>
        <h2 className="about-manifesto-title">Born For Those Who Live In Motion</h2>
        <p className="about-manifesto-text">
          Traditional bags either sacrifice durability for aesthetics or look like bulky outdoor gear in executive boardrooms. Anchay was created to bridge this divide — blending architectural minimalism, ergonomic weight balance, and weather-proof resilience into carrywear designed for the contemporary explorer.
        </p>
      </section>

      {/* 4. The 3-Stage Craftsmanship Process */}
      <section className="about-process-section">
        <div className="about-section-header">
          <span className="about-section-tag">ARTISANAL ENGINEERING</span>
          <h3 className="about-section-heading">The 3 Pillars of Anchay Craftsmanship</h3>
        </div>

        <div className="about-steps-grid">
          {/* Step 1 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">1</span>
              <div className="about-step-icon-wrap">
                <Compass size={16} color="#1C8E8F" />
              </div>
              <h4 className="about-step-title">Ergonomic Weight Modeling</h4>
            </div>
            <p className="about-step-desc">
              Every strap, harness, and back panel is modeled using spinal pressure mapping to disperse heavy laptop and travel loads evenly across the core.
            </p>
          </div>

          {/* Step 2 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">2</span>
              <div className="about-step-icon-wrap">
                <ShieldCheck size={16} color="#1C8E8F" />
              </div>
              <h4 className="about-step-title">All-Weather Material Lab</h4>
            </div>
            <p className="about-step-desc">
              Constructed with 900D ballistic weaves, water-repellent TPU laminates, and top-grain vegan leathers tested against monsoons, abrasions, and daily friction.
            </p>
          </div>

          {/* Step 3 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">3</span>
              <div className="about-step-icon-wrap">
                <Award size={16} color="#1C8E8F" />
              </div>
              <h4 className="about-step-title">Stress-Tested YKK Hardware</h4>
            </div>
            <p className="about-step-desc">
              Reinforced box-and-cross bar-tack stitching and Japanese YKK smooth-glide zippers tested to endure over 15,000 open-close cycles and 25kg weight strains.
            </p>
          </div>
        </div>
      </section>

      {/* 5. The Carrying Archetypes */}
      <section className="about-circadian-section">
        <div className="about-section-header">
          <span className="about-section-tag">BUILT FOR EVERY TRANSIT</span>
          <h3 className="about-section-heading">How Anchay Powers Your Daily Routine</h3>
          <p className="about-section-sub">
            From the morning metro commute to cross-country weekend flights, our bags are tailored to your lifestyle.
          </p>
        </div>

        <div className="about-timeline-list">
          {/* Tech Commute */}
          <div className="about-time-block morning">
            <div className="about-time-indicator">
              <span className="about-time-badge">WORK & TECH</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/bag_1')}>
              <div className="about-time-header">
                <Backpack size={15} color="#1C8E8F" />
                <span className="about-time-phase">DAILY COMMUTE</span>
              </div>
              <h4 className="about-time-title">Apex Urban Pro 28L Backpack</h4>
              <p className="about-time-detail">
                Dedicated 15.6" laptop cradle, anti-theft secret passport pocket, and ventilated 3D air-mesh lumbar support for effortless city navigation.
              </p>
              <div className="about-time-instruction">
                <span>Explore Tech Backpacks</span>
              </div>
            </div>
          </div>

          {/* Executive Work */}
          <div className="about-time-block day">
            <div className="about-time-indicator">
              <span className="about-time-badge">EXECUTIVE</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/bag_7')}>
              <div className="about-time-header">
                <Briefcase size={15} color="#1C8E8F" />
                <span className="about-time-phase">BOARDROOM READINESS</span>
              </div>
              <h4 className="about-time-title">Oxford Executive Leather Briefcase</h4>
              <p className="about-time-detail">
                Full-grain textured vegan leather with dual tech dividers, luggage trolley strap, and antique brass alloy hardware.
              </p>
              <div className="about-time-instruction">
                <span>Explore Executive Briefcases</span>
              </div>
            </div>
          </div>

          {/* Travel & Weekend */}
          <div className="about-time-block night">
            <div className="about-time-indicator">
              <span className="about-time-badge">TRAVEL</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/bag_12')}>
              <div className="about-time-header">
                <Luggage size={15} color="#1C8E8F" />
                <span className="about-time-phase">WEEKENDER ESCAPES</span>
              </div>
              <h4 className="about-time-title">Nomad Weekender 45L Duffel</h4>
              <p className="about-time-detail">
                Airline overhead cabin approved with independent ventilated shoe tunnel and separate waterproof wet kit pocket.
              </p>
              <div className="about-time-instruction">
                <span>Explore Travel Duffels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Flagship Highlights */}
      <section className="about-rituals-section">
        <div className="about-section-header">
          <span className="about-section-tag">FLAGSHIP CREATIONS</span>
          <h3 className="about-section-heading">Touch To Explore Featured Styles</h3>
        </div>

        <div className="about-ritual-cards-list">
          {/* Bag 1 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/bag_1')}
          >
            <div className="about-ritual-media">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
                alt="Apex Urban Pro 28L"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Backpack size={12} color="#1C8E8F" />
                <span>BACKPACK • 28L</span>
              </div>
              <h4 className="about-ritual-name">Apex Urban Pro 28L</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">15.6" Laptop</span>
                <span className="about-compound-tag">Waterproof</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Bag 7 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/bag_7')}
          >
            <div className="about-ritual-media">
              <img
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80"
                alt="Oxford Executive Briefcase"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Briefcase size={12} color="#1C8E8F" />
                <span>BRIEFCASE • 15.6"</span>
              </div>
              <h4 className="about-ritual-name">Oxford Leather Briefcase</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">Full-Grain Leather</span>
                <span className="about-compound-tag">Brass Sliders</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Bag 12 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/bag_12')}
          >
            <div className="about-ritual-media">
              <img
                src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"
                alt="Nomad Weekender 45L"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Luggage size={12} color="#1C8E8F" />
                <span>DUFFEL • 45L</span>
              </div>
              <h4 className="about-ritual-name">Nomad Weekender 45L</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">Shoe Tunnel</span>
                <span className="about-compound-tag">Cabin Approved</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Anchay vs Generic Market Bags Comparison Table */}
      <section className="about-comparison-section">
        <div className="about-section-header">
          <span className="about-section-tag">QUALITY BENCHMARK</span>
          <h3 className="about-section-heading">Why Anchay Sets The Gold Standard</h3>
        </div>

        <div className="about-compare-table">
          <div className="about-compare-head">
            <span className="compare-col-feature">Feature</span>
            <span className="compare-col-brand">ANCHAY</span>
            <span className="compare-col-other">Generic Bags</span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Exterior Weave</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 900D Ballistic Poly
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Flimsy 200D fabric
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Zipper Sliders</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Japanese YKK Zips
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Jamming unbranded zips
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Laptop Protection</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Suspended EVA Foam
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Thin sponge padding
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Water Resistance</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> IPX4 Weatherproof
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Soaks in light drizzle
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Craftsmanship Warranty</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 1-Year Guarantee
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> No warranty support
            </span>
          </div>
        </div>
      </section>

      {/* 8. Patron Concierge & Contact */}
      <section className="about-concierge-section">
        <span className="about-section-tag">CUSTOMER CONCIERGE</span>
        <h3 className="about-section-heading">Dedicated Carrywear Support</h3>

        <div className="about-concierge-card">
          <div className="about-concierge-row">
            <Phone size={16} color="#1C8E8F" />
            <div>
              <span className="concierge-lbl">Customer Support Hotline</span>
              <span className="concierge-val">1800-ANCHAY-BAGS (262-429)</span>
            </div>
          </div>

          <a href="mailto:support@anchaybags.com" className="about-concierge-row">
            <Mail size={16} color="#1C8E8F" />
            <div>
              <span className="concierge-lbl">Customer Concierge Email</span>
              <span className="concierge-val">concierge@anchaybags.com</span>
            </div>
          </a>

          <div className="about-concierge-row">
            <MapPin size={16} color="#1C8E8F" />
            <div>
              <span className="concierge-lbl">Design Studio & HQ</span>
              <span className="concierge-val">Anchay Carrywear Studio, Connaught Place, New Delhi 110001</span>
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
            <span>EXPLORE ALL 28 BAGS</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
};
export default AboutPage;
