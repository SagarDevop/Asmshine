// ASM SHINE - Client-side Database & API Layer
const STORAGE_CART_KEY = 'asm_shine_cart_v1';

export const STATIC_CATEGORIES = [
  {
    "id": "toilet_care",
    "name": "Toilet Cleaner",
    "icon": "ShieldCheck",
    "desc": "Power Disinfectant & Hard Limescale Remover"
  },
  {
    "id": "bathroom_care",
    "name": "Bathroom & Tiles",
    "icon": "Bath",
    "desc": "Hard Water Descaler & Soap Scum Removal"
  },
  {
    "id": "glass_care",
    "name": "Glass & Surface",
    "icon": "SprayCan",
    "desc": "Streak-Free Crystal Shine Spray (Colin Style)"
  },
  {
    "id": "floor_care",
    "name": "Floor Cleaner",
    "icon": "Brush",
    "desc": "Citrus & Pine Disinfectant Surface Cleansers"
  },
  {
    "id": "dishwash",
    "name": "Dishwash Gel",
    "icon": "Utensils",
    "desc": "Concentrated Turbo Lemon Anti-Grease Gel"
  },
  {
    "id": "kitchen_care",
    "name": "Kitchen & Chimney",
    "icon": "CookingPot",
    "desc": "Heavy-Duty Degreaser & Burnt Oil Remover"
  },
  {
    "id": "laundry_care",
    "name": "Laundry Detergent",
    "icon": "Shirt",
    "desc": "Ultra Fabric Care Liquid Detergent & Brightener"
  },
  {
    "id": "hand_hygiene",
    "name": "Hand Hygiene",
    "icon": "Droplets",
    "desc": "Antibacterial Aloe & Vitamin E Handwash"
  }
];

export const STATIC_BANNERS = {
  "announcement": {
    "text": "ASM Shine Mega Home Hygiene Fest: Flat 25% OFF with code SHINE25 | Free Doorstep Express Delivery",
    "code": "SHINE25",
    "discount": "25% OFF"
  },
  "heroSlides": [
    {
      "id": "slide_diwali_toilet",
      "title": "ASM Smart Clean Toilet Cleaner 500ml @ ₹69",
      "productId": "asm_toilet_1",
      "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792938228/asm-shine/banners/banner_diwali_toilet.png"
    },
    {
      "id": "slide_floor_cleaner_5l",
      "title": "ASM Shine Floor Cleaner 5 Litre @ ₹249",
      "productId": "asm_floor_1",
      "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792938229/asm-shine/banners/banner_floor_cleaner_5l.jpg"
    }
  ],
  "hero": {
    "badge": "ASM SHINE OFFICIAL STORE",
    "title": "Spotless Clean, Sparkling Shine",
    "subtitle": "Complete Range of High-Performance Home, Kitchen & Bathroom Cleaning Essentials",
    "ctaText": "EXPLORE ALL CLEANERS",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792938229/asm-shine/banners/banner_floor_cleaner_5l.jpg"
  }
};

