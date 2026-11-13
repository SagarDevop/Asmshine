import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  SprayCan,
  Sparkles,
  Bath,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Check,
  X,
  Layers,
  Award,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

// Icon map for dynamic pillars and categories
const ICON_MAP = {
  ShieldCheck,
  SprayCan,
  Sparkles,
  Bath,
  Brush,
  Utensils,
  CookingPot,
  Shirt,
  Droplets,
  Award,
  Layers
};

const DEFAULT_ABOUT = {
  hero: {
    brandName: 'ASM SHINE',
    heading: 'The ASM Shine Standard',
    tagline: 'SPOTLESS CLEAN • SPARKLING SHINE',
    badge: 'ADVANCED HYGIENE & CLEANING',
    image: '/images/banners/hero_banner_photo.png',
    imageAlt: 'ASM Shine Advanced Hygiene Formulations',
    metaChips: ['99.9% Certified Germ Kill', '10X Limescale Cutter', 'Zero Harsh Acid Fumes'],
    isVisible: true
  },
  story: {
    tag: 'OUR STORY & PURPOSE',
    title: 'Formulated For Indian Water & Homes',
    description:
      'Conventional cleaners in India rely on harsh, choking hydrochloric acid or watery detergents that fail against heavy borewell water stains and stubborn kitchen grease. ASM Shine was formulated to redefine hygiene — combining thick vertical-clinging polymers, bio-active descalers, and natural essential oils that eradicate 99.9% of bacteria while leaving surfaces sparkling like mirrors.',
    isVisible: true
  },
  mission: {
    title: 'Our Mission: Safer, Healthier Homes',
    description:
      'To deliver laboratory-grade disinfection without hazardous chemical fumes, ensuring every Indian family enjoys hospital-grade hygiene, sparkling surfaces, and long-lasting freshness.',
    image: '/images/banners/hero_banner_photo.png',
    isVisible: true
  },
  vision: {
    title: 'Our Vision: Sustainable Indian Hygiene',
    description:
      'Pioneering non-corrosive, plumbing-safe cleaning technologies that respect family health, protect domestic plumbing, and deliver instant stain removal across Pan-India homes.',
    image: '',
    isVisible: true
  },
  pillars: [
    {
      step: 1,
      title: '10X Limescale Dissolution',
      description:
        'Organic descaling agents break molecular calcium and yellow mineral deposits in commodes and bathroom tiles in under 5 minutes without eroding grout or chrome faucets.',
      icon: 'ShieldCheck',
      isEnabled: true
    },
    {
      step: 2,
      title: 'Streak-Free Colin Power',
      description:
        'Anti-static polymer film repels dust and dissolves oily fingerprints instantly, ensuring 100% crystal transparency on mirrors, dining tables, and car windshields.',
      icon: 'SprayCan',
      isEnabled: true
    },
    {
      step: 3,
      title: '99.9% Antimicrobial Shield',
      description:
        'Hospital-grade disinfection verified by NABL labs, eradicating viruses, bacteria, and mold while releasing fresh ocean and citrus aromatherapy notes.',
      icon: 'Sparkles',
      isEnabled: true
    }
  ],
  pillarsVisible: true,
  comparison: {
    tag: 'THE VERDICT',
    title: 'ASM Shine vs Conventional Cleaners',
    items: [
      {
        feature: 'Hard Water TDS Removal',
        asmShine: '10X Fast Descaling',
        ordinaryCleaners: 'Requires hard scrubbing'
      },
      {
        feature: 'Fume Safety',
        asmShine: 'Zero Choking Fumes',
        ordinaryCleaners: 'Pungent acid odor'
      },
      {
        feature: 'Vertical Cling Viscosity',
        asmShine: 'Thick Active Gel',
        ordinaryCleaners: 'Watery runoff'
      },
      {
        feature: 'Mirror & Glass Clarity',
        asmShine: '100% Zero Streaks',
        ordinaryCleaners: 'Leaves cloudy film'
      }
    ],
    isVisible: true
  },
  productShowcase: {
    heading: 'Specialized Cleaning Formulations',
    description:
      'Engineered for Indian homes and commercial spaces. Discover targeted solutions for toilets, glass, tiles, kitchens, and floors.',
    isVisible: true
  },
  contact: {
    tag: 'CUSTOMER CARE',
    title: 'Direct Manufacturer Support',
    helpline: '1800-ASM-SHINE (276-744)',
    email: 'care@asmshine.com',
    address: 'ASM Shine Hygiene Labs Pvt Ltd, New Delhi 110001',
    operatingHours: 'Monday – Saturday, 9:00 AM – 6:00 PM IST',
    isVisible: true
  },
  seo: {
    metaTitle: 'About Us — The ASM Shine Standard of Hygiene & Cleanliness',
    metaDescription:
      'Discover how ASM Shine engineers high-performance toilet cleaners, surface sprays, and kitchen degreasers for Indian hard water with zero harsh acid fumes.',
    canonicalUrl: 'https://www.asmshine.com/about'
  }
};

