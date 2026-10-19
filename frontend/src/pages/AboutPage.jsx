import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Brain,
  Moon,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Share2
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
    else navigate('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZENVORO — Elevate Your Inner Power',
          text: 'Discover ZENVORO: Pure Himalayan Shilajit Gold, Nootropic Focus & Cellular Elixirs',
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
      {/* 1. Top Bar */}
      <header className="page-top-header">
        <button
          type="button"
          className="page-back-btn"
          onClick={handleBack}
          aria-label="Back to Home"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="page-header-title-box" onClick={handleBack}>
          <img src="/images/logo.png" alt="ZENVORO" className="page-mini-logo" style={{ borderRadius: '50%' }} />
          <span className="page-header-title">The ZENVORO Philosophy</span>
        </div>
        <button
          type="button"
          className="page-action-btn"
          onClick={handleShare}
          aria-label="Share page"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* 2. Hero Brand Section */}
      <section className="about-hero-card">
        <div className="about-hero-badge">
          <Sparkles size={13} fill="#CBA243" color="#CBA243" />
          <span>OUR SACRED GENESIS</span>
        </div>
        <img
          src="/images/logo.png"
          alt="ZENVORO Logo"
          className="about-hero-logo"
          style={{ width: '84px', height: '84px', borderRadius: '50%', border: '2px solid #CBA243', objectFit: 'cover' }}
        />
        <h1 className="about-hero-heading">ZENVORO</h1>
        <p className="about-hero-tagline">
          ELEVATE YOUR INNER POWER
        </p>
        <div className="about-hero-meta">
          <span>Upper Himalayan Sourcing (18,000+ Ft)</span>
          <span className="about-meta-dot">•</span>
          <span>Made in India 🇮🇳</span>
          <span className="about-meta-dot">•</span>
          <span>Ayush & GMP Certified</span>
        </div>
      </section>

      {/* 3. The 3 Pillars */}
      <section className="about-section">
        <div className="about-section-tag">THE 3 ELEVATION PILLARS</div>
        <h2 className="about-section-title">Where Ancient Alchemy Meets Modern Neurobiology</h2>
        <p className="about-narrative">
          <strong>ZENVORO</strong> was created for those who refuse to live at half-capacity. We believe boundless physical stamina, razor-sharp mental focus, and restorative sleep are not privileges — they are your biological birthright.
        </p>

        <div className="about-features-grid">
          <div className="about-feature-card">
            <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
              <Zap size={22} color="#CBA243" />
            </div>
            <h3>Pillar I: Physical Inner Power</h3>
            <p>
              100% Pure Himalayan Shilajit harvested above 18,000 ft, infused with 24K Swarna Bhasma (Gold) and 80%+ certified Fulvic Acid to supercharge cellular ATP energy and hormonal vigor.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
              <Brain size={22} color="#CBA243" />
            </div>
            <h3>Pillar II: Cognitive Zenith</h3>
            <p>
              Full-spectrum Lion’s Mane mushroom and organic Brahmi (50% Bacosides) to stimulate Neuro-Growth Factor (NGF), banishing brain fog and powering sustained creative focus.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon" style={{ background: '#FBF4E4', color: '#85532F' }}>
              <Moon size={22} color="#CBA243" />
            </div>
            <h3>Pillar III: Cellular Restoration</h3>
            <p>
              Sublingual elixir drops featuring Kashmiri Saffron and Magnesium Glycinate that calm neurotransmitters, triggering restorative REM sleep and nighttime cellular repair.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Quality Assurances */}
      <section className="about-section certs-section">
        <div className="about-section-tag">UNCOMPROMISING PURITY</div>
        <h2 className="about-section-title">Verified by Science & Tradition</h2>

        <div className="about-certs-list">
          <div className="about-cert-item">
            <CheckCircle2 size={18} color="#CBA243" />
            <div>
              <strong>NABL 3rd-Party Lab Verified</strong>
              <p>Every single batch is tested for purity, potency, and zero traces of Lead, Mercury, Arsenic or Cadmium.</p>
            </div>
          </div>

          <div className="about-cert-item">
            <CheckCircle2 size={18} color="#CBA243" />
            <div>
              <strong>100% Plant & Ayurvedic Origins</strong>
              <p>Zero synthetic caffeine, zero habit-forming sedatives, zero artificial binders or chemical fillers.</p>
            </div>
          </div>

          <div className="about-cert-item">
            <CheckCircle2 size={18} color="#CBA243" />
            <div>
              <strong>Ethical High-Altitude Harvesting</strong>
              <p>Hand-collected by indigenous mountain sherpas preserving the pristine ecosystem of the upper Himalayas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Concierge & Contact */}
      <section className="about-section contact-section">
        <div className="about-section-tag">PATRON CONCIERGE</div>
        <h2 className="about-section-title">We Are Here For Your Journey</h2>

        <div className="about-contact-card">
          <div className="about-contact-row">
            <Phone size={18} color="#CBA243" />
            <div>
              <span className="contact-label">Toll-Free Wellness Hotline</span>
              <span className="contact-value">1800-ZENVORO (936-8676)</span>
            </div>
          </div>

          <a href="mailto:concierge@zenvorowellness.com" className="about-contact-row">
            <Mail size={18} color="#CBA243" />
            <div>
              <span className="contact-label">Patron Concierge Email</span>
              <span className="contact-value">concierge@zenvorowellness.com</span>
            </div>
          </a>

          <div className="about-contact-row">
            <MapPin size={18} color="#CBA243" />
            <div>
              <span className="contact-label">Maison Headquarters</span>
              <span className="contact-value">Zenvoro Wellness Maison, Barakhamba Road, Connaught Place, New Delhi 110001</span>
            </div>
          </div>
        </div>

        <div className="about-cta-box">
          <button
            type="button"
            className="about-explore-btn"
            onClick={handleExplore}
          >
            <span>SHOP THE 3 SACRED RITUALS</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
