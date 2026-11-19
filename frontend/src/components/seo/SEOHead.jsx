import { useEffect } from 'react';

const SITE_URL = 'https://www.asmshine.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/banners/hero_banner_photo.png`;

/**
 * Helper to update or create a <meta> tag
 */
function setMetaTag(attrName, attrValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a <link> tag
 */
function setLinkTag(rel, href) {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * SEOHead: Dynamic Client-Side Document Head Manager
 * Updates page title, meta description, canonical link, Open Graph,
 * Twitter card tags, and Schema.org JSON-LD structured data.
 */
export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  structuredData = null
}) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title
      ? (title.includes('ASM Shine') ? title : `${title} | ASM Shine`)
      : 'ASM Shine — Sparkling Clean & Powerful Hygiene | Official Store';
    document.title = formattedTitle;

    // 2. Meta Description
    const formattedDesc = description ||
      "ASM Shine: India's premier home hygiene brand. High-performance toilet cleaners, Colin-style glass sprays, bathroom descalers, floor disinfectants, and dishwash gels.";
    setMetaTag('name', 'description', formattedDesc);

    // 3. Robots
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 4. Canonical URL
    const canonicalHref = canonical
      ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
      : `${SITE_URL}${window.location.pathname}`;
    setLinkTag('canonical', canonicalHref);

    // 5. Open Graph Meta Tags
    setMetaTag('property', 'og:site_name', 'ASM Shine');
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', formattedDesc);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalHref);

    const absoluteImage = ogImage
      ? (ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`)
      : DEFAULT_IMAGE;
    setMetaTag('property', 'og:image', absoluteImage);
    setMetaTag('property', 'og:image:alt', formattedTitle);

    // 6. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', formattedDesc);
    setMetaTag('name', 'twitter:image', absoluteImage);

    // 7. Schema.org JSON-LD Structured Data
    const scriptId = 'asm-structured-data';
    let scriptTag = document.getElementById(scriptId);

    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup on unmount
    };
  }, [title, description, canonical, ogImage, ogType, noindex, structuredData]);

  return null;
}

export default SEOHead;
