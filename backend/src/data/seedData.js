// ASM SHINE - Backend Seed Data (Products, Categories, Banners, Initial Cart)

const initialProducts = [
  // 1. Ultra Power Toilet Cleaner (Harpic Style)
  {
    "id": "asm_toilet_1",
    "name": "ASM Shine Ultra Power Disinfectant Toilet Cleaner (Thick Blue Gel)",
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
    "image": "/images/products/product_disinfectant.png",
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
        "discount": "26% off"
      },
      {
        "size": "1 Liter Power Pack",
        "price": 189,
        "originalPrice": 260,
        "discount": "27% off"
      },
      {
        "size": "Twin Pack (1L x 2)",
        "price": 349,
        "originalPrice": 520,
        "discount": "33% off"
      },
      {
        "size": "5 Liter Economy Can",
        "price": 699,
        "originalPrice": 1050,
        "discount": "33% off"
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
    ]
  },

  // 2. Crystal Clear Glass & Surface Cleaner (Colin Style)
  {
    "id": "asm_glass_1",
    "name": "ASM Shine Crystal Clear Glass & Multi-Surface Cleaner Spray (Colin Power)",
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
    "image": "/images/products/product_glass_cleaner.png",
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
        "discount": "28% off"
      },
      {
        "size": "1 Liter Refill Pouch",
        "price": 179,
        "originalPrice": 250,
        "discount": "28% off"
      },
      {
        "size": "Twin Pack (500ml Spray + 1L Refill)",
        "price": 279,
        "originalPrice": 415,
        "discount": "33% off"
      },
      {
        "size": "5 Liter Bulk Can",
        "price": 599,
        "originalPrice": 899,
        "discount": "33% off"
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
    ]
  },

  // 3. Heavy-Duty Bathroom & Tiles Cleaner Descaler
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
    "image": "/images/products/product_bathroom_cleaner.png",
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
        "discount": "28% off"
      },
      {
        "size": "1 Liter Deep Clean Pack",
        "price": 179,
        "originalPrice": 249,
        "discount": "28% off"
      },
      {
        "size": "Pack of 2 (1L x 2)",
        "price": 329,
        "originalPrice": 498,
        "discount": "34% off"
      },
      {
        "size": "5 Liter Master Can",
        "price": 679,
        "originalPrice": 999,
        "discount": "32% off"
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
    ]
  },

  // 4. Citrus Fresh Surface & Floor Cleaner Liquid Disinfectant
  {
    "id": "asm_floor_1",
    "name": "ASM Shine Citrus Fresh Surface & Floor Cleaner Liquid Disinfectant",
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
    "image": "/images/products/product_floor_cleaner.png",
    "badge": "FAMILY FAVORITE",
    "inStock": true,
    "assured": true,
    "companionId": "asm_toilet_1",
    "comboDiscount": 60,
    "comboSavingsPercent": 22,
    "description": "All-in-one floor sanitizing formula that delivers spotless shine with hospital-grade disinfection. Dissolves sticky food spills, muddy paw marks, and greasy footwear grime across marble, granite, mosaic, and vitrified tiles.",
    "availableSizes": [
      {
        "size": "1 Liter Bottle",
        "price": 149,
        "originalPrice": 219,
        "discount": "32% off"
      },
      {
        "size": "2 Liters Family Pack",
        "price": 269,
        "originalPrice": 399,
        "discount": "33% off"
      },
      {
        "size": "5 Liters Jumbo Can",
        "price": 579,
        "originalPrice": 899,
        "discount": "36% off"
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
    ]
  },

  // 5. Turbo Lemon Concentrated Dishwash Gel (Anti-Grease)
  {
    "id": "asm_dish_1",
    "name": "ASM Shine Turbo Lemon Concentrated Dishwash Gel (Anti-Grease)",
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
    "image": "/images/products/product_dishwash_gel.png",
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
        "discount": "29% off"
      },
      {
        "size": "1 Liter Dispenser Pack",
        "price": 149,
        "originalPrice": 210,
        "discount": "29% off"
      },
      {
        "size": "2 Liters Value Refill",
        "price": 269,
        "originalPrice": 390,
        "discount": "31% off"
      },
      {
        "size": "5 Liters Commercial Can",
        "price": 549,
        "originalPrice": 850,
        "discount": "35% off"
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
    ]
  },

  // 6. Kitchen Degreaser & Chimney Oil Stain Cleaner Spray
  {
    "id": "asm_kitchen_1",
    "name": "ASM Shine Kitchen Degreaser & Chimney Oil Stain Cleaner Spray",
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
    "image": "/images/products/product_disinfectant.png",
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
        "discount": "33% off"
      },
      {
        "size": "1 Liter Refill Pouch",
        "price": 329,
        "originalPrice": 499,
        "discount": "34% off"
      },
      {
        "size": "Twin Set (Spray + 1L Refill)",
        "price": 479,
        "originalPrice": 749,
        "discount": "36% off"
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
    ]
  },

  // 7. Matic Ultra Laundry Detergent Liquid
  {
    "id": "asm_laundry_1",
    "name": "ASM Shine Matic Ultra Laundry Detergent Liquid (Stain Defender)",
    "shortName": "ASM Shine Matic Ultra Laundry Liquid 2L...",
    "brand": "ASM SHINE",
    "category": "laundry_care",
    "section": "everyday_essentials",
    "size": "2 Liters Concentrated Jug",
    "price": 349,
    "originalPrice": 499,
    "discountPercent": 30,
    "rating": 4.8,
    "reviewCount": "2,110",
    "ratingsCount": "5,300",
    "image": "/images/products/product_laundry_liquid.png",
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
        "discount": "29% off"
      },
      {
        "size": "2 Liters Easy-Pour Jug",
        "price": 349,
        "originalPrice": 499,
        "discount": "30% off"
      },
      {
        "size": "5 Liters Mega Value Tub",
        "price": 799,
        "originalPrice": 1199,
        "discount": "33% off"
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
    ]
  },

  // 8. PureShield Antibacterial Liquid Handwash
  {
    "id": "asm_hand_1",
    "name": "ASM Shine PureShield Antibacterial Liquid Handwash (Aloe & Vitamin E)",
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
    "image": "/images/products/product_dishwash_gel.png",
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
        "discount": "28% off"
      },
      {
        "size": "750 ml Refill Pack",
        "price": 119,
        "originalPrice": 175,
        "discount": "32% off"
      },
      {
        "size": "1.5 Liters Value Refill Pouch",
        "price": 179,
        "originalPrice": 260,
        "discount": "31% off"
      },
      {
        "size": "5 Liters Institutional Can",
        "price": 499,
        "originalPrice": 799,
        "discount": "38% off"
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
    ]
  },

  // 9. Herbal White Pine Phenyle Floor Sanitizer (Insect Repellent)
  {
    "id": "asm_pine_1",
    "name": "ASM Shine Herbal White Pine Phenyle Floor Sanitizer (Insect Repellent)",
    "shortName": "ASM Shine Herbal White Pine Phenyle 5L...",
    "brand": "ASM SHINE",
    "category": "floor_care",
    "section": "recommended",
    "size": "5 Liters Master Value Canister",
    "price": 399,
    "originalPrice": 599,
    "discountPercent": 33,
    "rating": 4.7,
    "reviewCount": "1,640",
    "ratingsCount": "3,900",
    "image": "/images/products/product_floor_cleaner.png",
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
        "discount": "32% off"
      },
      {
        "size": "5 Liters Master Can",
        "price": 399,
        "originalPrice": 599,
        "discount": "33% off"
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
    ]
  },

  // 10. RapidAction Drain Unclogger & Odor Eliminator Gel
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
    "image": "/images/products/product_bathroom_cleaner.png",
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
    ]
  }
];

