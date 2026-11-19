/**
 * ASM Shine - Static Pre-rendering & SEO Engine
 * Generates crawlable HTML snapshots with custom meta tags, canonical links,
 * Open Graph, Twitter cards, and Schema.org JSON-LD for every route.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.asmshine.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

// Fallback product list matching active catalog in production
const FALLBACK_PRODUCTS = [
  {
    id: 'asm_glass_1',
    name: 'ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free)',
    category: 'glass_care',
    price: 80,
    originalPrice: 199,
    size: '500 ml Trigger Spray',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/glass_cleaner_front.png',
    description: 'Specialized optical-clarity glass cleaner formulated to dissolve oily finger marks, water haze, kitchen smoke film, and dust.'
  },
  {
    id: 'asm_bath_1',
    name: 'ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner',
    category: 'bathroom_surfaces',
    price: 120,
    originalPrice: 199,
    size: '1 Liter',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/bathroom_cleaner_front.png',
    description: 'Fast-acting bathroom tile and grout cleaner formulated specifically to dissolve stubborn borewell hard-water yellow scales.'
  },
  {
    id: 'asm_floor_1',
    name: 'ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant',
    category: 'floor_care',
    price: 100,
    originalPrice: 210,
    size: '1 Liters Economy Family Pack',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/floor_cleaner_front.png',
    description: 'Hospital-grade triple-action surface sanitizer that eradicates 99.9% of bacteria, viruses, and pathogens while infusing your home with fresh lemon scent.'
  },
  {
    id: 'asm_kitchen_1',
    name: 'ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power)',
    category: 'kitchen_care',
    price: 120,
    originalPrice: 250,
    size: '500 ml Foaming Trigger Spray',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/kitchen_cleaner_front.png',
    description: 'Advanced plant-derived grease cutter spray designed to melt stubborn tadka oil film, burnt curry spatters, and chimney soot in seconds.'
  },
  {
    id: 'asm_laundry_1',
    name: 'ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender)',
    category: 'laundry_care',
    price: 350,
    originalPrice: 549,
    size: '5 Liters Economy Canister',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/laundry_front.png',
    description: 'High-efficiency liquid laundry detergent formulated for both top load and front load fully automatic washing machines.'
  },
  {
    id: 'asm_hand_1',
    name: 'ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care)',
    category: 'hand_hygiene',
    price: 60,
    originalPrice: 120,
    size: '250ml',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/handwash_lavender_front.png',
    description: 'Gentle moisturizing antibacterial hand hygiene formula infused with natural calming French lavender essential oils.'
  },
  {
    id: 'asm_pine_1',
    name: 'ASM Shine White Floor Cleaner (Clean Floors, Brighter Homes)',
    category: 'floor_care',
    price: 49,
    originalPrice: 99,
    size: '1 Liter Bottle',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/white_floor_cleaner_front.png',
    description: 'Classic high-potency white pine disinfectant cleaner delivering natural mosquito-deterring cedar pine aroma.'
  },
  {
    id: 'asm_drain_1',
    name: 'ASM Shine RapidAction Drain Unclogger & Odor Eliminator Gel',
    category: 'bathroom_care',
    price: 149,
    originalPrice: 220,
    size: '500 ml Heavy Gel',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/drain_cleaner_front.png',
    description: 'Thick sink and pipe gel that cuts through standing water to dissolve hair, grease, and soap scum.'
  },
  {
    id: 'asm_floor_apple',
    name: 'ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant',
    category: 'floor_care',
    price: 100,
    originalPrice: 210,
    size: '1 Liter Bottle',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/floor_cleaner_apple_front.png',
    description: 'Refreshing crisp green apple floor cleaner and surface sanitizer for marble, granite, and vitrified tiles.'
  },
  {
    id: 'asm_hand_rose',
    name: 'ASM Shine PureShield Antibacterial Liquid Handwash (Rose Care)',
    category: 'hand_hygiene',
    price: 60,
    originalPrice: 120,
    size: '250 ml Pump Bottle',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/handwash_rose_front.png',
    description: 'Delicate floral handwash with natural rose extracts and aloe vera for germ-free, soft hands.'
  },
  {
    id: 'pure_dish_wash',
    name: 'Pure Dish Wash',
    category: 'dishwash_solutions',
    price: 70,
    originalPrice: 160,
    size: '500ml',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/dishwash_front.png',
    description: 'High-active lemon degreasing gel that cleans 100+ utensils with a single spoonful.'
  },
  {
    id: 'asm_shine_toilet_cleaner',
    name: 'ASM Shine Toilet Cleaner',
    category: 'bathroom_surfaces',
    price: 70,
    originalPrice: 150,
    size: '500ml',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/toilet_cleaner_front.png',
    description: 'Thick blue clinging toilet bowl descaler that removes limescale, yellow water deposits, and 99.9% germs.'
  },
  {
    id: 'asm_shine_black_floor_cleaner',
    name: 'ASM Shine Black  Floor Cleaner',
    category: 'floor_care',
    price: 70,
    originalPrice: 140,
    size: '1 Litre',
    image: 'https://res.cloudinary.com/dheyj35ys/image/upload/v1795069455/asm-shine/products/black_floor_cleaner_front.png',
    description: 'Traditional coal-tar based black disinfectant cleaner for heavy-duty hospital and drain sanitation.'
  }
];

const CATEGORIES = [
  { id: 'toilet_care', name: 'Toilet Cleaner' },
  { id: 'bathroom_care', name: 'Bathroom & Tiles' },
  { id: 'glass_care', name: 'Glass & Surface' },
  { id: 'floor_care', name: 'Floor Cleaner' },
  { id: 'dishwash', name: 'Dishwash Gel' },
  { id: 'kitchen_care', name: 'Kitchen & Chimney' },
  { id: 'laundry_care', name: 'Laundry Detergent' },
  { id: 'hand_hygiene', name: 'Hand Hygiene' }
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function injectMeta(html, {
  title,
  description,
  canonical,
  ogImage = `${SITE_URL}/images/banners/hero_banner_photo.png`,
  ogType = 'website',
  structuredData = null,
  bodyContent = ''
}) {
  let modified = html;

  // 1. Replace <title>
  const titleTag = `<title>${escapeHtml(title)}</title>`;
  modified = modified.replace(/<title>.*?<\/title>/i, titleTag);

  // 2. Replace or inject meta description
  const metaDescTag = `<meta name="description" content="${escapeHtml(description)}" />`;
  if (/<meta\s+name="description"[^>]*>/i.test(modified)) {
    modified = modified.replace(/<meta\s+name="description"[^>]*>/i, metaDescTag);
  } else {
    modified = modified.replace('</head>', `  ${metaDescTag}\n</head>`);
  }

  // 3. Inject canonical link
  const canonicalTag = `<link rel="canonical" href="${canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`}" />`;
  if (/<link\s+rel="canonical"[^>]*>/i.test(modified)) {
    modified = modified.replace(/<link\s+rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    modified = modified.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // 4. Inject Open Graph and Twitter Card tags
  const socialTags = `
  <meta property="og:site_name" content="ASM Shine" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`;

  modified = modified.replace('</head>', `${socialTags}\n</head>`);

  // 5. Inject Structured Data JSON-LD
  if (structuredData) {
    const jsonLdTag = `\n  <script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n  </script>`;
    modified = modified.replace('</head>', `${jsonLdTag}\n</head>`);
  }

  // 6. Inject crawlable HTML body inside <div id="root"> for crawlers with disabled JS
  if (bodyContent) {
    const noscriptContent = `\n    <noscript>\n      <div style="padding: 24px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">\n${bodyContent}\n      </div>\n    </noscript>`;
    modified = modified.replace('<div id="root"></div>', `<div id="root"></div>${noscriptContent}`);
  }

  return modified;
}

function writeSnapshot(subPath, html) {
  const targetDir = path.join(DIST_DIR, subPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
}

async function run() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.warn('[Prerender SEO] dist/index.html not found. Run vite build first.');
    return;
  }

  console.log('[Prerender SEO] Generating search-engine optimized static snapshots...');
  const baseHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // Copy sitemap and robots if present in public
  const publicDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(path.join(publicDir, 'robots.txt'))) {
    fs.copyFileSync(path.join(publicDir, 'robots.txt'), path.join(DIST_DIR, 'robots.txt'));
  }
  if (fs.existsSync(path.join(publicDir, 'sitemap.xml'))) {
    fs.copyFileSync(path.join(publicDir, 'sitemap.xml'), path.join(DIST_DIR, 'sitemap.xml'));
  }

  // 1. Homepage Snapshot
  const homeHtml = injectMeta(baseHtml, {
    title: 'ASM Shine — Sparkling Clean & Powerful Hygiene | Official Store',
    description: "ASM Shine: India's premier home hygiene brand. High-performance toilet cleaners, Colin-style glass sprays, bathroom descalers, floor disinfectants, and dishwash gels.",
    canonical: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: 'ASM Shine',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      telephone: '+91 8901 271 271',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 11, Paras Enclave',
        addressLocality: 'Kurukshetra',
        addressRegion: 'Haryana',
        postalCode: '136118',
        addressCountry: 'IN'
      }
    }
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml, 'utf-8');

  // 2. About Us Snapshot (/about-us & /about)
  const aboutHtml = injectMeta(baseHtml, {
    title: 'About Us — The ASM Shine Standard of Hygiene & Cleanliness',
    description: 'Discover how ASM Shine engineers high-performance toilet cleaners, surface sprays, and kitchen degreasers for Indian hard water with zero harsh acid fumes.',
    canonical: '/about-us',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About ASM Shine',
      url: `${SITE_URL}/about-us`,
      mainEntity: {
        '@type': 'Organization',
        name: 'ASM Shine',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        telephone: '+91 8901 271 271'
      }
    },
    bodyContent: `
      <h1>The ASM Shine Standard of Hygiene</h1>
      <p>Conventional cleaners in India rely on harsh, choking hydrochloric acid or watery detergents that fail against heavy borewell water stains. ASM Shine was formulated to redefine hygiene combining thick vertical-clinging polymers, bio-active descalers, and natural essential oils.</p>
    `
  });
  writeSnapshot('about-us', aboutHtml);
  writeSnapshot('about', aboutHtml);

  // 3. Products Listing Snapshot (/products & /categories)
  const productsHtml = injectMeta(baseHtml, {
    title: 'All Products — ASM Shine Cleaning & Hygiene Essentials | Official Store',
    description: "Explore ASM Shine's complete collection of hospital-grade home cleaning essentials. High-performance toilet cleaners, floor cleaners, glass sprays, dishwash gels, and laundry detergents.",
    canonical: '/products',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'All ASM Shine Cleaning Products',
      url: `${SITE_URL}/products`
    },
    bodyContent: `
      <h1>All ASM Shine Products & Cleaners</h1>
      <ul>
        ${FALLBACK_PRODUCTS.map(p => `<li><a href="/product/${p.id}"><strong>${escapeHtml(p.name)}</strong> - ₹${p.price}</a></li>`).join('\n        ')}
      </ul>
    `
  });
  writeSnapshot('products', productsHtml);
  writeSnapshot('categories', productsHtml);

  // 4. Category Pages Snapshot (/categories/:id)
  for (const cat of CATEGORIES) {
    const catProds = FALLBACK_PRODUCTS.filter(p => p.category === cat.id || p.category.includes(cat.id.split('_')[0]));
    const catHtml = injectMeta(baseHtml, {
      title: `${cat.name} — Buy Authentic Cleaners Online | ASM Shine`,
      description: `Shop authentic ASM Shine ${cat.name}. Advanced limescale removal, 99.9% germ protection, and hospital-grade home freshness formulated for Indian homes.`,
      canonical: `/categories/${cat.id}`,
      bodyContent: `
        <h1>ASM Shine ${escapeHtml(cat.name)}</h1>
        <ul>
          ${catProds.map(p => `<li><a href="/product/${p.id}"><strong>${escapeHtml(p.name)}</strong> - ₹${p.price}</a></li>`).join('\n          ')}
        </ul>
      `
    });
    writeSnapshot(`categories/${cat.id}`, catHtml);
  }

  // 5. Individual Product Snapshots (/product/:id)
  for (const prod of FALLBACK_PRODUCTS) {
    const cleanDesc = prod.description || `${prod.name} by ASM Shine. Hospital-grade cleanliness and powerful hygiene.`;
    const prodSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.name,
      description: cleanDesc,
      image: [prod.image],
      sku: prod.id,
      brand: { '@type': 'Brand', name: 'ASM SHINE' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/product/${prod.id}`,
        priceCurrency: 'INR',
        price: prod.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'ASM Shine' }
      }
    };

    const prodHtml = injectMeta(baseHtml, {
      title: `${prod.name} — Buy Online at Best Price | ASM Shine`,
      description: `${cleanDesc.slice(0, 150)}... Buy online for ₹${prod.price} with fast delivery across India.`,
      canonical: `/product/${prod.id}`,
      ogImage: prod.image,
      ogType: 'product',
      structuredData: prodSchema,
      bodyContent: `
        <h1>${escapeHtml(prod.name)}</h1>
        <p><strong>Price:</strong> ₹${prod.price} <del>₹${prod.originalPrice}</del></p>
        <p><strong>Size:</strong> ${escapeHtml(prod.size)}</p>
        <p>${escapeHtml(cleanDesc)}</p>
        <img src="${prod.image}" alt="${escapeHtml(prod.name)}" style="max-width: 300px;" />
      `
    });
    writeSnapshot(`product/${prod.id}`, prodHtml);
  }

  // 6. Policy Pages Snapshots
  const policyPages = [
    {
      path: 'terms-and-conditions',
      title: 'Terms & Conditions — ASM Shine',
      description: "Read ASM Shine's official Terms & Conditions for online ordering, user accounts, and website usage."
    },
    {
      path: 'privacy-policy',
      title: 'Privacy Policy — ASM Shine',
      description: "Read ASM Shine's official Privacy Policy regarding customer personal data, security, and cookies."
    },
    {
      path: 'refund-policy',
      title: 'Refund & Return Policy — ASM Shine',
      description: "Read ASM Shine's official Refund and Return Policy for damaged goods, replacements, and cancellations."
    },
    {
      path: 'contact',
      title: 'Contact Us & Customer Support — ASM Shine',
      description: 'Contact ASM Shine customer support for orders, distributor inquiries, and hygiene consultation. Helpline: +91 8901 271 271.'
    }
  ];

  for (const page of policyPages) {
    const pageHtml = injectMeta(baseHtml, {
      title: page.title,
      description: page.description,
      canonical: `/${page.path}`
    });
    writeSnapshot(page.path, pageHtml);
  }

  console.log(`[Prerender SEO] Successfully prerendered ${FALLBACK_PRODUCTS.length} products, ${CATEGORIES.length} categories, and core storefront pages!`);
}

run().catch(err => {
  console.error('[Prerender SEO] Error:', err);
  process.exit(1);
});