export const AboutPage = ({ onExploreCatalog }) => {
  const navigate = useNavigate();
  const [content, setContent] = useState(DEFAULT_ABOUT);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAboutData = async () => {
      try {
        const res = await api.getAboutContent();
        if (isMounted && res.success && res.data) {
          setContent(res.data);
          if (res.data.categories && res.data.categories.length > 0) {
            setCategories(res.data.categories);
          }
        }
      } catch (err) {
        console.warn('[AboutPage] Live fetch failed, using fallback content:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAboutData();
    return () => {
      isMounted = false;
    };
  }, []);

  // SEO: Update Page Title, Meta Tags & Injected Structured Data
  useEffect(() => {
    const seo = content.seo || DEFAULT_ABOUT.seo;
    document.title = seo.metaTitle || 'About Us — The ASM Shine Standard of Hygiene & Cleanliness';

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      seo.metaDescription ||
      'Discover how ASM Shine engineers high-performance toilet cleaners, surface sprays, and kitchen degreasers for Indian hard water with zero harsh acid fumes.';

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonicalUrl || 'https://www.asmshine.com/about';

    // JSON-LD Structured Data for Organization
    const scriptId = 'asm-shine-org-structured-data';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ASM Shine',
      url: 'https://www.asmshine.com',
      logo: 'https://www.asmshine.com/favicon.svg',
      description: seo.metaDescription,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-1800-276-744',
        contactType: 'Customer Support',
        email: content.contact?.email || 'care@asmshine.com',
        areaServed: 'IN'
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Industrial Area, Phase 1',
        addressLocality: 'New Delhi',
        postalCode: '110001',
        addressCountry: 'IN'
      }
    });

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [content]);

  const handleExplore = () => {
    if (onExploreCatalog) onExploreCatalog();
    else navigate('/categories');
  };

  const hero = content.hero || DEFAULT_ABOUT.hero;
  const story = content.story || DEFAULT_ABOUT.story;
  const mission = content.mission || DEFAULT_ABOUT.mission;
  const vision = content.vision || DEFAULT_ABOUT.vision;
  const pillars = (content.pillars || DEFAULT_ABOUT.pillars).filter((p) => p.isEnabled !== false);
  const comparison = content.comparison || DEFAULT_ABOUT.comparison;
  const productShowcase = content.productShowcase || DEFAULT_ABOUT.productShowcase;
  const contact = content.contact || DEFAULT_ABOUT.contact;

  return (
    <div className="about-us-experience">
      <style>{`
        .about-us-experience {
          background-color: #FFFFFF;
          color: #334155;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .about-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* 1. HERO SECTION */
        .about-hero-block {
          padding: 60px 0 48px 0;
          text-align: center;
          border-bottom: 1px solid #F1F5F9;
        }

        .about-badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .about-main-h1 {
          font-size: 38px;
          line-height: 1.2;
          font-weight: 800;
          color: #172B4D;
          letter-spacing: -0.025em;
          margin: 0 0 12px 0;
        }

        .about-tagline-sub {
          font-size: 15px;
          color: #64748B;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 24px 0;
        }

        .about-chips-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 36px;
        }

        .about-proof-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 6px 14px;
          border-radius: 24px;
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
        }

        .about-hero-img-wrap {
          max-width: 900px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
          background-color: #F8FAFC;
        }

        .about-hero-img-wrap img {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: cover;
          display: block;
        }

        /* 2. STORY / MANIFESTO */
        .about-story-section {
          padding: 64px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .about-section-tag {
          font-size: 12px;
          font-weight: 700;
          color: #2563EB;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .about-story-title {
          font-size: 28px;
          font-weight: 700;
          color: #172B4D;
          letter-spacing: -0.02em;
          margin: 0 0 18px 0;
          line-height: 1.3;
        }

        .about-story-p {
          font-size: 16px;
          line-height: 1.8;
          color: #475569;
          margin: 0;
          max-width: 860px;
        }

        /* 3. MISSION & VISION */
        .about-mv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 40px;
        }

        .about-mv-card {
          padding: 32px 28px;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .about-mv-heading {
          font-size: 19px;
          font-weight: 700;
          color: #172B4D;
          margin: 0;
        }

        .about-mv-desc {
          font-size: 14.5px;
          line-height: 1.7;
          color: #475569;
          margin: 0;
        }

        /* 4. 3 PILLARS */
        .about-pillars-section {
          padding: 64px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .about-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .about-pillar-card {
          padding: 28px 24px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .about-pillar-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .about-pillar-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #EFF6FF;
          color: #1D4ED8;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-pillar-icon {
          color: #2563EB;
        }

        .about-pillar-title {
          font-size: 17px;
          font-weight: 700;
          color: #172B4D;
          margin: 0;
        }

        .about-pillar-desc {
          font-size: 14px;
          line-height: 1.65;
          color: #475569;
          margin: 0;
        }

        /* 5. PRODUCT SHOWCASE */
        .about-products-section {
          padding: 64px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .about-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 32px;
        }

        .about-cat-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .about-cat-card:hover {
          border-color: #2563EB;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
        }

        .about-cat-img {
          width: 100%;
          height: 130px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 12px;
          background-color: #F8FAFC;
        }

        .about-cat-name {
          font-size: 15px;
          font-weight: 700;
          color: #172B4D;
          margin: 0 0 4px 0;
        }

        .about-cat-desc {
          font-size: 12.5px;
          color: #64748B;
          line-height: 1.5;
          margin: 0 0 10px 0;
          flex: 1;
        }

        .about-cat-link-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #2563EB;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* 6. COMPARISON TABLE */
        .about-table-section {
          padding: 64px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .about-table-wrap {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 28px;
          background-color: #FFFFFF;
        }

        .about-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .about-table th {
          background-color: #F8FAFC;
          padding: 14px 20px;
          font-weight: 700;
          text-align: left;
          color: #172B4D;
          border-bottom: 1px solid #E2E8F0;
        }

        .about-table td {
          padding: 14px 20px;
          border-bottom: 1px solid #F1F5F9;
          color: #475569;
        }

        .about-table tr:last-child td {
          border-bottom: none;
        }

        .about-th-highlight {
          color: #1D4ED8 !important;
          background-color: #EFF6FF !important;
        }

        .about-td-highlight {
          background-color: #F8FAFC;
          font-weight: 600;
          color: #15803D !important;
        }

        /* 7. CONTACT & CLOSING SECTION */
        .about-contact-section {
          padding: 64px 0 80px 0;
        }

        .about-contact-card {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .about-contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .about-contact-icon {
          color: #2563EB;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .about-contact-lbl {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          display: block;
        }

        .about-contact-val {
          font-size: 14px;
          font-weight: 600;
          color: #172B4D;
        }

        .about-cta-box {
          text-align: center;
          padding: 24px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
        }

        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #172B4D;
          color: #FFFFFF;
          border: none;
          padding: 14px 26px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .about-cta-btn:hover {
          background-color: #0F172A;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .about-main-h1 {
            font-size: 28px;
          }

          .about-story-title {
            font-size: 23px;
          }

          .about-mv-grid,
          .about-pillars-grid,
          .about-contact-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .about-hero-block,
          .about-story-section,
          .about-pillars-section,
          .about-products-section,
          .about-table-section,
          .about-contact-section {
            padding: 40px 0;
          }

          .about-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      {hero.isVisible !== false && (
        <section className="about-hero-block" aria-label="Brand Overview">
          <div className="about-wrap">
            {hero.badge && (
              <div className="about-badge-chip">
                <ShieldCheck size={14} />
                <span>{hero.badge}</span>
              </div>
            )}

            <h1 className="about-main-h1">{hero.heading}</h1>
            <p className="about-tagline-sub">{hero.tagline}</p>

            {hero.metaChips && hero.metaChips.length > 0 && (
              <div className="about-chips-row">
                {hero.metaChips.map((chip, idx) => (
                  <div key={idx} className="about-proof-chip">
                    <Check size={14} color="#16A34A" />
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            )}

            {hero.image && (
              <div className="about-hero-img-wrap">
                <img
                  src={hero.image}
                  alt={hero.imageAlt || hero.heading}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. THE GENESIS STORY / MANIFESTO */}
      {story.isVisible !== false && (
        <section className="about-story-section" aria-label="Our Story">
          <div className="about-wrap">
            <span className="about-section-tag">{story.tag}</span>
            <h2 className="about-story-title">{story.title}</h2>
            <p className="about-story-p">{story.description}</p>

            {/* Mission & Vision Cards */}
            <div className="about-mv-grid">
              {mission.isVisible !== false && (
                <div className="about-mv-card">
                  <h3 className="about-mv-heading">{mission.title}</h3>
                  <p className="about-mv-desc">{mission.description}</p>
                </div>
              )}

              {vision.isVisible !== false && (
                <div className="about-mv-card">
                  <h3 className="about-mv-heading">{vision.title}</h3>
                  <p className="about-mv-desc">{vision.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. THE 3 SCIENTIFIC PILLARS */}
      {content.pillarsVisible !== false && pillars.length > 0 && (
        <section className="about-pillars-section" aria-label="Why Choose ASM Shine">
          <div className="about-wrap">
            <span className="about-section-tag">SCIENTIFIC PURITY</span>
            <h2 className="about-story-title">The Pillars of ASM Shine Clean</h2>

            <div className="about-pillars-grid">
              {pillars.map((pillar, idx) => {
                const IconComponent = ICON_MAP[pillar.icon] || ShieldCheck;
                return (
                  <div key={idx} className="about-pillar-card">
                    <div className="about-pillar-top">
                      <div className="about-pillar-num">{pillar.step || idx + 1}</div>
                      <IconComponent size={20} className="about-pillar-icon" />
                    </div>
                    <h3 className="about-pillar-title">{pillar.title}</h3>
                    <p className="about-pillar-desc">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. PRODUCT SHOWCASE */}
      {productShowcase.isVisible !== false && categories.length > 0 && (
        <section className="about-products-section" aria-label="Our Cleaning Range">
          <div className="about-wrap">
            <span className="about-section-tag">CATALOGUE RANGE</span>
            <h2 className="about-story-title">{productShowcase.heading}</h2>
            <p className="about-story-p" style={{ fontSize: '15px' }}>
              {productShowcase.description}
            </p>

            <div className="about-cat-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories?category=${cat.id}`}
                  className="about-cat-card"
                >
                  <img
                    src={cat.image || '/images/banners/hero_banner_photo.png'}
                    alt={cat.name}
                    className="about-cat-img"
                    loading="lazy"
                  />
                  <h3 className="about-cat-name">{cat.name}</h3>
                  <p className="about-cat-desc">{cat.desc}</p>
                  <div className="about-cat-link-label">
                    <span>Explore Products</span>
                    <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. COMPARISON TABLE */}
      {comparison.isVisible !== false && comparison.items && comparison.items.length > 0 && (
        <section className="about-table-section" aria-label="Product Comparison">
          <div className="about-wrap">
            <span className="about-section-tag">{comparison.tag}</span>
            <h2 className="about-story-title">{comparison.title}</h2>

            <div className="about-table-wrap">
              <table className="about-table">
                <thead>
                  <tr>
                    <th>Cleaning Parameter</th>
                    <th className="about-th-highlight">ASM SHINE</th>
                    <th>Ordinary Cleaners</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#172B4D' }}>{item.feature}</td>
                      <td className="about-td-highlight">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={14} color="#15803D" strokeWidth={2.5} />
                          <span>{item.asmShine}</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                          <X size={14} color="#DC2626" strokeWidth={2.5} />
                          <span>{item.ordinaryCleaners}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 6. CONCIERGE & CLOSING CONTACT */}
      {contact.isVisible !== false && (
        <section className="about-contact-section" aria-label="Customer Care & Support">
          <div className="about-wrap">
            <div className="about-contact-card">
              <div>
                <span className="about-section-tag">{contact.tag}</span>
                <h2 className="about-story-title" style={{ marginBottom: '14px' }}>
                  {contact.title}
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                  Have questions about formulation purity, bulk institutional supplies, or septic safety? Reach out to our dedicated support laboratory.
                </p>

                <div className="about-contact-info-list">
                  {contact.helpline && (
                    <div className="about-contact-item">
                      <Phone size={18} className="about-contact-icon" />
                      <div>
                        <span className="about-contact-lbl">Helpline Support</span>
                        <span className="about-contact-val">{contact.helpline}</span>
                      </div>
                    </div>
                  )}

                  {contact.email && (
                    <div className="about-contact-item">
                      <Mail size={18} className="about-contact-icon" />
                      <div>
                        <span className="about-contact-lbl">Email Inquiries</span>
                        <a
                          href={`mailto:${contact.email}`}
                          className="about-contact-val"
                          style={{ color: '#2563EB', textDecoration: 'none' }}
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.address && (
                    <div className="about-contact-item">
                      <MapPin size={18} className="about-contact-icon" />
                      <div>
                        <span className="about-contact-lbl">Laboratories &amp; Facility</span>
                        <span className="about-contact-val">{contact.address}</span>
                      </div>
                    </div>
                  )}

                  {contact.operatingHours && (
                    <div className="about-contact-item">
                      <Clock size={18} className="about-contact-icon" />
                      <div>
                        <span className="about-contact-lbl">Business Hours</span>
                        <span className="about-contact-val">{contact.operatingHours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="about-cta-box">
                <ShoppingBag size={32} color="#172B4D" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#172B4D', fontWeight: 700 }}>
                  Ready to experience true clean?
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748B' }}>
                  Explore our bestselling disinfectant toilet gels, streak-free Colin sprays, and concentrated degreasers.
                </p>
                <button
                  type="button"
                  className="about-cta-btn"
                  onClick={handleExplore}
                >
                  <span>Explore All Formulations</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutPage;
