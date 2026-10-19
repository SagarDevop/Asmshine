// ZENVORO Luxury Wellness - Client-side Database & API Layer
const STORAGE_CART_KEY = 'zenvoro_cart_v2';

export const STATIC_CATEGORIES = [
  { id: 'inner_power', name: 'Inner Power', icon: 'Zap' },
  { id: 'brain_focus', name: 'Mind & Focus', icon: 'Brain' },
  { id: 'deep_recovery', name: 'Sleep & Recovery', icon: 'Moon' },
  { id: 'trio_ritual', name: 'The Trio Ritual', icon: 'Sparkles' }
];

export const STATIC_BANNERS = {
  announcement: {
    text: 'Exclusive Launch Offer: Flat 20% OFF with code POWER20 | Free Express Shipping across India',
    code: 'POWER20',
    discount: '20% OFF'
  },
  heroSlides: [
    {
      id: 'slide_1',
      badge: 'FESTIVAL OF INNER POWER',
      tag: 'FLAT 40% OFF',
      title: 'Himalayan Shilajit Gold Resin',
      subtitle: '24K Gold Grade • Sourced above 18,000 ft • Boundless Stamina & Rejuvenation',
      priceText: 'From ₹1,499 (MRP ₹2,499)',
      ctaText: 'ORDER NOW',
      productId: 'prod_1',
      image: '/images/products/zenvoro_shilajit_gold.png'
    },
    {
      id: 'slide_2',
      badge: 'CLINICAL ADAPTOGENS',
      tag: 'FLAT 35% OFF',
      title: 'Nootropic Mind & Focus Zenith',
      subtitle: '60 Capsules • Zero Brain Fog • 100% Alpha Wave Mental Synergy',
      priceText: 'From ₹1,299 (MRP ₹1,999)',
      ctaText: 'EXPLORE ZENITH',
      productId: 'prod_2',
      image: '/images/products/zenvoro_nootropic_focus.png'
    },
    {
      id: 'slide_3',
      badge: 'THE LUXURY COMBO BOX',
      tag: 'SAVE FLAT ₹2,998',
      title: 'The Sacred Trio Ritual Bundle',
      subtitle: 'Complete 24-Hour Energy, Focus & Deep Cellular Sleep • Luxury Gift Packaging',
      priceText: 'Complete Trio for ₹3,999',
      ctaText: 'CLAIM COMBO DEAL',
      productId: 'prod_1',
      image: '/images/products/zenvoro_recovery_elixir.png'
    }
  ],
  hero: {
    badge: '100% PURE HIMALAYAN AYURVEDA',
    title: 'Elevate Your Inner Power',
    subtitle: 'Pure Himalayan Shilajit Gold, Nootropic Focus & Cellular Recovery Elixir',
    ctaText: 'EXPLORE THE TRIO',
    image: '/images/banners/zenvoro_hero_banner.png'
  }
};

