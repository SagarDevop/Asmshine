/**
 * ASM Shine - Production SEO Controller
 * Provides dynamic XML Sitemap, Robots.txt, and Google Merchant Center Product Feed.
 */
const Product = require('../models/Product');
const Category = require('../models/Category');

const SITE_URL = 'https://www.asmshine.com';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date) {
  try {
    const d = date ? new Date(date) : new Date();
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * GET /sitemap.xml
 * Dynamic XML Sitemap with Schema.org image extensions
 */
const getSitemap = async (req, res, next) => {
  try {
    const today = formatDate();

    // Query published products
    const products = await Product.find({})
      .select('id name image images price availableStock inStock updatedAt createdAt')
      .lean();

    // Query categories
    let categories = [];
    try {
      categories = await Category.find({}).select('id name updatedAt').lean();
    } catch (e) {
      categories = [];
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Storefront Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/products</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms-and-conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/refund-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Category URLs
    for (const cat of categories) {
      if (!cat.id) continue;
      xml += `  <url>
    <loc>${SITE_URL}/categories/${escapeXml(cat.id)}</loc>
    <lastmod>${formatDate(cat.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Dynamic Product URLs with Google Image Sitemap Extension
    for (const prod of products) {
      if (!prod.id) continue;
      const prodUrl = `${SITE_URL}/product/${escapeXml(prod.id)}`;
      const prodLastMod = formatDate(prod.updatedAt || prod.createdAt);
      const imgUrl = prod.image && prod.image.startsWith('http')
        ? prod.image
        : `${SITE_URL}${prod.image ? (prod.image.startsWith('/') ? '' : '/') + prod.image : '/images/banners/hero_banner_photo.png'}`;

      xml += `  <url>
    <loc>${prodUrl}</loc>
    <lastmod>${prodLastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(prod.name)}</image:title>
      <image:caption>${escapeXml(prod.name)} - Official ASM Shine Hygiene Product</image:caption>
    </image:image>
  </url>
`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /robots.txt
 * Dynamic Robots.txt
 */
const getRobotsTxt = (req, res) => {
  const robots = `# ASM Shine Official Robots.txt
# Notice: Legitimate search crawlers are allowed across all public customer storefront pages.
# Private account, authentication, checkout, and admin routes are protected.

User-agent: *
Allow: /
Allow: /images/
Allow: /favicon.svg
Allow: /manifest.webmanifest
Allow: /assets/
Allow: /*.js
Allow: /*.css

Disallow: /admin
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /order/
Disallow: /track-order
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robots);
};

/**
 * GET /api/v1/seo/merchant-feed
 * Google Merchant Center Standard RSS 2.0 / XML Product Data Feed
 */
const getMerchantFeed = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .select('id name description image brand price originalPrice size inStock availableStock category updatedAt')
      .lean();

    let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ASM Shine Official Product Catalog</title>
    <link>${SITE_URL}</link>
    <description>Hospital-grade hygiene essentials, toilet cleaners, glass cleaners, descalers, and laundry detergents for Indian households.</description>
`;

    for (const p of products) {
      if (!p.id) continue;
      const cleanDesc = (p.description || `${p.name} - Authentic ASM Shine Hygiene Product`)
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

      const imgUrl = p.image && p.image.startsWith('http')
        ? p.image
        : `${SITE_URL}${p.image ? (p.image.startsWith('/') ? '' : '/') + p.image : '/images/logo.png'}`;

      const availability = p.inStock !== false && (p.availableStock ?? 1) > 0 ? 'in_stock' : 'out_of_stock';
      const priceFormatted = `${Number(p.price || 0).toFixed(2)} INR`;

      feed += `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(cleanDesc)}</g:description>
      <g:link>${SITE_URL}/product/${escapeXml(p.id)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${escapeXml(p.brand || 'ASM SHINE')}</g:brand>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
    </item>
`;
    }

    feed += `  </channel>
</rss>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=7200');
    return res.status(200).send(feed);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSitemap,
  getRobotsTxt,
  getMerchantFeed
};