export const STATIC_PRODUCTS = [
  {
    "id": "asm_toilet_1",
    "name": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel)",
    "shortName": "ASM Shine Ultra Power Toilet Cleaner 1L...",
    "brand": "ASM SHINE",
    "category": "toilet_care",
    "section": "best_sellers",
    "size": "1 Liter (10x Max Stain Removal)",
    "price": 189,
    "originalPrice": 260,
    "discountPercent": 27,
    "rating": 4.9,
    "reviewCount": "3,420",
    "ratingsCount": "8,950",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
    "badge": "BEST SELLER",
    "inStock": true,
    "assured": true,
    "companionId": "asm_bath_1",
    "comboDiscount": 59,
    "comboSavingsPercent": 20,
    "description": "Specialized high-viscosity blue clinging formula engineered for deep ceramic sanitization. Eradicates 99.9% of disease-causing germs, effortlessly dissolves stubborn yellow urine stains & limescale, leaving a long-lasting marine breeze fragrance.",
    "availableSizes": [
      {
        "size": "500 ml Bottle",
        "price": 99,
        "originalPrice": 135,
        "discount": "26% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_500ml",
          "alt": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel) - 500 ml Bottle"
        }
      },
      {
        "size": "1 Liter Power Pack",
        "price": 189,
        "originalPrice": 260,
        "discount": "27% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_1l",
          "alt": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel) - 1 Liter Power Pack"
        }
      },
      {
        "size": "Twin Pack (1L x 2)",
        "price": 349,
        "originalPrice": 520,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_1l",
          "alt": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel) - Twin Pack (1L x 2)"
        }
      },
      {
        "size": "5 Liter Economy Can",
        "price": 699,
        "originalPrice": 1050,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_5l",
          "alt": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel) - 5 Liter Economy Can"
        }
      }
    ],
    "highlights": [
      "10X Power Stain Cutter: Dissolves stubborn hard water limescale and yellow stains",
      "Kills 99.9% disease-causing germs and bacteria certified by NABL labs",
      "Ultra-thick clinging gel formula stays longer on vertical bowl surfaces for effortless cleaning",
      "Angled curved nozzle reaches beneath the inner rim effortlessly",
      "Safe for both Indian style and Western commodes, vitrified ceramics & septic tanks"
    ],
    "specifications": {
      "Form": "Thick Clinging Liquid Gel",
      "Fragrance": "Ocean Fresh Marine Breeze",
      "Germ Kill Rate": "99.9% Micro-organisms",
      "Suitable For": "Western & Indian Ceramic Commode Bowls",
      "Shelf Life": "24 Months from Mfd",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_t1_1",
        "author": "Rohit Verma",
        "location": "New Delhi",
        "rating": 5,
        "date": "Yesterday",
        "title": "Much better thickness and cleaning than Harpic!",
        "comment": "The thick blue gel clings immediately to the sides and cleaned 6-month-old hard water stains in 10 minutes without harsh fumes."
      },
      {
        "id": "rev_t1_2",
        "author": "Pooja Sharma",
        "location": "Jaipur, Rajasthan",
        "rating": 5,
        "date": "4 days ago",
        "title": "Sparkling clean commode",
        "comment": "Smells like a premium fresh hotel restroom. Very satisfied with ASM Shine quality."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
      "publicId": "asm-shine/products/asm_tile_cleaner_500ml",
      "alt": "ASM Shine Ultra Power Disinfectant Toilet & Tile Cleaner (Angled Nozzle Gel)",
      "format": "jpg",
      "bytes": 74867,
      "width": 1200,
      "height": 1600
    }
  },
  {
    "id": "asm_glass_1",
    "name": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free)",
    "shortName": "ASM Shine Crystal Clear Glass Spray 500ml...",
    "brand": "ASM SHINE",
    "category": "glass_care",
    "section": "best_sellers",
    "size": "500 ml Trigger Spray",
    "price": 119,
    "originalPrice": 165,
    "discountPercent": 28,
    "rating": 4.8,
    "reviewCount": "2,810",
    "ratingsCount": "6,400",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
    "badge": "TRENDING",
    "inStock": true,
    "assured": true,
    "companionId": "asm_toilet_1",
    "comboDiscount": 45,
    "comboSavingsPercent": 18,
    "description": "Advanced streak-free glass and multi-surface cleaner powered by Shine-Boosters. Effortlessly dissolves fingerprint grease, dust, water marks, and atmospheric haze on mirrors, windows, TV screens, dining tables, and car windshields.",
    "availableSizes": [
      {
        "size": "500 ml Trigger Spray",
        "price": 119,
        "originalPrice": 165,
        "discount": "28% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_glass_cleaner_500ml",
          "alt": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free) - 500 ml Trigger Spray"
        }
      },
      {
        "size": "1 Liter Refill Pouch",
        "price": 179,
        "originalPrice": 250,
        "discount": "28% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_glass_cleaner_500ml",
          "alt": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free) - 1 Liter Refill Pouch"
        }
      },
      {
        "size": "Twin Pack (500ml Spray + 1L Refill)",
        "price": 279,
        "originalPrice": 415,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_glass_cleaner_500ml",
          "alt": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free) - Twin Pack (500ml Spray + 1L Refill)"
        }
      },
      {
        "size": "5 Liter Bulk Can",
        "price": 599,
        "originalPrice": 899,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_glass_cleaner_500ml",
          "alt": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free) - 5 Liter Bulk Can"
        }
      }
    ],
    "highlights": [
      "100% Streak-Free Crystal Clarity with Anti-Dust Shield Technology",
      "Cuts through oily smudges, fingerprint grease, and haze in one quick swipe",
      "Dual-mode adjustable spray nozzle (Wide Mist / Direct Jet Stream)",
      "Multi-surface compatible: Glass, Mirrors, Dining Tables, Laminated Wood & Car Glass",
      "Refreshing Sparkling Ocean fragrance leaves rooms smelling crisp and fresh"
    ],
    "specifications": {
      "Form": "Active Liquid Spray",
      "Fragrance": "Ocean Mint Sparkle",
      "Key Actives": "Isopropyl Alcohol & Anti-Static Polymers",
      "Surfaces": "Glass, Mirrors, Acrylic, Car Windows, Appliances",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_g1_1",
        "author": "Ananya Sen",
        "location": "Kolkata, West Bengal",
        "rating": 5,
        "date": "3 days ago",
        "title": "Zero streaks on dressing table mirror",
        "comment": "Used it on dining glass and car windshield. Dries in seconds with absolute zero haze or cloudy lines!"
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936169/asm-shine/products/asm_glass_cleaner_500ml.jpg",
      "publicId": "asm-shine/products/asm_glass_cleaner_500ml",
      "alt": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Streak-Free)",
      "format": "jpg",
      "bytes": 150647,
      "width": 1024,
      "height": 1536
    }
  },
  {
    "id": "asm_bath_1",
    "name": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner",
    "shortName": "ASM Shine Heavy-Duty Bathroom Descaler 1L...",
    "brand": "ASM SHINE",
    "category": "bathroom_care",
    "section": "best_sellers",
    "size": "1 Liter Active Gel",
    "price": 179,
    "originalPrice": 249,
    "discountPercent": 28,
    "rating": 4.9,
    "reviewCount": "2,450",
    "ratingsCount": "5,800",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
    "badge": "HARD WATER SPECIALIST",
    "inStock": true,
    "assured": true,
    "companionId": "asm_glass_1",
    "comboDiscount": 50,
    "comboSavingsPercent": 20,
    "description": "Engineered specifically for Indian hard water conditions. Dissolves stubborn calcium deposits, white limescale, rust marks, and slippery soap scum from bathroom floor tiles, wall ceramics, washbasins, and chrome fixtures without harsh fumes.",
    "availableSizes": [
      {
        "size": "500 ml Spray Bottle",
        "price": 129,
        "originalPrice": 179,
        "discount": "28% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_500ml",
          "alt": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner - 500 ml Spray Bottle"
        }
      },
      {
        "size": "1 Liter Deep Clean Pack",
        "price": 179,
        "originalPrice": 249,
        "discount": "28% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_1l",
          "alt": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner - 1 Liter Deep Clean Pack"
        }
      },
      {
        "size": "Pack of 2 (1L x 2)",
        "price": 329,
        "originalPrice": 498,
        "discount": "34% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_1l",
          "alt": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner - Pack of 2 (1L x 2)"
        }
      },
      {
        "size": "5 Liter Master Can",
        "price": 679,
        "originalPrice": 999,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936168/asm-shine/products/asm_tile_cleaner_5l.jpg",
          "publicId": "asm-shine/products/asm_tile_cleaner_5l",
          "alt": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner - 5 Liter Master Can"
        }
      }
    ],
    "highlights": [
      "Hard Water Specialist: Removes stubborn white salt buildup & water marks instantly",
      "Restores original glossy shine to dull ceramic tiles and washbasins",
      "Non-corrosive to grout lines and modern stainless steel tap fittings",
      "Anti-Bacterial formulation kills 99.9% bathroom fungi, mold and bacteria",
      "Pleasant floral citrus aroma without pungent acid fumes"
    ],
    "specifications": {
      "Form": "Thick Foaming Action Gel",
      "Fragrance": "Citrus Pine Fresh",
      "Acids": "Zero Harsh Hydrochloric Fumes (Organic Safe Descaling Formula)",
      "Surfaces": "Floor Tiles, Wall Tiles, Sinks, Shower Glass, Chrome Faucets",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_b1_1",
        "author": "Karan Malhotra",
        "location": "Gurugram, Haryana",
        "rating": 5,
        "date": "2 days ago",
        "title": "Finally something that cleaned our Borewell water stains",
        "comment": "Our water has severe TDS and creates white crust on bathroom tiles. ASM Shine descaler dissolved it effortlessly."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936166/asm-shine/products/asm_tile_cleaner_1l.jpg",
      "publicId": "asm-shine/products/asm_tile_cleaner_1l",
      "alt": "ASM Shine Heavy-Duty Bathroom & Ceramic Tiles Descaler Cleaner",
      "format": "jpg",
      "bytes": 119723,
      "width": 1023,
      "height": 1537
    }
  },
  {
    "id": "asm_floor_1",
    "name": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant",
    "shortName": "ASM Shine Citrus Fresh Floor Cleaner 2L...",
    "brand": "ASM SHINE",
    "category": "floor_care",
    "section": "best_sellers",
    "size": "2 Liters Economy Family Pack",
    "price": 269,
    "originalPrice": 399,
    "discountPercent": 33,
    "rating": 4.8,
    "reviewCount": "4,120",
    "ratingsCount": "10,200",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
    "badge": "FAMILY FAVORITE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_toilet_1",
    "comboDiscount": 60,
    "comboSavingsPercent": 22,
    "description": "All-in-one floor sanitizing formula that delivers spotless shine with hospital-grade disinfection. Dissolves sticky food spills, muddy paw marks, and greasy footwear grime across marble, granite, mosaic, and vitrified tiles.",
    "availableSizes": [
      {
        "size": "500 ml Bottle",
        "price": 99,
        "originalPrice": 145,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936173/asm-shine/products/asm_floor_cleaner_lemon_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936173/asm-shine/products/asm_floor_cleaner_lemon_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936173/asm-shine/products/asm_floor_cleaner_lemon_500ml.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_lemon_500ml",
          "alt": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant - 500 ml Bottle"
        }
      },
      {
        "size": "1 Liter Bottle",
        "price": 149,
        "originalPrice": 219,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_lemon_1l",
          "alt": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant - 1 Liter Bottle"
        }
      },
      {
        "size": "2 Liters Family Pack",
        "price": 269,
        "originalPrice": 399,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_lemon_1l",
          "alt": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant - 2 Liters Family Pack"
        }
      },
      {
        "size": "5 Liters Jumbo Can",
        "price": 579,
        "originalPrice": 899,
        "discount": "36% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_lemon_1l",
          "alt": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant - 5 Liters Jumbo Can"
        }
      }
    ],
    "highlights": [
      "Hospital-grade bactericidal & antiviral disinfection certified",
      "Leaves zero sticky residue with a brilliant mirror-gloss reflection",
      "Pet & child safe formula after quick drying",
      "Infused with natural Orange & Bergamot citrus essential oils",
      "1 cap in half bucket water cleans up to 1,500 sq ft floor space"
    ],
    "specifications": {
      "Form": "Concentrated Disinfectant Liquid",
      "Fragrance": "Zesty Citrus Orange & Pine",
      "Coverage": "1 Cap (15ml) per 4 Liters water",
      "Surfaces": "Vitrified Tiles, Marble, Granite, Ceramic, Parquet Flooring",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_fl_1",
        "author": "Sunita Aggarwal",
        "location": "Noida, UP",
        "rating": 5,
        "date": "5 days ago",
        "title": "Fragrance lasts for hours",
        "comment": "Floors shine like a mirror and the citrus fragrance makes the entire living room feel like a 5-star spa."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936170/asm-shine/products/asm_floor_cleaner_lemon_1l.jpg",
      "publicId": "asm-shine/products/asm_floor_cleaner_lemon_1l",
      "alt": "ASM Shine Lemon Fresh Surface & Floor Cleaner Liquid Disinfectant",
      "format": "jpg",
      "bytes": 111974,
      "width": 1087,
      "height": 1447
    }
  },
  {
    "id": "asm_dish_1",
    "name": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting)",
    "shortName": "ASM Shine Turbo Lemon Dishwash Gel 1L...",
    "brand": "ASM SHINE",
    "category": "dishwash",
    "section": "everyday_essentials",
    "size": "1 Liter Deep Grease Buster",
    "price": 149,
    "originalPrice": 210,
    "discountPercent": 29,
    "rating": 4.9,
    "reviewCount": "3,190",
    "ratingsCount": "7,800",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
    "badge": "HIGH FOAM",
    "inStock": true,
    "assured": true,
    "companionId": "asm_kitchen_1",
    "comboDiscount": 45,
    "comboSavingsPercent": 19,
    "description": "Powered by 100 concentrated lemons. Cuts through burnt ghee, stubborn oil, and masala curry pots in seconds without white residue. Enriched with aloe extract to keep hands ultra-soft during daily washing.",
    "availableSizes": [
      {
        "size": "500 ml Squeeze Bottle",
        "price": 89,
        "originalPrice": 125,
        "discount": "29% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "publicId": "asm-shine/products/asm_dishwash_liquid_500ml",
          "alt": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting) - 500 ml Squeeze Bottle"
        }
      },
      {
        "size": "1 Liter Dispenser Pack",
        "price": 149,
        "originalPrice": 210,
        "discount": "29% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "publicId": "asm-shine/products/asm_dishwash_liquid_500ml",
          "alt": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting) - 1 Liter Dispenser Pack"
        }
      },
      {
        "size": "2 Liters Value Refill",
        "price": 269,
        "originalPrice": 390,
        "discount": "31% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
          "publicId": "asm-shine/products/asm_dishwash_liquid_500ml",
          "alt": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting) - 2 Liters Value Refill"
        }
      },
      {
        "size": "5 Liters Commercial Can",
        "price": 549,
        "originalPrice": 850,
        "discount": "35% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936179/asm-shine/products/asm_dishwash_liquid_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936179/asm-shine/products/asm_dishwash_liquid_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936179/asm-shine/products/asm_dishwash_liquid_5l.jpg",
          "publicId": "asm-shine/products/asm_dishwash_liquid_5l",
          "alt": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting) - 5 Liters Commercial Can"
        }
      }
    ],
    "highlights": [
      "Cuts through stubborn burnt grease, oily kadhai residue, and egg smell",
      "Just 1 teaspoon cleans an entire sink full of everyday utensils",
      "Zero chalky white residue on stainless steel, glass, and bone china",
      "Dermatologically tested gentle on hands with natural Aloe Vera moisturizing",
      "100% Food-grade safe quick rinse formula"
    ],
    "specifications": {
      "Form": "Concentrated Ultra-Viscous Green Gel",
      "Fragrance": "Crisp Sun-Ripened Lemon",
      "Enzymes": "Bio-Active Protease & Amylase Grease Cutters",
      "Utensil Types": "Stainless Steel, Non-Stick Cookware, Glass, Melamine, Brass",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_d1_1",
        "author": "Meera Joshi",
        "location": "Ahmedabad, Gujarat",
        "rating": 5,
        "date": "1 week ago",
        "title": "Best dishwash gel, hands do not become dry",
        "comment": "Takes out fried food oil with one touch of sponge and hands stay moisturized."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936177/asm-shine/products/asm_dishwash_liquid_500ml.jpg",
      "publicId": "asm-shine/products/asm_dishwash_liquid_500ml",
      "alt": "ASM Shine Smart Wash Dishwash Liquid (Lemon Fresh Grease Cutting)",
      "format": "jpg",
      "bytes": 111870,
      "width": 1086,
      "height": 1448
    }
  },
  {
    "id": "asm_kitchen_1",
    "name": "ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power)",
    "shortName": "ASM Shine Kitchen Degreaser & Chimney Spray...",
    "brand": "ASM SHINE",
    "category": "kitchen_care",
    "section": "everyday_essentials",
    "size": "500 ml Foaming Trigger Spray",
    "price": 199,
    "originalPrice": 299,
    "discountPercent": 33,
    "rating": 4.8,
    "reviewCount": "1,740",
    "ratingsCount": "4,200",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
    "badge": "HEAVY DUTY",
    "inStock": true,
    "assured": true,
    "companionId": "asm_dish_1",
    "comboDiscount": 50,
    "comboSavingsPercent": 20,
    "description": "Industrial strength oil and carbon dissolver for household and commercial kitchens. Cuts through hardened chimney mesh oil, gas stove burnt grease, microwave splatters, and exhaust fan grime without abrasive scrubbing.",
    "availableSizes": [
      {
        "size": "500 ml Foaming Spray",
        "price": 199,
        "originalPrice": 299,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_multipurpose_cleaner_500ml",
          "alt": "ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power) - 500 ml Foaming Spray"
        }
      },
      {
        "size": "1 Liter Refill Pouch",
        "price": 329,
        "originalPrice": 499,
        "discount": "34% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_multipurpose_cleaner_500ml",
          "alt": "ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power) - 1 Liter Refill Pouch"
        }
      },
      {
        "size": "Twin Set (Spray + 1L Refill)",
        "price": 479,
        "originalPrice": 749,
        "discount": "36% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
          "publicId": "asm-shine/products/asm_multipurpose_cleaner_500ml",
          "alt": "ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power) - Twin Set (Spray + 1L Refill)"
        }
      }
    ],
    "highlights": [
      "Penetrates hardened cooking oil and carbon deposits in 3 minutes",
      "Self-acting clinging foam lifts grease from chimney baffle filters effortlessly",
      "Safe on stainless steel, toughened gas stove glass, ceramic backsplashes, and air fryers",
      "Non-flammable, chlorine-free and safe for indoor kitchen use",
      "Eliminates pungent rancid oil odors leaving a fresh lemon zest scent"
    ],
    "specifications": {
      "Form": "Active Penetrating Clinging Foam",
      "Fragrance": "Citrus Zest",
      "Applications": "Chimney Baffle Filters, Gas Stove Hobs, Exhaust Fans, Ovens",
      "Action Time": "3 to 5 Minutes Soak Time",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_k1_1",
        "author": "Vikas Chawla",
        "location": "Chandigarh",
        "rating": 5,
        "date": "3 days ago",
        "title": "Cleaned our kitchen chimney filters like brand new",
        "comment": "Just sprayed, waited 5 minutes, and rinsed with warm water. All black sticky grease melted away!"
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936180/asm-shine/products/asm_multipurpose_cleaner_500ml.jpg",
      "publicId": "asm-shine/products/asm_multipurpose_cleaner_500ml",
      "alt": "ASM Shine Multipurpose Kitchen & Surface Cleaner Spray (Lemon Power)",
      "format": "jpg",
      "bytes": 126495,
      "width": 1088,
      "height": 1445
    }
  },
  {
    "id": "asm_laundry_1",
    "name": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender)",
    "shortName": "ASM Shine Matic Ultra Laundry Liquid 2L...",
    "brand": "ASM SHINE",
    "category": "laundry_care",
    "section": "everyday_essentials",
    "size": "5 Liters Economy Canister",
    "price": 349,
    "originalPrice": 499,
    "discountPercent": 30,
    "rating": 4.8,
    "reviewCount": "2,110",
    "ratingsCount": "5,300",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
    "badge": "FABRIC CARE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_floor_1",
    "comboDiscount": 70,
    "comboSavingsPercent": 22,
    "description": "Advanced micro-enzyme detergent liquid engineered for both Front Load and Top Load automatic washing machines. Eliminates stubborn cuff and collar grime, tea spills, and food stains while locking in fabric brightness.",
    "availableSizes": [
      {
        "size": "1 Liter Bottle",
        "price": 199,
        "originalPrice": 280,
        "discount": "29% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "publicId": "asm-shine/products/asm_laundry_detergent_5l",
          "alt": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender) - 1 Liter Bottle"
        }
      },
      {
        "size": "2 Liters Easy-Pour Jug",
        "price": 349,
        "originalPrice": 499,
        "discount": "30% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "publicId": "asm-shine/products/asm_laundry_detergent_5l",
          "alt": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender) - 2 Liters Easy-Pour Jug"
        }
      },
      {
        "size": "5 Liters Mega Value Tub",
        "price": 799,
        "originalPrice": 1199,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
          "publicId": "asm-shine/products/asm_laundry_detergent_5l",
          "alt": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender) - 5 Liters Mega Value Tub"
        }
      }
    ],
    "highlights": [
      "Triple Enzyme Stain Lifter: Removes tea, coffee, grease & collar stains in 1 wash",
      "Dissolves 100% instantly in water with zero powdery white residue on dark fabrics",
      "Color-Lock Technology preserves vibrant fabric colors and softness",
      "Universal formula: Optimized for Front Load, Top Load, and Hand Wash",
      "Infused with Parisian Spring Flower long-lasting fragrance encapsulation"
    ],
    "specifications": {
      "Form": "Low-Foam Concentrated Liquid Detergent",
      "Fragrance": "Parisian Spring Blossom",
      "Machine Type": "Front Load, Top Load & Semi-Automatic",
      "Dosage": "1 Measuring Cap (60ml) per standard 6-8 kg load",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_l1_1",
        "author": "Deepika Rao",
        "location": "Hyderabad, Telangana",
        "rating": 5,
        "date": "6 days ago",
        "title": "Clothes smell amazing even after 3 days",
        "comment": "No white residue on black shirts. Truly high-performance liquid detergent."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936181/asm-shine/products/asm_laundry_detergent_5l.jpg",
      "publicId": "asm-shine/products/asm_laundry_detergent_5l",
      "alt": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender)",
      "format": "jpg",
      "bytes": 123146,
      "width": 1122,
      "height": 1402
    }
  },
  {
    "id": "asm_hand_1",
    "name": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care)",
    "shortName": "ASM Shine PureShield Antibacterial Handwash 1.5L...",
    "brand": "ASM SHINE",
    "category": "hand_hygiene",
    "section": "recommended",
    "size": "1.5 Liters Value Refill Pouch",
    "price": 179,
    "originalPrice": 260,
    "discountPercent": 31,
    "rating": 4.9,
    "reviewCount": "1,920",
    "ratingsCount": "4,800",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
    "badge": "MOISTURIZING",
    "inStock": true,
    "assured": true,
    "companionId": "asm_glass_1",
    "comboDiscount": 40,
    "comboSavingsPercent": 18,
    "description": "Dermatologist recommended antibacterial hand wash that kills 99.9% of harmful germs while providing 10x moisture. Infused with pure Aloe Vera gel, Tea Tree extract, and Vitamin E to prevent dryness from frequent washing.",
    "availableSizes": [
      {
        "size": "250 ml Pump Dispenser",
        "price": 79,
        "originalPrice": 110,
        "discount": "28% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
          "publicId": "asm-shine/products/asm_handwash_lavender_500ml",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care) - 250 ml Pump Dispenser"
        }
      },
      {
        "size": "500 ml Pump Dispenser",
        "price": 129,
        "originalPrice": 185,
        "discount": "30% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
          "publicId": "asm-shine/products/asm_handwash_lavender_500ml",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care) - 500 ml Pump Dispenser"
        }
      },
      {
        "size": "1.5 Liters Value Refill Pouch",
        "price": 179,
        "originalPrice": 260,
        "discount": "31% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
          "publicId": "asm-shine/products/asm_handwash_lavender_2kg",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care) - 1.5 Liters Value Refill Pouch"
        }
      },
      {
        "size": "2 kg Value Refill Jug",
        "price": 249,
        "originalPrice": 380,
        "discount": "34% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936186/asm-shine/products/asm_handwash_lavender_2kg.jpg",
          "publicId": "asm-shine/products/asm_handwash_lavender_2kg",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care) - 2 kg Value Refill Jug"
        }
      }
    ],
    "highlights": [
      "99.9% Germ Protection in 10 seconds of lathering",
      "Enriched with organic Aloe Vera, Vitamin E, and Glycerin moisturizing complex",
      "pH 5.5 skin-balanced formula leaves hands silky soft without tightness",
      "Free from harmful Parabens, SLS, Triclosan, and Phthalates",
      "Luxurious creamy lather with fresh Green Apple & Tea Tree fragrance"
    ],
    "specifications": {
      "Form": "Rich Foaming Pearlescent Liquid",
      "Fragrance": "Crisp Green Apple & Herbal Tea Tree",
      "Skin Type": "All Skin Types, Safe for Sensitive & Children's Hands",
      "pH Level": "5.5 Skin Balanced",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_h1_1",
        "author": "Dr. Neeraj Bansal",
        "location": "Lucknow, UP",
        "rating": 5,
        "date": "1 week ago",
        "title": "Very soft on hands, great germicidal action",
        "comment": "Being a doctor I wash my hands 20 times a day. This handwash prevents drying and smells refreshing."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936184/asm-shine/products/asm_handwash_lavender_500ml.jpg",
      "publicId": "asm-shine/products/asm_handwash_lavender_500ml",
      "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Lavender Care)",
      "format": "jpg",
      "bytes": 128890,
      "width": 1088,
      "height": 1445
    }
  },
  {
    "id": "asm_pine_1",
    "name": "ASM Shine White Floor Cleaner (Clean Floors, Brighter Homes)",
    "shortName": "ASM Shine Herbal White Pine Phenyle 5L...",
    "brand": "ASM SHINE",
    "category": "floor_care",
    "section": "recommended",
    "size": "1 Liter Bottle",
    "price": 399,
    "originalPrice": 599,
    "discountPercent": 33,
    "rating": 4.7,
    "reviewCount": "1,640",
    "ratingsCount": "3,900",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
    "badge": "HERBAL PINE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_toilet_1",
    "comboDiscount": 70,
    "comboSavingsPercent": 24,
    "description": "Traditional high-power white phenyle infused with natural Pine Oil, Citronella, and Eucalyptus. Cleans, sanitizes, and naturally repels flies, mosquitoes, and insects from floors, corridors, and verandas.",
    "availableSizes": [
      {
        "size": "1 Liter Bottle",
        "price": 99,
        "originalPrice": 145,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_white_floor_cleaner_1l",
          "alt": "ASM Shine White Floor Cleaner (Clean Floors, Brighter Homes) - 1 Liter Bottle"
        }
      },
      {
        "size": "5 Liters Master Can",
        "price": 399,
        "originalPrice": 599,
        "discount": "33% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
          "publicId": "asm-shine/products/asm_white_floor_cleaner_1l",
          "alt": "ASM Shine White Floor Cleaner (Clean Floors, Brighter Homes) - 5 Liters Master Can"
        }
      }
    ],
    "highlights": [
      "Pure Pine Oil concentrate creates thick snowy-white milky emulsion in water",
      "Natural mosquito, housefly, and insect repellent action with Citronella",
      "Powerful odor neutralizer for drainage areas, basements, and porches",
      "Effective germicidal action on all washable hard flooring surfaces"
    ],
    "specifications": {
      "Form": "Concentrated Milky Pine Emulsion",
      "Fragrance": "Fresh Natural Pine Forest",
      "Active": "Pure Grade 1 Pine Essential Oil",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_p1_1",
        "author": "Gaurav Sen",
        "location": "Patna, Bihar",
        "rating": 5,
        "date": "10 days ago",
        "title": "Keeps houseflies away completely",
        "comment": "Very strong natural pine scent and repels insects from the courtyard."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936187/asm-shine/products/asm_white_floor_cleaner_1l.jpg",
      "publicId": "asm-shine/products/asm_white_floor_cleaner_1l",
      "alt": "ASM Shine White Floor Cleaner (Clean Floors, Brighter Homes)",
      "format": "jpg",
      "bytes": 72093,
      "width": 947,
      "height": 1600
    }
  },
  {
    "id": "asm_drain_1",
    "name": "ASM Shine RapidAction Drain Unclogger & Odor Eliminator Gel",
    "shortName": "ASM Shine RapidAction Drain Unclogger 500ml...",
    "brand": "ASM SHINE",
    "category": "bathroom_care",
    "section": "recommended",
    "size": "500 ml Heavy Gel",
    "price": 149,
    "originalPrice": 220,
    "discountPercent": 32,
    "rating": 4.8,
    "reviewCount": "1,290",
    "ratingsCount": "3,100",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
    "badge": "INSTANT SINK CLOG FIX",
    "inStock": true,
    "assured": true,
    "companionId": "asm_bath_1",
    "comboDiscount": 40,
    "comboSavingsPercent": 18,
    "description": "Thick heavy-density sink gel that sinks through standing water straight to the blockage. Dissolves trapped hair, soap scum, grease, and food sludge in kitchen sinks, washbasins, and shower drains in just 15 minutes.",
    "availableSizes": [
      {
        "size": "500 ml Bottle",
        "price": 149,
        "originalPrice": 220,
        "discount": "32% off"
      },
      {
        "size": "Pack of 2 (500ml x 2)",
        "price": 269,
        "originalPrice": 440,
        "discount": "39% off"
      }
    ],
    "highlights": [
      "Heavy density gel cuts through standing water directly to the clog",
      "Dissolves hair clumps, cooking grease, and soap scum in 15 minutes",
      "Safe for all PVC pipes, septic systems, and chrome drain covers",
      "Eliminates foul drain odors and sewage gasses permanently"
    ],
    "specifications": {
      "Form": "High-Density Clog-Penetrating Caustic Gel",
      "Action Time": "15 - 30 Minutes",
      "Compatibility": "PVC, Cast Iron, ABS Plastic, Septic Tanks",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_dr_1",
        "author": "Sanjay Verma",
        "location": "Delhi NCR",
        "rating": 5,
        "date": "2 weeks ago",
        "title": "Unclogged kitchen sink in 15 mins",
        "comment": "Water was overflowing in the sink. Poured half a bottle, waited 15 minutes, flushed with hot water and problem was solved."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936165/asm-shine/products/asm_tile_cleaner_500ml.jpg",
      "publicId": "asm-shine/products/asm_tile_cleaner_500ml",
      "alt": "ASM Shine RapidAction Drain Unclogger & Odor Eliminator Gel",
      "format": "jpg",
      "bytes": 74867,
      "width": 1200,
      "height": 1600
    }
  },
  {
    "id": "asm_floor_apple",
    "name": "ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant",
    "shortName": "ASM Shine Green Apple Floor Cleaner 1L...",
    "brand": "ASM SHINE",
    "category": "floor_care",
    "section": "everyday_essentials",
    "size": "1 Liter Bottle",
    "price": 149,
    "originalPrice": 219,
    "discountPercent": 32,
    "rating": 4.8,
    "reviewCount": "2,150",
    "ratingsCount": "5,120",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
    "badge": "NATURAL APPLE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_floor_1",
    "comboDiscount": 45,
    "comboSavingsPercent": 18,
    "description": "Enriched with natural green apple extracts. Delivers high-gloss shine, hospital-grade germ defense, and long-lasting freshness on marble, tiles, granite, and mosaic.",
    "availableSizes": [
      {
        "size": "500 ml Bottle",
        "price": 99,
        "originalPrice": 145,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936192/asm-shine/products/asm_floor_cleaner_apple_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936192/asm-shine/products/asm_floor_cleaner_apple_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936192/asm-shine/products/asm_floor_cleaner_apple_500ml.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_apple_500ml",
          "alt": "ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant - 500 ml Bottle"
        }
      },
      {
        "size": "1 Liter Bottle",
        "price": 149,
        "originalPrice": 219,
        "discount": "32% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_apple_1l",
          "alt": "ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant - 1 Liter Bottle"
        }
      },
      {
        "size": "5 Liters Jumbo Can",
        "price": 579,
        "originalPrice": 899,
        "discount": "36% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
          "publicId": "asm-shine/products/asm_floor_cleaner_apple_1l",
          "alt": "ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant - 5 Liters Jumbo Can"
        }
      }
    ],
    "highlights": [
      "Natural Green Apple Extract formulation",
      "99.9% Germ Defense certified laboratory tested",
      "Leaves zero sticky streaks on tiles & Italian marble",
      "Child & pet safe formulation"
    ],
    "specifications": {
      "Form": "Concentrated Disinfectant Liquid",
      "Fragrance": "Crisp Green Apple",
      "Surfaces": "Vitrified Tiles, Marble, Granite, Ceramic",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_fa_1",
        "author": "Kavita Singhal",
        "location": "Delhi",
        "rating": 5,
        "date": "3 days ago",
        "title": "Fresh green apple fragrance",
        "comment": "Leaves floor shining and smelling so clean."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936189/asm-shine/products/asm_floor_cleaner_apple_1l.jpg",
      "publicId": "asm-shine/products/asm_floor_cleaner_apple_1l",
      "alt": "ASM Shine Green Apple Surface & Floor Cleaner Liquid Disinfectant",
      "format": "jpg",
      "bytes": 100660,
      "width": 1200,
      "height": 1600
    }
  },
  {
    "id": "asm_hand_rose",
    "name": "ASM Shine PureShield Antibacterial Liquid Handwash (Rose Care)",
    "shortName": "ASM Shine PureShield Rose Handwash 500ml...",
    "brand": "ASM SHINE",
    "category": "hand_hygiene",
    "section": "recommended",
    "size": "500 ml Pump Bottle",
    "price": 129,
    "originalPrice": 185,
    "discountPercent": 30,
    "rating": 4.9,
    "reviewCount": "1,420",
    "ratingsCount": "3,650",
    "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
    "badge": "ROSE CARE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_hand_1",
    "comboDiscount": 35,
    "comboSavingsPercent": 16,
    "description": "Gentle foaming rose hand wash infused with natural rose extracts and moisturizers. Kills 99.9% germs while keeping hands smooth, soft, and delicately perfumed.",
    "availableSizes": [
      {
        "size": "500 ml Pump Dispenser",
        "price": 129,
        "originalPrice": 185,
        "discount": "30% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
          "publicId": "asm-shine/products/asm_handwash_rose_500ml",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Rose Care) - 500 ml Pump Dispenser"
        }
      },
      {
        "size": "2 Liters Refill Jug",
        "price": 249,
        "originalPrice": 380,
        "discount": "34% off",
        "image": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936195/asm-shine/products/asm_handwash_rose_2l.jpg",
        "imageData": {
          "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936195/asm-shine/products/asm_handwash_rose_2l.jpg",
          "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936195/asm-shine/products/asm_handwash_rose_2l.jpg",
          "publicId": "asm-shine/products/asm_handwash_rose_2l",
          "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Rose Care) - 2 Liters Refill Jug"
        }
      }
    ],
    "highlights": [
      "Infused with Pure Rose Water & Moisturizing Glycerin",
      "Kills 99.9% germs in 10 seconds of washing",
      "pH 5.5 skin-balanced gentle care",
      "Free from Parabens & harsh chemicals"
    ],
    "specifications": {
      "Form": "Pearlescent Foaming Liquid",
      "Fragrance": "Natural Fresh Rose Blossom",
      "Skin Type": "All Skin Types, Soft on Hands",
      "Shelf Life": "24 Months",
      "Manufactured By": "ASM Shine Hygiene Labs Pvt Ltd"
    },
    "reviews": [
      {
        "id": "rev_hr_1",
        "author": "Preeti Goyal",
        "location": "Jaipur",
        "rating": 5,
        "date": "1 week ago",
        "title": "Hands feel so smooth",
        "comment": "The rose scent is very natural and does not dry out hands even after repeated use."
      }
    ],
    "imageData": {
      "url": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
      "secureUrl": "https://res.cloudinary.com/dheyj35ys/image/upload/v1792936193/asm-shine/products/asm_handwash_rose_500ml.jpg",
      "publicId": "asm-shine/products/asm_handwash_rose_500ml",
      "alt": "ASM Shine PureShield Antibacterial Liquid Handwash (Rose Care)",
      "format": "jpg",
      "bytes": 133336,
      "width": 1024,
      "height": 1536
    }
  }
];