export const STATIC_PRODUCTS = [
  // Product 1: Himalayan Shilajit Gold Resin
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
    reviewCount: '1,840',
    ratingsCount: '4,920',
    image: '/images/products/zenvoro_shilajit_gold.png',
    badge: 'BEST SELLER',
    inStock: true,
    assured: true,
    companionId: 'prod_2',
    comboDiscount: 499,
    comboSavingsPercent: 25,
    description: 'Sourced from 18,000+ ft pristine Himalayan peaks. Certified >80% Fulvic acid infused with 24K edible gold dust & Ashwagandha for boundless stamina, cellular rejuvenation, and inner strength.',
    marketplaceLinks: {
      amazon: 'https://www.amazon.in/s?k=Zenvoro+Shilajit+Gold',
      flipkart: 'https://www.flipkart.com/search?q=Zenvoro+Shilajit+Gold',
      meesho: 'https://www.meesho.com/search?q=Zenvoro+Shilajit'
    },
    availableSizes: [
      { size: '20g Trial', price: 899, originalPrice: 1399, discount: '35% off' },
      { size: '50g Gold Jar', price: 1499, originalPrice: 2499, discount: '40% off' },
      { size: '100g Value Pack', price: 2699, originalPrice: 4499, discount: '40% off' }
    ],
    highlights: [
      '100% Pure Himalayan Grade A Resin extracted at 18,000+ ft altitude',
      '>80% High Bio-Active Fulvic Acid + 84+ essential ionic trace minerals',
      'Infused with 24K Ayurvedic Swarna Bhasma (Gold) & organic Ashwagandha',
      'Clinically verified to boost ATP cellular stamina, mental drive & vitality',
      'NABL Lab Tested with zero heavy metals, zero sugar, and zero chemical fillers'
    ],
    specifications: {
      'Form': 'Purified Black Resin',
      'Extraction Altitude': '18,000+ Feet (Upper Himalayas)',
      'Fulvic Acid Content': 'Greater than 80% Certified',
      'Infused Actives': '24K Swarna Bhasma, KSM-66 Ashwagandha, Safed Musli',
      'Pack Contents': '50g Luxury Jar + Precision Golden Scoop Spoon',
      'Country of Origin': 'India',
      'Shelf Life': '36 Months'
    },
    reviews: [
      {
        id: 'rev_1',
        author: 'Vikramaditya Rathore',
        location: 'Mumbai, Maharashtra',
        rating: 5,
        date: '2 days ago',
        title: 'Unbelievable stamina and morning energy!',
        comment: 'I have tried multiple Shilajit brands, but ZENVORO is on a completely different tier. The resin is glossy, dissolves completely in lukewarm water, and within 3 days my afternoon fatigue is completely gone.'
      },
      {
        id: 'rev_2',
        author: 'Arjun Singhania',
        location: 'Bengaluru, Karnataka',
        rating: 5,
        date: '1 week ago',
        title: 'Pure gold quality packaging and authentic taste',
        comment: 'The golden spoon and luxury jar feel like a royal experience. Lab certificate was included in the box. 100% genuine and powerful.'
      }
    ]
  },

  // Product 2: Nootropic Mind & Focus Zenith
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
    reviewCount: '1,210',
    ratingsCount: '3,450',
    image: '/images/products/zenvoro_nootropic_focus.png',
    badge: 'MIND & FOCUS',
    inStock: true,
    assured: true,
    companionId: 'prod_3',
    comboDiscount: 399,
    comboSavingsPercent: 22,
    description: 'Clinically formulated cognitive amplifier blending Lion’s Mane mushroom, Organic Brahmi, Ginkgo Biloba & Shankhpushpi for razor-sharp mental focus, stress reduction, and sustained creative energy.',
    availableSizes: [
      { size: '60 Veg Capsules (1 Month)', price: 1299, originalPrice: 1999, discount: '35% off' },
      { size: '120 Veg Capsules (2 Months)', price: 2299, originalPrice: 3699, discount: '38% off' }
    ],
    highlights: [
      'Standardized Lion’s Mane (Hericium erinaceus) for neurogenesis & NGF support',
      'Organic Brahmi (Bacopa Monnieri 50% Bacosides) for rapid working memory recall',
      'Eliminates brain fog, mid-day crashes & cognitive fatigue without caffeine',
      '100% Plant-Based vegan capsules, non-stimulant with zero jitters',
      'Enhanced with Ginkgo Biloba for optimal cerebral blood flow'
    ],
    specifications: {
      'Form': 'Vegetarian Plant Capsules',
      'Serving Size': '2 Capsules Daily',
      'Key Ingredients': 'Lion’s Mane, Brahmi (50% Bacosides), Ginkgo Biloba, Shankhpushpi',
      'Pack Contents': '60 Vegan Capsules in UV-Protected Amber Glass Bottle',
      'Allergen Info': 'Gluten-Free, Non-GMO, Soy-Free, 100% Vegan',
      'Country of Origin': 'India',
      'Shelf Life': '24 Months'
    },
    reviews: [
      {
        id: 'rev_3',
        author: 'Rohan Mehta',
        location: 'Gurugram, Haryana',
        rating: 5,
        date: '3 days ago',
        title: 'Deep focus during coding marathons',
        comment: 'As a software architect, mental clarity is everything. ZENVORO Nootropic keeps my brain laser-focused for 6-8 hours without the caffeine crash or anxiety. Game changer!'
      },
      {
        id: 'rev_4',
        author: 'Ananya Deshmukh',
        location: 'Pune, Maharashtra',
        rating: 5,
        date: '5 days ago',
        title: 'Zero brain fog, calm clear thoughts',
        comment: 'Took it consistently for two weeks. My memory recall and multitasking speed have noticeably sharpened.'
      }
    ]
  },

  // Product 3: Royal Cellular Recovery & Sleep Elixir
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
    ratingsCount: '2,860',
    image: '/images/products/zenvoro_recovery_elixir.png',
    badge: 'RECOVERY',
    inStock: true,
    assured: true,
    companionId: 'prod_1',
    comboDiscount: 399,
    comboSavingsPercent: 20,
    description: 'Sublingual cellular sleep & vitality elixir with Kashmiri Saffron, Valerian Root, Chamomile & pure Magnesium Glycinate. Wakes you up restored, energized, and ready to dominate.',
    availableSizes: [
      { size: '30 ml Dropper (30 Days)', price: 1199, originalPrice: 1799, discount: '33% off' },
      { size: '60 ml Dual Pack (60 Days)', price: 2099, originalPrice: 3299, discount: '36% off' }
    ],
    highlights: [
      'Infused with Kashmiri Mogra Saffron (Grade A1) & pure Chamomile extract',
      'High-absorption sublingual drops bypass digestion for rapid 15-minute relaxation',
      'Promotes deep REM restorative sleep without morning grogginess or dependency',
      'Regulates evening cortisol & supports nighttime cellular repair cycles',
      'Non-habit forming, 100% natural herbal adaptogenic blend'
    ],
    specifications: {
      'Form': 'Sublingual Liquid Herbal Drops',
      'Dosage': '1 full dropper (1 ml) under the tongue 30 minutes before sleep',
      'Key Botanicals': 'Kashmiri Saffron, Valerian Root, Chamomile, Magnesium Glycinate, Ashwagandha',
      'Bottle': '30 ml Amber Glass with Precision Gold-Accented Pipette',
      'Free From': 'Synthetic Melatonin, Alcohol, Sugar, Artificial Flavors',
      'Country of Origin': 'India',
      'Shelf Life': '24 Months'
    },
    reviews: [
      {
        id: 'rev_5',
        author: 'Kavita Chawla',
        location: 'New Delhi, Delhi',
        rating: 5,
        date: '4 days ago',
        title: 'Deepest sleep of my adult life',
        comment: 'I struggled with waking up at 3 AM with racing thoughts. A few drops under the tongue and within 20 minutes I drift into peaceful, uninterrupted sleep. Wake up feeling light and energized!'
      },
      {
        id: 'rev_6',
        author: 'Siddharth Nair',
        location: 'Hyderabad, Telangana',
        rating: 5,
        date: '1 week ago',
        title: 'Natural relaxation without morning grogginess',
        comment: 'Unlike melatonin pills that made me dizzy the next day, this herbal elixir feels totally natural and luxurious.'
      }
    ]
  }
];

function getStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[Cart] LocalStorage read error:', e);
  }
  return [
    { productId: 'prod_1', quantity: 1 }
  ];
}

function saveStoredCart(cart) {
  try {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('[Cart] LocalStorage write error:', e);
  }
}

export const api = {
  // Fetch products optionally filtered by section, category or search query
  getProducts: async ({ section, category, search } = {}) => {
    let list = [...STATIC_PRODUCTS];
    if (section && section !== 'all') list = list.filter((p) => p.section === section || section === 'best_sellers');
    if (category) {
      if (category === 'trio_ritual') {
        // Return all 3 products for the complete ritual
        return list;
      }
      list = list.filter((p) => p.category === category);
    }
    if (search) {
      list = list.filter((p) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  },

  // Get single product by ID
  getProductById: async (id) => {
    return STATIC_PRODUCTS.find((p) => p.id === id) || null;
  },

  // Get similar products
  getSimilarProducts: async (productId) => {
    return STATIC_PRODUCTS.filter((p) => p.id !== productId);
  },

  // Get combo details for Frequently Bought Together
  getComboDetails: async (productId) => {
    const mainProduct = STATIC_PRODUCTS.find((p) => p.id === productId) || STATIC_PRODUCTS[0];
    const companionProduct = STATIC_PRODUCTS.find((p) => p.id === mainProduct.companionId) ||
      STATIC_PRODUCTS.find((p) => p.id !== productId) || STATIC_PRODUCTS[1];

    if (!companionProduct) return null;

    const combinedOriginal = (mainProduct.originalPrice || mainProduct.price) + (companionProduct.originalPrice || companionProduct.price);
    const combinedStandardPrice = mainProduct.price + companionProduct.price;
    const discount = mainProduct.comboDiscount || 399;
    const comboPrice = Math.max(combinedStandardPrice - discount, 499);
    const totalSavings = combinedOriginal - comboPrice;

    return {
      mainProduct,
      companionProduct,
      combinedOriginal,
      combinedStandardPrice,
      comboPrice,
      totalSavings,
      discount
    };
  },

  // Fetch categories
  getCategories: async () => {
    return STATIC_CATEGORIES;
  },

  // Fetch banners & offer strip data
  getBanners: async () => {
    return STATIC_BANNERS;
  },

  // Get current Cart
  getCart: async () => {
    const items = getStoredCart();
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return {
      totalCount: count,
      data: items
    };
  },

  // Get fully populated cart with products and totals
  getCartFullDetails: async () => {
    const rawItems = getStoredCart();
    let totalMRP = 0;
    let totalPrice = 0;
    let totalCount = 0;

    const items = rawItems
      .map((item) => {
        const product = STATIC_PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        const qty = item.quantity || 1;
        const originalPrice = product.originalPrice || product.price;
        const currentPrice = product.price;
        const itemMRP = originalPrice * qty;
        const itemTotal = currentPrice * qty;
        const itemSavings = itemMRP - itemTotal;

        totalMRP += itemMRP;
        totalPrice += itemTotal;
        totalCount += qty;

        return {
          productId: item.productId,
          quantity: qty,
          product,
          itemMRP,
          itemTotal,
          itemSavings
        };
      })
      .filter(Boolean);

    const totalDiscount = Math.max(totalMRP - totalPrice, 0);

    return {
      items,
      totalCount,
      totalMRP,
      totalPrice,
      totalDiscount
    };
  },

  // Add single item to cart
  addToCart: async (productId, quantity = 1) => {
    const cart = getStoredCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    saveStoredCart(cart);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return {
      success: true,
      totalCount: count,
      data: cart
    };
  },

  // Update item quantity
  updateCartQuantity: async (productId, quantity) => {
    let cart = getStoredCart();
    if (quantity <= 0) {
      cart = cart.filter((item) => item.productId !== productId);
    } else {
      const existing = cart.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity = quantity;
      } else {
        cart.push({ productId, quantity });
      }
    }
    saveStoredCart(cart);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return {
      success: true,
      totalCount: count,
      data: cart
    };
  },

  // Remove single item from cart
  removeFromCart: async (productId) => {
    const cart = getStoredCart().filter((item) => item.productId !== productId);
    saveStoredCart(cart);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return {
      success: true,
      totalCount: count,
      data: cart
    };
  },

  // Clear entire cart
  clearCart: async () => {
    saveStoredCart([]);
    return {
      success: true,
      totalCount: 0,
      data: []
    };
  },

  // Add multiple items (Combo) to cart
  addComboToCart: async (items = []) => {
    const cart = getStoredCart();
    items.forEach(({ productId, quantity = 1 }) => {
      const existing = cart.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }
    });
    saveStoredCart(cart);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return {
      success: true,
      totalCount: count,
      data: cart
    };
  }
};
