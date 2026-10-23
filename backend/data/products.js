export const CATEGORIES = [
  { id: 'all', label: 'All Collections' },
  { id: 'outerwear', label: 'Outerwear & Jackets' },
  { id: 'hoodies', label: 'Hoodies & Sweats' },
  { id: 'tees', label: 'Radiant Tops & Tees' },
  { id: 'bottoms', label: 'Tailored Bottoms' },
  { id: 'knitwear', label: 'Knitwear & Sweaters' },
  { id: 'accessories', label: 'Luxury Accessories' }
];

export const CURRENCIES = {
  INR: { symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.0095, label: 'GBP (£)' }
};

export const PROMO_CODES = {
  'RADIANT15': { discountPercent: 15, label: '15% Off Your Order' },
  'SUMMER26': { discountPercent: 20, label: '20% Summer Launch Special' },
  'VIPGOLD': { discountPercent: 25, label: '25% VIP Club Access' },
  'FREESHIP': { freeShipping: true, label: 'Complimentary Express Delivery' }
};

export const PRODUCTS = [
  {
    id: 'rw-01',
    name: 'Aetheria Tactical Bomber Jacket',
    category: 'outerwear',
    price: 285,
    originalPrice: 340,
    tag: 'Bestseller',
    rating: 4.9,
    reviewsCount: 148,
    image: '/images/product_jacket.jpg',
    secondaryImage: '/images/hero_banner.jpg',
    badge: 'Limited Drop',
    description: 'Artisanal techwear meets haute couture tailoring. The Aetheria Bomber is constructed with high-density water-resistant matte Japanese nylon, finished with solid brass gold-plated YKK zippers, reinforced webbing straps, and an insulated diamond-quilt interior.',
    colors: [
      { name: 'Obsidian Black', hex: '#0f0f11' },
      { name: 'Radiant Gold', hex: '#b3822a' },
      { name: 'Charcoal Grey', hex: '#2b2b36' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 4,
    features: [
      'Japanese high-density water-repellent matte shell',
      'Solid brass 24k gold-dipped signature zipper pulls',
      'Modular tactical utility sleeves with magnetic snap pockets',
      'Thermore® eco-insulated diamond interior lining'
    ],
    care: 'Dry clean only. Cool iron on reverse. Store on wide padded hanger.',
    featured: true
  },
  {
    id: 'rw-02',
    name: 'Monolith Oversized Fleece Hoodie',
    category: 'hoodies',
    price: 165,
    originalPrice: 195,
    tag: 'New Drop',
    rating: 4.8,
    reviewsCount: 94,
    image: '/images/product_hoodie.jpg',
    secondaryImage: '/images/hero_banner.jpg',
    badge: 'New Season',
    description: 'Engineered for exceptional drape and warmth. Heavyweight 520 GSM French Terry cotton fleece, garment-dyed in warm oatmeal beige with a high-density tonal micro-embroidered Radiant crest on the chest.',
    colors: [
      { name: 'Oatmeal Ecru', hex: '#e3ddd1' },
      { name: 'Shadow Black', hex: '#141418' },
      { name: 'Earthy Clay', hex: '#8a624a' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 9,
    features: [
      '520 GSM 100% GOTS-certified Organic French Terry Cotton',
      'Double-layered structured hood with zero drawcord finish',
      'Pre-shrunk vintage wash with hand-distressed ribbed cuffs',
      'Signature hidden interior media pocket'
    ],
    care: 'Machine wash cold inside-out with like colors. Hang to dry.',
    featured: true
  },
  {
    id: 'rw-03',
    name: 'Solaris Heavyweight Graphic Tee',
    category: 'tees',
    price: 85,
    originalPrice: 110,
    tag: 'Essential',
    rating: 4.9,
    reviewsCount: 230,
    image: '/images/product_tee.jpg',
    secondaryImage: '/images/hero_banner.jpg',
    badge: 'Hot',
    description: 'Crafted from 300 GSM combed organic cotton. Features our iconic vintage washed charcoal patina, a seamless bound collar that never loses shape, and a subtle metallic gold typographic emblem.',
    colors: [
      { name: 'Washed Charcoal', hex: '#27272f' },
      { name: 'Raw Bone', hex: '#f0ece1' },
      { name: 'Aura Green', hex: '#1d3326' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    features: [
      '300 GSM Heavyweight combed cotton',
      'Relaxed boxy silhouette with drop shoulder cut',
      'Acid-wash vintage enzyme wash treatment',
      'Screen printed with eco-solvent gold leaf inks'
    ],
    care: 'Wash cold, gentle cycle. Do not iron directly over graphic prints.',
    featured: true
  },
  {
    id: 'rw-04',
    name: 'Sartorial Pleated Wide-Leg Trousers',
    category: 'bottoms',
    price: 220,
    originalPrice: 260,
    tag: 'Tailored',
    rating: 4.9,
    reviewsCount: 82,
    image: '/images/product_trousers.jpg',
    secondaryImage: '/images/product_knitwear.jpg',
    badge: 'Exclusive',
    description: 'The pinnacle of relaxed modern tailoring. Double front pleats create a graceful, architectural silhouette that cascades over footwear, featuring an integrated polished buckle belt and luxury wool blend.',
    colors: [
      { name: 'Charcoal Mélange', hex: '#31313a' },
      { name: 'Onyx Black', hex: '#0a0a0c' },
      { name: 'Camel Tan', hex: '#967451' }
    ],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 6,
    features: [
      'Italian tropical wool-viscose blend with natural stretch',
      'Double front knife pleats with fluid wide-leg drapery',
      'Self-fabric adjustable side tabs with custom D-ring hardware',
      'Deep slash pockets and satin-lined waistband'
    ],
    care: 'Dry clean recommended. Steam lightly to refresh pleats.',
    featured: true
  },
  {
    id: 'rw-05',
    name: 'Aura Mohair Ribbed Knit Sweater',
    category: 'knitwear',
    price: 240,
    originalPrice: 290,
    tag: 'Artisanal',
    rating: 5.0,
    reviewsCount: 67,
    image: '/images/product_knitwear.jpg',
    secondaryImage: '/images/product_trousers.jpg',
    badge: 'Limited',
    description: 'A cloud of tactile warmth. Spun from sustainably sourced South African kid mohair and silk yarns. Hand-finished with chunky English rib knitting and a relaxed mock turtleneck collar.',
    colors: [
      { name: 'Champagne Cream', hex: '#ede6d8' },
      { name: 'Mist Blue', hex: '#8ca0aa' },
      { name: 'Espresso', hex: '#3b2f2f' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 3,
    features: [
      '70% Kid Mohair, 30% Mulberry Silk blend',
      'Chunky 3-gauge textured English rib knit',
      'Seamless tubular knit construction to eliminate bulk',
      'Ultra-soft brushed finish with zero itch guarantee'
    ],
    care: 'Hand wash in cold water with wool detergent. Dry flat on towels.',
    featured: true
  },
  {
    id: 'rw-06',
    name: 'Vanguard Leather Crossbody Courier',
    category: 'accessories',
    price: 195,
    originalPrice: 230,
    tag: 'Bestseller',
    rating: 4.8,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular',
    description: 'Precision handcrafted from full-grain vegetable tanned Italian leather. Features quick-release aluminum magnetic Cobra-style buckle, waterproof zipper tracks, and dual compartment ergonomics.',
    colors: [
      { name: 'Matte Onyx', hex: '#111115' },
      { name: 'Saddle Cognac', hex: '#633d21' }
    ],
    sizes: ['One Size'],
    stock: 7,
    features: [
      'Full-grain Tuscan vegetable-tanned leather',
      'Aviation-grade anodized matte gold buckle clasp',
      'Microfiber suede-lined interior with padded tablet sleeve',
      'Adjustable seatbelt webbing strap with shoulder pad'
    ],
    care: 'Treat with natural beeswax leather balm every 6 months.',
    featured: true
  },
  {
    id: 'rw-07',
    name: 'Eclipse Radiant Windbreaker Anorak',
    category: 'outerwear',
    price: 210,
    originalPrice: 250,
    tag: 'Weatherproof',
    rating: 4.7,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    secondaryImage: '/images/hero_banner.jpg',
    badge: 'Trending',
    description: 'Technical outerwear redefined. Ultralight 3-layer ripstop membrane with fully taped seams, storm-proof bungee hood, and iridescent radiant piping that glows under direct night lights.',
    colors: [
      { name: 'Cyber Smoke', hex: '#1f2421' },
      { name: 'Titanium White', hex: '#e8e8ea' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 5,
    features: [
      '20,000mm Waterproof / 15,000g Breathability rating',
      'Reflective radiant 3M piping across back harness',
      'Packable into self-contained chest pouch',
      'YKK AquaGuard waterproof zippers'
    ],
    care: 'Machine wash cool on delicate. Tumble dry low to reactivate DWR coating.',
    featured: false
  },
  {
    id: 'rw-08',
    name: 'Chronos Heavyweight Graphic Hoodie',
    category: 'hoodies',
    price: 175,
    originalPrice: 205,
    tag: 'Limited Edition',
    rating: 4.9,
    reviewsCount: 130,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    secondaryImage: '/images/product_hoodie.jpg',
    badge: 'Special Edition',
    description: 'Art meets street culture. Featuring our high-density silkscreen astrological chart on back and embroidered Latin typography "Per Aspera Ad Astra" across the wrist.',
    colors: [
      { name: 'Midnight Navy', hex: '#0f172a' },
      { name: 'Washed Ash', hex: '#334155' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 8,
    features: [
      '480 GSM Ring-spun organic cotton fleece',
      'Hand-screened multi-pass waterbased graphics',
      'Custom gold aglet metal tips on cotton drawcords',
      'Reinforced side rib panels for maximum mobility'
    ],
    care: 'Wash inside-out in cold water. Lay flat to dry.',
    featured: false
  }
];

export const LOOKBOOK_ITEMS = [
  {
    id: 'look-01',
    title: 'The Obsidian Silhouette',
    season: 'Autumn / Winter 2026',
    description: 'A striking interplay of tactical outerwear and relaxed wool tailoring.',
    image: '/images/hero_banner.jpg',
    hotspots: [
      { id: 'spot-1', x: 25, y: 35, productId: 'rw-01', label: 'Aetheria Tactical Bomber' },
      { id: 'spot-2', x: 42, y: 40, productId: 'rw-02', label: 'Monolith Fleece Hoodie' },
      { id: 'spot-3', x: 75, y: 55, productId: 'rw-04', label: 'Sartorial Pleated Trousers' }
    ]
  },
  {
    id: 'look-02',
    title: 'Warm Sanctuary Neutrals',
    season: 'Collection No. 04',
    description: 'Tactile mohair knit paired with fluid charcoal drapery for modern elegance.',
    image: '/images/product_knitwear.jpg',
    hotspots: [
      { id: 'spot-4', x: 50, y: 40, productId: 'rw-05', label: 'Aura Mohair Ribbed Sweater' },
      { id: 'spot-5', x: 50, y: 80, productId: 'rw-04', label: 'Tailored Wide-Leg Trousers' }
    ]
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Julian Vance',
    role: 'Creative Director, London',
    rating: 5,
    comment: 'The weight and drape of the Aetheria Bomber is unlike anything in contemporary streetwear. The brass hardware alone feels like haute couture sculpture.',
    item: 'Purchased Aetheria Bomber Jacket',
    date: 'Verified Buyer · 3 days ago'
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Fashion Stylist, Milan',
    rating: 5,
    comment: 'The mohair sweater is absolute perfection. Ultra soft, zero itchiness, and the champagne tone captures light magically. Radiant Wears has raised the bar.',
    item: 'Purchased Aura Mohair Knit',
    date: 'Verified Buyer · 1 week ago'
  },
  {
    id: 3,
    name: 'Marcus Chen',
    role: 'Architect, Tokyo',
    rating: 5,
    comment: 'Tailoring is impeccable. The pleated trousers have the exact relaxed drape I was searching for across top Japanese luxury houses.',
    item: 'Purchased Sartorial Pleated Trousers',
    date: 'Verified Buyer · 2 weeks ago'
  }
];

export const PRESS_LOGOS = [
  { name: 'VOGUE', quote: '"Radiant Wears marries tactical precision with effortless luxury."' },
  { name: 'GQ', quote: '"The most anticipated luxury streetwear label of the year."' },
  { name: 'HIGHSNOBIETY', quote: '"Setting a benchmark in heavyweight organic garment craft."' },
  { name: 'HYPEBEAST', quote: '"Impeccable silhouettes, supreme materials, radiant identity."' }
];