// Storage Keys
const STORAGE_GUEST_CART_KEY = 'asm_shine_guest_cart_v1';
const STORAGE_GUEST_WISHLIST_KEY = 'asm_shine_guest_wishlist_v1';

// Helper to get guest cart from localStorage (defaults to clean empty array, NO fake default items)
const getStoredGuestCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const saveStoredGuestCart = (cart) => {
  try {
    localStorage.setItem(STORAGE_GUEST_CART_KEY, JSON.stringify(cart));
  } catch (e) {}
};

const clearStoredGuestCart = () => {
  try {
    localStorage.removeItem(STORAGE_GUEST_CART_KEY);
  } catch (e) {}
};

// Helper to get guest wishlist from localStorage
const getStoredGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const saveStoredGuestWishlist = (list) => {
  try {
    localStorage.setItem(STORAGE_GUEST_WISHLIST_KEY, JSON.stringify(list));
  } catch (e) {}
};

const clearStoredGuestWishlist = () => {
  try {
    localStorage.removeItem(STORAGE_GUEST_WISHLIST_KEY);
  } catch (e) {}
};

// Helper to calculate full details for guest items from live catalog
const calculateGuestCartFullDetails = async (rawItems = []) => {
  let allProducts = [];
  try {
    allProducts = await api.getProducts();
  } catch (e) {
    allProducts = STATIC_PRODUCTS;
  }

  let totalMRP = 0;
  let totalPrice = 0;
  let totalCount = 0;

  const items = rawItems
    .map((item) => {
      const pid = item.productId;
      const product = allProducts.find((p) => p.id === pid || p._id === pid);
      if (!product) return null;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      let unitPrice = product.price;
      let unitMRP = product.originalPrice || product.price;
      let selectedImage = product.image;

      if (item.size && Array.isArray(product.availableSizes)) {
        const sizeVariant = product.availableSizes.find(
          (s) => s.size.toLowerCase() === item.size.toLowerCase()
        );
        if (sizeVariant) {
          if (sizeVariant.price) unitPrice = sizeVariant.price;
          if (sizeVariant.originalPrice) unitMRP = sizeVariant.originalPrice;
          if (sizeVariant.image) selectedImage = sizeVariant.image;
        }
      }

      const itemMRP = unitMRP * qty;
      const itemTotal = unitPrice * qty;
      const itemSavings = itemMRP - itemTotal;

      totalMRP += itemMRP;
      totalPrice += itemTotal;
      totalCount += qty;

      return {
        productId: product.id || pid,
        size: item.size || '',
        quantity: qty,
        product: {
          ...product,
          price: unitPrice,
          originalPrice: unitMRP,
          image: selectedImage
        },
        itemMRP,
        itemTotal,
        itemSavings
      };
    })
    .filter(Boolean);

  const totalDiscount = Math.max(0, totalMRP - totalPrice);

  return {
    items,
    data: items,
    totalCount,
    totalMRP,
    totalPrice,
    totalDiscount
  };
};

