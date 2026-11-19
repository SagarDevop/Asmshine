/**
 * ASM Shine - Production SEO & Structured Data (Schema.org) Helpers
 */

export const SITE_URL = 'https://www.asmshine.com';

/**
 * Generates an absolute HTTPS URL for any image or asset path
 */
export function getAbsoluteImageUrl(imagePath) {
  if (!imagePath) return `${SITE_URL}/images/banners/hero_banner_photo.png`;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${SITE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

/**
 * Builds Schema.org Organization structured data
 */
export function buildOrganizationSchema(customSettings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${SITE_URL}/#organization`,
    name: 'ASM Shine',
    legalName: 'ASM Shine Private Limited',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/banners/hero_banner_photo.png`,
    description: "India's premier home hygiene brand. High-performance toilet cleaners, Colin-style glass sprays, bathroom descalers, floor disinfectants, and dishwash gels.",
    telephone: customSettings.supportPhone || '+91 8901 271 271',
    email: customSettings.supportEmail || 'support@asmshine.com',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: customSettings.businessAddress?.street || 'Shop No. 11, Paras Enclave',
      addressLocality: customSettings.businessAddress?.city || 'Kurukshetra',
      addressRegion: customSettings.businessAddress?.state || 'Haryana',
      postalCode: customSettings.businessAddress?.pincode || '136118',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: customSettings.supportPhone || '+91 8901 271 271',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi']
    }
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data
 */
export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`
    }))
  };
}

/**
 * Builds Schema.org Product structured data
 */
export function buildProductSchema(product, selectedVariant = null) {
  if (!product) return null;

  const currentPrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const isAvailable = selectedVariant
    ? (selectedVariant.inStock !== false && (selectedVariant.stockQuantity ?? 1) > 0)
    : (product.inStock !== false && (product.availableStock ?? product.stockQuantity ?? 1) > 0);

  const images = [];
  if (selectedVariant?.image) images.push(getAbsoluteImageUrl(selectedVariant.image));
  if (product.image) images.push(getAbsoluteImageUrl(product.image));
  if (Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img) images.push(getAbsoluteImageUrl(img));
    });
  }
  const uniqueImages = Array.from(new Set(images)).slice(0, 5);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/product/${product.id}#product`,
    name: product.name,
    description: (product.description || '').replace(/\s+/g, ' ').trim() || `${product.name} by ASM Shine. Hospital-grade cleanliness and powerful hygiene.`,
    image: uniqueImages.length > 0 ? uniqueImages : [`${SITE_URL}/images/logo.png`],
    sku: selectedVariant?.sku || product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'ASM SHINE'
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      '@id': `${SITE_URL}/product/${product.id}#offer`,
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: currentPrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ASM Shine',
        url: SITE_URL
      }
    }
  };

  // Include AggregateRating ONLY if genuine ratings exist
  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const total = product.reviews.length;
    const sum = product.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = Number((sum / total).toFixed(1));

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: total,
      bestRating: '5',
      worstRating: '1'
    };

    schema.review = product.reviews.slice(0, 5).map((r, idx) => ({
      '@type': 'Review',
      '@id': `${SITE_URL}/product/${product.id}#review-${idx + 1}`,
      author: {
        '@type': 'Person',
        name: r.author || 'Verified Buyer'
      },
      datePublished: r.date && r.date !== 'Today' ? r.date : new Date().toISOString().split('T')[0],
      reviewBody: r.comment || r.title || 'Verified experience',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(r.rating) || 5,
        bestRating: '5',
        worstRating: '1'
      }
    }));
  }

  return schema;
}