const initialCategories = [
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

const initialBanners = {
  "announcement": {
    "text": "✨ ASM Shine Mega Home Hygiene Fest: Flat 25% OFF with code SHINE25 | Free Doorstep Express Delivery",
    "code": "SHINE25",
    "discount": "25% OFF"
  },
  "heroSlides": [
    {
      "id": "slide_1",
      "badge": "POWER TOILET CARE",
      "tag": "FLAT 27% OFF",
      "title": "ASM Shine Ultra Power Toilet Cleaner",
      "subtitle": "10x Tough Limescale Remover • 99.9% Germ Destruction • Ocean Breeze",
      "priceText": "From ₹189 (MRP ₹260)",
      "ctaText": "SHOP TOILET CARE",
      "productId": "asm_toilet_1",
      "image": "/images/banners/hero_banner_photo.png"
    },
    {
      "id": "slide_2",
      "badge": "STREAK-FREE COLIN POWER",
      "tag": "FLAT 28% OFF",
      "title": "ASM Shine Crystal Clear Glass Cleaner",
      "subtitle": "Anti-Dust Shield • 100% Streak-Free Clarity for Mirrors, Tables & Car Glass",
      "priceText": "From ₹119 (MRP ₹165)",
      "ctaText": "SHOP GLASS CARE",
      "productId": "asm_glass_1",
      "image": "/images/products/product_glass_cleaner.png"
    },
    {
      "id": "slide_3",
      "badge": "HARD WATER SPECIALIST",
      "tag": "FLAT 28% OFF",
      "title": "ASM Shine Ceramic Tiles & Bathroom Descaler",
      "subtitle": "Eliminates Stubborn Limescale & Yellow Water Stains Without Choking Fumes",
      "priceText": "From ₹179 (MRP ₹249)",
      "ctaText": "SHOP BATHROOM",
      "productId": "asm_bath_1",
      "image": "/images/products/product_bathroom_cleaner.png"
    },
    {
      "id": "slide_4",
      "badge": "CITRUS DISINFECTANT",
      "tag": "MEGA 2L FAMILY PACK",
      "title": "ASM Shine Citrus Fresh Surface & Floor Cleaner",
      "subtitle": "Hospital-Grade Antimicrobial • High-Gloss Mirror Reflection For Vitrified Tiles",
      "priceText": "From ₹269 (MRP ₹399)",
      "ctaText": "SHOP FLOOR CARE",
      "productId": "asm_floor_1",
      "image": "/images/products/product_floor_cleaner.png"
    }
  ],
  "hero": {
    "badge": "ASM SHINE OFFICIAL STORE",
    "title": "Spotless Clean, Sparkling Shine",
    "subtitle": "Complete Range of High-Performance Home, Kitchen & Bathroom Cleaning Essentials",
    "ctaText": "EXPLORE ALL CLEANERS",
    "image": "/images/banners/hero_banner_photo.png"
  }
};

const initialCart = [
  { productId: 'asm_toilet_1', quantity: 1 },
  { productId: 'asm_glass_1', quantity: 1 }
];

module.exports = { initialProducts, initialCategories, initialBanners, initialCart };