// Base API configuration (Supports Vercel & Render production hosting)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
  ? String(import.meta.env.VITE_API_URL).trim() 
  : '').replace(/\/$/, '');

const getAuthHeaders = (extraHeaders = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cleanora_token') : null;
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const apiFetch = (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: getAuthHeaders(options.headers || {}),
    credentials: 'include'
  });
};

// API Service Layer (Connected to Express REST API & MongoDB Database)
export const api = {
  // -------------------------------------------------------------
  // Authentication Endpoints (Phase 3)
  // -------------------------------------------------------------
  register: async ({ name, email, password }) => {
    const res = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  login: async ({ email, password }) => {
    const res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  googleAuth: async (credential) => {
    const res = await apiFetch('/api/v1/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ credential })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Google sign-in failed');
    }
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('cleanora_token', data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      const res = await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await res.json().catch(() => ({}));
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cleanora_token');
      }
      return data;
    } catch (e) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cleanora_token');
      }
      return { success: true };
    }
  },

  getCurrentUser: async () => {
    const res = await apiFetch('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.status === 401) {
      return null;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch current user profile');
    }
    return data.user || null;
  },

  // Email OTP Signup Endpoints
  sendSignupOtp: async ({ name, email, password }) => {
    const res = await apiFetch('/api/v1/auth/signup/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to send verification code');
      err.cooldownRemaining = data.cooldownRemaining;
      throw err;
    }
    return data;
  },

  verifySignupOtp: async ({ email, otp }) => {
    const res = await apiFetch('/api/v1/auth/signup/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Verification failed');
    }
    return data;
  },

  resendSignupOtp: async (email) => {
    const res = await apiFetch('/api/v1/auth/signup/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to resend code');
      err.cooldownRemaining = data.cooldownRemaining;
      throw err;
    }
    return data;
  },

  // Account Profile & Address API
  updateProfile: async ({ name, phone }) => {
    const res = await apiFetch('/api/v1/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, phone })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data.user;
  },

  getAddresses: async () => {
    const res = await apiFetch('/api/v1/auth/addresses', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch addresses');
    }
    return data.data || [];
  },

  addAddress: async (addressData) => {
    const res = await apiFetch('/api/v1/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(addressData)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save address');
    }
    return data.data;
  },

  deleteAddress: async (addressId) => {
    const res = await apiFetch(`/api/v1/auth/addresses/${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete address');
    }
    return data.data;
  },

  getOrders: async () => {
    const res = await apiFetch('/api/v1/auth/orders', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }
    return data.data || [];
  },

  // Fetch all products with optional category & search filter from real Express/MongoDB API
  getProducts: async ({ category, search } = {}) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiFetch(`/api/v1/products${queryString}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          return result.data;
        }
      }
    } catch (e) {
      // Gracefully fall back to local catalog
    }

    // High availability fallback matching live schema
    return STATIC_PRODUCTS.filter((p) => {
      if (category && category !== 'all' && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  },

  // Get single product by ID from real Express/MongoDB API
  getProductById: async (id) => {
    if (!id) return null;
    try {
      const res = await apiFetch(`/api/v1/products/${encodeURIComponent(id)}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.status === 404) {
        return STATIC_PRODUCTS.find((p) => p.id === id) || null;
      }

      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          return result.data;
        }
      }
    } catch (e) {
      // Gracefully fall back to static product record
    }

    return STATIC_PRODUCTS.find((p) => p.id === id) || null;
  },

  // Get similar products
  getSimilarProducts: async (productId, category) => {
    try {
      const products = await api.getProducts({ category });
      const others = products.filter((p) => p.id !== productId);
      if (others.length >= 3) return others.slice(0, 4);

      const all = await api.getProducts();
      return all.filter((p) => p.id !== productId).slice(0, 4);
    } catch (e) {
      return [];
    }
  },

  // Get combo details for Frequently Bought Together
  getComboDetails: async (productId) => {
    try {
      const mainProduct = await api.getProductById(productId);
      if (!mainProduct) return null;

      let companionProduct = null;
      if (mainProduct.companionId) {
        companionProduct = await api.getProductById(mainProduct.companionId);
      }
      if (!companionProduct) {
        const all = await api.getProducts();
        companionProduct = all.find((p) => p.id !== productId) || null;
      }
      if (!companionProduct) return null;

      const combinedOriginal = (mainProduct.originalPrice || mainProduct.price) + (companionProduct.originalPrice || companionProduct.price);
      const combinedStandardPrice = mainProduct.price + companionProduct.price;
      const discount = mainProduct.comboDiscount || 50;
      const comboPrice = Math.max(combinedStandardPrice - discount, 149);
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
    } catch (e) {
      return null;
    }
  },

  // Fetch categories from real Express/MongoDB API
  getCategories: async () => {
    try {
      const res = await apiFetch('/api/v1/categories', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          return result.data;
        }
      }
    } catch (e) {
      // Gracefully fall back to static categories
    }

    return STATIC_CATEGORIES;
  },

  // Fetch banners & offer strip data from live Express/MongoDB API
  getBanners: async () => {
    try {
      const res = await apiFetch('/api/v1/banners', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) return result.data;
      }
    } catch (e) {
      console.warn('[API] Backend banners fetch failed, fallback to static:', e.message);
    }
    return STATIC_BANNERS;
  },

  // -------------------------------------------------------------
  // Persistent Cart API (MongoDB Per-User + Guest Scoped Storage)
  // -------------------------------------------------------------

  // Get current Cart summary
  getCart: async () => {
    try {
      const res = await apiFetch('/api/v1/cart', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          return {
            totalCount: data.totalCount || 0,
            data: data.items || data.data || []
          };
        }
      }
    } catch (e) {
      // Unauthenticated or offline: fallback to guest storage
    }

    const items = getStoredGuestCart();
    const count = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
    return {
      totalCount: count,
      data: items
    };
  },

  // Get fully populated cart with live database prices and totals
  getCartFullDetails: async () => {
    try {
      const res = await apiFetch('/api/v1/cart', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.items)) {
          return data;
        }
      }
    } catch (e) {
      // Unauthenticated or offline: fallback to guest calculation
    }

    const rawGuestItems = getStoredGuestCart();
    return calculateGuestCartFullDetails(rawGuestItems);
  },

  // Add single item to cart
  addToCart: async (productId, quantity = 1, size = '') => {
    try {
      const res = await apiFetch('/api/v1/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity, size })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Unauthenticated: fallback to guest storage
    }

    const cart = getStoredGuestCart();
    const existing = cart.find(
      (item) => item.productId === productId && (item.size || '') === (size || '')
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity, size: size || '' });
    }
    saveStoredGuestCart(cart);
    return calculateGuestCartFullDetails(cart);
  },

  // Update item quantity
  updateCartQuantity: async (productId, quantity, size = '') => {
    try {
      const res = await apiFetch('/api/v1/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity, size })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Unauthenticated: fallback to guest storage
    }

    let cart = getStoredGuestCart();
    if (quantity <= 0) {
      cart = cart.filter(
        (item) => !(item.productId === productId && (item.size || '') === (size || ''))
      );
    } else {
      const existing = cart.find(
        (item) => item.productId === productId && (item.size || '') === (size || '')
      );
      if (existing) {
        existing.quantity = quantity;
      } else {
        cart.push({ productId, quantity, size: size || '' });
      }
    }
    saveStoredGuestCart(cart);
    return calculateGuestCartFullDetails(cart);
  },

  // Remove single item from cart
  removeFromCart: async (productId, size = '') => {
    try {
      const query = size ? `?size=${encodeURIComponent(size)}` : '';
      const res = await apiFetch(`/api/v1/cart/remove/${encodeURIComponent(productId)}${query}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Unauthenticated: fallback to guest storage
    }

    let cart = getStoredGuestCart().filter(
      (item) => !(item.productId === productId && (!size || (item.size || '') === size))
    );
    saveStoredGuestCart(cart);
    return calculateGuestCartFullDetails(cart);
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      await apiFetch('/api/v1/cart/clear', {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
    } catch (e) {}

    clearStoredGuestCart();
    return {
      success: true,
      totalCount: 0,
      items: [],
      data: [],
      totalMRP: 0,
      totalPrice: 0,
      totalDiscount: 0
    };
  },

  // Add multiple items (Combo) to cart
  addComboToCart: async (items = []) => {
    for (const item of items) {
      await api.addToCart(item.productId, item.quantity || 1, item.size || '');
    }
    return api.getCartFullDetails();
  },

  // Merge guest cart items into authenticated user's MongoDB cart upon login
  syncCart: async (guestItems = []) => {
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return api.getCartFullDetails();
    }
    const res = await apiFetch('/api/v1/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ items: guestItems })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync cart with server.');
    }
    clearStoredGuestCart();
    return res.json();
  },

  // -------------------------------------------------------------
  // Persistent Wishlist API
  // -------------------------------------------------------------

  getWishlist: async () => {
    try {
      const res = await apiFetch('/api/v1/auth/wishlist', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        return data.wishlist || [];
      }
    } catch (e) {}
    return getStoredGuestWishlist();
  },

  toggleWishlist: async (productId) => {
    try {
      const res = await apiFetch('/api/v1/auth/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Guest fallback
    let list = getStoredGuestWishlist();
    const exists = list.includes(productId);
    if (exists) {
      list = list.filter((id) => id !== productId);
    } else {
      list.push(productId);
    }
    saveStoredGuestWishlist(list);
    return {
      success: true,
      inWishlist: !exists,
      wishlist: list
    };
  },

  syncWishlist: async (productIds = []) => {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return api.getWishlist();
    }
    const res = await apiFetch('/api/v1/auth/wishlist/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productIds })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync wishlist with server.');
    }
    clearStoredGuestWishlist();
    return res.json();
  },

  // -------------------------------------------------------------
  // Genuine Order Management API (MongoDB Backed)
  // -------------------------------------------------------------

  createOrder: async (orderPayload) => {
    const res = await apiFetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Failed to create order (HTTP ${res.status})`);
    }
    return data;
  },

  getOrders: async () => {
    const res = await apiFetch('/api/v1/orders', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch order history');
    }
    return data.orders || data.data || [];
  },

  getOrderById: async (orderId) => {
    const res = await apiFetch(`/api/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch order details');
    }
    return data.order || null;
  },

  // Guest Storage Helpers
  getGuestCartItems: getStoredGuestCart,
  getGuestCartFullDetails: () => calculateGuestCartFullDetails(getStoredGuestCart()),
  clearGuestCart: clearStoredGuestCart,
  getGuestWishlistItems: getStoredGuestWishlist,
  clearGuestWishlist: clearStoredGuestWishlist
};
