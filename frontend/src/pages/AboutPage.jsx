import React from 'react';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Flame,
  Brain,
  Moon,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Share2,
  Sparkles,
  ShoppingBag,
  Sun,
  Mountain,
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
          <img src="/images/logo.png" alt="ZENVORO" className="page-mini-logo" />
          <span className="page-header-title">The ZENVORO Philosophy</span>
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

      {/* 2. Luxury Hero Card with Cinematic Himalayan Backdrop */}
      <section className="about-hero-card">
        <img
          src="/images/banners/zenvoro_banner_shilajit.jpg"
          alt="Himalayan Sourcing"
          className="about-hero-bg-img"
        />
        <div className="about-hero-gradient" />

        <div className="about-hero-content">
          <div className="about-hero-badge">
            <Crown size={12} color="#E5C383" />
            <span>AYURVEDIC LUXURY MAISON</span>
          </div>

          <img
            src="/images/logo.png"
            alt="ZENVORO Crest"
            className="about-hero-crest"
          />

          <h1 className="about-hero-heading">ZENVORO</h1>
          <p className="about-hero-tagline">ELEVATE YOUR INNER POWER</p>

          <div className="about-hero-meta-strip">
            <span className="about-meta-chip">18,000+ Ft Sourcing</span>
            <span className="about-meta-chip">24K Gold Grade</span>
            <span className="about-meta-chip">NABL Lab Tested</span>
          </div>
        </div>
      </section>

      {/* 3. The Genesis Story / Manifesto */}
      <section className="about-manifesto-section">
        <span className="about-section-tag">THE SACRED GENESIS</span>
        <h2 className="about-manifesto-title">Born For Those Who Refuse Half-Capacity</h2>
        <p className="about-manifesto-text">
          Modern living drains human vitality through synthetic stimulants, mental exhaustion, and disrupted sleep cycles. ZENVORO was created to restore human biological potential — uniting authentic 5,000-year-old Vedic Rasashastra with modern clinical neurobiology.
        </p>
      </section>

      {/* 4. The Himalayan Sourcing Journey (3-Step Visual Process) */}
      <section className="about-process-section">
        <div className="about-section-header">
          <span className="about-section-tag">AUTHENTIC ALCHEMY</span>
          <h3 className="about-section-heading">The 3-Stage Sacred Sourcing Journey</h3>
        </div>

        <div className="about-steps-grid">
          {/* Step 1 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">1</span>
              <div className="about-step-icon-wrap">
                <Mountain size={16} color="#85532F" />
              </div>
              <h4 className="about-step-title">18,000+ Ft Wildcrafting</h4>
            </div>
            <p className="about-step-desc">
              Hand-harvested by indigenous mountain sherpas from high-altitude rock fissures where extreme pressure and pristine cold yield the purest mineral resin.
            </p>
          </div>

          {/* Step 2 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">2</span>
              <div className="about-step-icon-wrap">
                <Sun size={16} color="#CBA243" />
              </div>
              <h4 className="about-step-title">90-Day Surya Tapi</h4>
            </div>
            <p className="about-step-desc">
              Purified using ancient slow sun-drying in natural Himalayan spring water. Never boiled or chemical-extracted, preserving 84+ ionic trace minerals and &gt;80% fulvic acid.
            </p>
          </div>

          {/* Step 3 */}
          <div className="about-step-card">
            <div className="about-step-top">
              <span className="about-step-num-circle">3</span>
              <div className="about-step-icon-wrap">
                <Sparkles size={16} color="#CBA243" />
              </div>
              <h4 className="about-step-title">24K Gold Swarna Bhasma</h4>
            </div>
            <p className="about-step-desc">
              Infused with nano-purified 24K edible Gold Bhasma processed according to classical Rasashastra texts to enhance cellular absorption and deep rejuvenation.
            </p>
          </div>
        </div>
      </section>

      {/* 5. The 24-Hour Circadian Biological Flow (Interactive Visual Timeline) */}
      <section className="about-circadian-section">
        <div className="about-section-header">
          <span className="about-section-tag">24-HOUR BIO-HARMONY</span>
          <h3 className="about-section-heading">How The 3 Rituals Elevate Your Entire Day</h3>
          <p className="about-section-sub">
            Engineered as a synergistic 24-hour cycle to harmonize physical power, cognitive focus, and cellular repair.
          </p>
        </div>

        <div className="about-timeline-list">
          {/* Morning Power */}
          <div className="about-time-block morning">
            <div className="about-time-indicator">
              <span className="about-time-badge">07:00 AM</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/prod_1')}>
              <div className="about-time-header">
                <Flame size={15} color="#85532F" />
                <span className="about-time-phase">MORNING IGNITION</span>
              </div>
              <h4 className="about-time-title">Ritual I: Himalayan Shilajit Gold</h4>
              <p className="about-time-detail">
                Supercharges mitochondrial ATP energy, fuels natural stamina, and optimizes hormonal vigor without caffeine jitters.
              </p>
              <div className="about-time-instruction">
                <span>Pea-sized resin in warm water or milk</span>
              </div>
            </div>
          </div>

          {/* Afternoon Focus */}
          <div className="about-time-block day">
            <div className="about-time-indicator">
              <span className="about-time-badge">01:00 PM</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/prod_2')}>
              <div className="about-time-header">
                <Brain size={15} color="#85532F" />
                <span className="about-time-phase">MID-DAY CLARITY</span>
              </div>
              <h4 className="about-time-title">Ritual II: Nootropic Mind &amp; Focus</h4>
              <p className="about-time-detail">
                Full-spectrum Lion’s Mane and organic Brahmi trigger alpha brainwaves, eliminating afternoon brain fog and powering creative flow.
              </p>
              <div className="about-time-instruction">
                <span>2 capsules after lunch with water</span>
              </div>
            </div>
          </div>

          {/* Night Restoration */}
          <div className="about-time-block night">
            <div className="about-time-indicator">
              <span className="about-time-badge">10:00 PM</span>
              <div className="about-time-dot" />
            </div>
            <div className="about-time-card" onClick={() => navigate('/product/prod_3')}>
              <div className="about-time-header">
                <Moon size={15} color="#85532F" />
                <span className="about-time-phase">NIGHT RESTORATION</span>
              </div>
              <h4 className="about-time-title">Ritual III: Cellular Recovery Elixir</h4>
              <p className="about-time-detail">
                Kashmiri Saffron and bioavailable magnesium calm neurotransmitters, triggering restorative REM sleep and cellular repair.
              </p>
              <div className="about-time-instruction">
                <span>1 full dropper under tongue before sleep</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The 3 Sacred Rituals Product Cards */}
      <section className="about-rituals-section">
        <div className="about-section-header">
          <span className="about-section-tag">THE FLAGSHIP FORMULATIONS</span>
          <h3 className="about-section-heading">Touch To Explore Each Sacred Ritual</h3>
        </div>

        <div className="about-ritual-cards-list">
          {/* Product 1 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/prod_1')}
          >
            <div className="about-ritual-media">
              <img
                src="/images/products/zenvoro_shilajit_gold.png"
                alt="Shilajit Gold Resin"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Flame size={12} color="#85532F" />
                <span>RITUAL I • RESIN</span>
              </div>
              <h4 className="about-ritual-name">Himalayan Shilajit Gold</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">&gt;80% Fulvic Acid</span>
                <span className="about-compound-tag">24K Gold</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Product 2 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/prod_2')}
          >
            <div className="about-ritual-media">
              <img
                src="/images/products/zenvoro_nootropic_focus.png"
                alt="Nootropic Mind & Focus"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Brain size={12} color="#85532F" />
                <span>RITUAL II • CAPSULES</span>
              </div>
              <h4 className="about-ritual-name">Nootropic Mind &amp; Focus</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">Lion’s Mane</span>
                <span className="about-compound-tag">Brahmi 50%</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Product 3 */}
          <div
            className="about-ritual-card"
            onClick={() => navigate('/product/prod_3')}
          >
            <div className="about-ritual-media">
              <img
                src="/images/products/zenvoro_recovery_elixir.png"
                alt="Cellular Recovery Elixir"
                className="about-ritual-img"
              />
            </div>
            <div className="about-ritual-info">
              <div className="about-ritual-tag">
                <Moon size={12} color="#85532F" />
                <span>RITUAL III • ELIXIR</span>
              </div>
              <h4 className="about-ritual-name">Cellular Recovery Elixir</h4>
              <div className="about-compounds-row">
                <span className="about-compound-tag">Kashmiri Saffron</span>
                <span className="about-compound-tag">Magnesium Glycinate</span>
              </div>
              <div className="about-ritual-footer">
                <span className="about-ritual-link">View Details</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ZENVORO vs Conventional Standard (Visual Trust Comparison Table) */}
      <section className="about-comparison-section">
        <div className="about-section-header">
          <span className="about-section-tag">PURITY BENCHMARK</span>
          <h3 className="about-section-heading">Why ZENVORO Sets The Gold Standard</h3>
        </div>

        <div className="about-compare-table">
          <div className="about-compare-head">
            <span className="compare-col-feature">Metric</span>
            <span className="compare-col-brand">ZENVORO</span>
            <span className="compare-col-other">Ordinary Brands</span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Harvest Altitude</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Above 18,000 Ft
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Low commercial hills
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Purification</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 90-Day Sun Surya Tapi
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> High-heat boiling
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Precious Gold</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> 24K Swarna Bhasma
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Zero gold added
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Heavy Metal Tests</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> NABL 3rd-Party Lab
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Often untested
            </span>
          </div>

          <div className="about-compare-row">
            <span className="compare-col-feature">Dependency Risk</span>
            <span className="compare-col-brand">
              <Check size={13} color="#15803D" /> Non-habit forming
            </span>
            <span className="compare-col-other">
              <X size={13} color="#DC2626" /> Synthetic caffeine
            </span>
          </div>
        </div>
      </section>

      {/* 8. Laboratory Science & Purity Credentials */}
      <section className="about-purity-section">
        <span className="about-section-tag">UNCOMPROMISING STANDARDS</span>
        <h3 className="about-section-heading">Verified By Modern Laboratory Science</h3>

        <div className="about-purity-grid">
          <div className="about-purity-item">
            <ShieldCheck size={20} color="#85532F" />
            <div>
              <strong>NABL 3rd-Party Certified</strong>
              <p>Every single batch tested for zero heavy metals, zero lead, and &gt;80% active fulvic acid.</p>
            </div>
          </div>

          <div className="about-purity-item">
            <Sparkles size={20} color="#CBA243" />
            <div>
              <strong>24K Swarna Bhasma Infused</strong>
              <p>Authentic Ayurvedic nano-purified gold prepared according to classical Rasashastra texts.</p>
            </div>
          </div>

          <div className="about-purity-item">
            <CheckCircle2 size={20} color="#85532F" />
            <div>
              <strong>100% Ethical &amp; Non-Habit Forming</strong>
              <p>Zero artificial binders, zero synthetic caffeine, zero habit-forming sleep sedatives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Patron Concierge & Contact */}
      <section className="about-concierge-section">
        <span className="about-section-tag">PATRON CONCIERGE</span>
        <h3 className="about-section-heading">Dedicated Wellness Concierge</h3>

        <div className="about-concierge-card">
          <div className="about-concierge-row">
            <Phone size={16} color="#85532F" />
            <div>
              <span className="concierge-lbl">Toll-Free Wellness Hotline</span>
              <span className="concierge-val">1800-ZENVORO (936-8676)</span>
            </div>
          </div>

          <a href="mailto:concierge@zenvorowellness.com" className="about-concierge-row">
            <Mail size={16} color="#85532F" />
            <div>
              <span className="concierge-lbl">Patron Concierge Email</span>
              <span className="concierge-val">concierge@zenvorowellness.com</span>
            </div>
          </a>

          <div className="about-concierge-row">
            <MapPin size={16} color="#85532F" />
            <div>
              <span className="concierge-lbl">Maison Headquarters</span>
              <span className="concierge-val">Zenvoro Wellness Maison, Connaught Place, New Delhi 110001</span>
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
            <span>EXPLORE THE 3 RITUALS</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
};
