const initialProducts = [
  // 1. Flagship Shilajit Gold
  {
    id: 'prod_1',
    name: 'ZENVORO Pure Himalayan Shilajit Gold Resin (24K Gold Grade)',
    shortName: 'ZENVORO Himalayan Shilajit Gold Resin (24K Gold Grade)...',
    brand: 'ZENVORO',
    category: 'inner_power',
    section: 'best_sellers',
    size: '50g Luxury Jar',
    price: 1499,
    originalPrice: 2499,
    discountPercent: 40,
    rating: 4.9,
    reviewCount: '1.8k',
    image: '/images/products/zenvoro_shilajit_gold.png',
    badge: 'BEST SELLER',
    inStock: true,
    description: 'Sourced from 18,000+ ft pristine Himalayan peaks. Certified >80% Fulvic acid infused with 24K edible gold dust & Ashwagandha for boundless stamina, cellular rejuvenation, and inner strength.'
  },
  // 2. Nootropic Mind & Focus
  {
    id: 'prod_2',
    name: 'ZENVORO Nootropic Mind & Focus Zenith (60 Capsules)',
    shortName: 'ZENVORO Nootropic Mind & Focus Zenith (60 Capsules)...',
    brand: 'ZENVORO',
    category: 'brain_focus',
    section: 'best_sellers',
    size: '60 Veg Capsules',
    price: 1299,
    originalPrice: 1999,
    discountPercent: 35,
    rating: 4.8,
    reviewCount: '1.2k',
    image: '/images/products/zenvoro_nootropic_focus.png',
    badge: 'MIND & FOCUS',
    inStock: true,
    description: 'Clinically formulated cognitive amplifier blending Lion’s Mane mushroom, Organic Brahmi, Ginkgo Biloba & Shankhpushpi for razor-sharp mental focus, stress reduction, and sustained creative energy.'
  },
  // 3. Cellular Recovery & Sleep Elixir
  {
    id: 'prod_3',
    name: 'ZENVORO Royal Cellular Recovery & Sleep Elixir (30ml)',
    shortName: 'ZENVORO Royal Cellular Recovery & Sleep Elixir (30ml)...',
    brand: 'ZENVORO',
    category: 'deep_recovery',
    section: 'best_sellers',
    size: '30 ml Dropper',
    price: 1199,
    originalPrice: 1799,
    discountPercent: 33,
    rating: 4.9,
    reviewCount: '980',
    image: '/images/products/zenvoro_recovery_elixir.png',
    badge: 'RECOVERY',
    inStock: true,
    description: 'Sublingual cellular sleep & vitality elixir with Kashmiri Saffron, Valerian Root, Chamomile & pure Magnesium Glycinate. Wakes you up restored, energized, and ready to dominate.'
  }
];

const initialCategories = [
  { id: 'inner_power', name: 'Inner Power', icon: 'Zap' },
  { id: 'brain_focus', name: 'Mind & Focus', icon: 'Brain' },
  { id: 'deep_recovery', name: 'Sleep & Recovery', icon: 'Moon' },
  { id: 'trio_ritual', name: 'The Trio Ritual', icon: 'Sparkles' }
];

const initialBanners = {
  announcement: {
    text: '✨ Exclusive Launch Offer: Flat 20% OFF with code POWER20 | Free Express Shipping across India',
    code: 'POWER20',
    discount: '20% OFF'
  },
  hero: {
    badge: '100% PURE HIMALAYAN AYURVEDA',
    title: 'Elevate Your Inner Power',
    subtitle: 'Pure Himalayan Shilajit Gold, Nootropic Focus & Cellular Recovery Elixir',
    ctaText: 'EXPLORE THE TRIO >',
    image: '/images/banners/zenvoro_hero_banner.png'
  }
};

const initialCart = [
  { productId: 'prod_1', quantity: 1 }
];

module.exports = { initialProducts, initialCategories, initialBanners, initialCart };
