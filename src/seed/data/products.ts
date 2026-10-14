/* Seed content: product page details, keyed by slug. Only src/seed/index.ts reads this. */

import type { ShopProduct } from './shop'

export type ProductSize = { label: string; price: number }

/** `date` is ISO (yyyy-mm-dd) */
export type Review = { name: string; date: string; rating: number; text: string }

export type ProductDetail = {
  product: ShopProduct
  /** Label on the main image, e.g. "Bestseller" */
  label?: string
  /** Short pitch under the title */
  tagline: string
  /** Shown in this order; the rating and review count are worked out from these */
  reviews: Review[]
  /** "What's inside" band; hidden when missing */
  inside?: {
    title: string
    note: string[]
    key: { name: string; latin: string; text: string }[]
    also: string[]
  }
  /** "How to use" split section; hidden when missing */
  routine?: {
    title: string
    image: { src: string; alt: string }
    steps: { title: string; text: string }[]
  }
  gallery: { src: string; alt: string }[]
  /** Empty for single-size products */
  sizes: ProductSize[]
  /** Label of the size selected on load */
  defaultSize?: string
  /** Label of the size flagged as best value */
  bestValue?: string
  benefits: { icon: 'sprout' | 'droplet' | 'sparkles'; text: string }[]
  freeFrom: string[]
  description: string
  howToUse: string[]
  ingredients: string
  /** Optional extra offered beside "Add to bag"; must be a product in shopProducts */
  addOn?: { slug: string; title: string; note: string }
}

export const deliveryAndReturns = [
  'Lagos: 1–3 working days. Rest of Nigeria: 3–5 working days.',
  'Worldwide delivery in 7–14 working days — shipping is calculated at checkout.',
  'Unopened products can be returned within 14 days for a full refund.',
]

export const defaultFreeFrom = ['Silicone', 'Parabens', 'Mineral oil', 'Drying alcohol', 'Animal testing']

export const details: Record<string, Omit<ProductDetail, 'product'>> = {
  'dazzle-hair-edges-growth-oil': {
    label: 'Bestseller',
    tagline:
      'A lightweight booster oil with pumpkin seed oil, saw palmetto and rosemary — for thinning hair, edges and hair density.',
    reviews: [
      {
        name: 'Cherish',
        date: '2023-01-26',
        rating: 5,
        text: 'Nice oil. It is light and smells great too. I love it.',
      },
      { name: 'Ema Gado', date: '2024-01-29', rating: 5, text: 'Looking forward to using it.' },
    ],
    inside: {
      title: 'Lightweight oils, Ayurvedic herbs',
      note: ['20+ botanical ingredients.', 'No silicone, parabens or mineral oil.'],
      key: [
        {
          name: 'Pumpkin seed oil',
          latin: 'Cucurbita pepo',
          text: 'One of the three headline actives on every bottle of Dazzle.',
        },
        {
          name: 'Saw palmetto',
          latin: 'Serenoa repens',
          text: 'A botanical extract at the heart of the thickening blend.',
        },
        {
          name: 'Rosemary',
          latin: 'Salvia rosmarinus',
          text: 'Aromatic leaf oil, long trusted in scalp-care traditions.',
        },
        {
          name: 'Baobab oil',
          latin: 'Adansonia digitata',
          text: 'Known in African communities for centuries — rich in antioxidants, vitamins A and E, and omega fatty acids.',
        },
      ],
      also: [
        'Avocado',
        'Castor',
        'Sweet almond',
        'Olive',
        'Shea butter',
        'Peppermint',
        'Tea tree',
        'Amla',
        'Bhringraj',
        'Black seed',
        'Fenugreek',
        'Moringa',
        'Clove bud',
        'Green tea',
      ],
    },
    routine: {
      title: 'A few drops, a little massage',
      // Placeholder — swap in the photo of the stylist applying Dazzle
      image: { src: '/images/story.png', alt: 'A woman with long natural curls holding a Ten-Q bottle' },
      steps: [
        { title: 'Apply', text: 'A few drops of oil onto your scalp, hair and edges.' },
        { title: 'Massage', text: 'Work it in with your fingertips or a scalp massage brush.' },
        { title: 'Repeat', text: 'Use daily or three times a week for best results.' },
      ],
    },
    gallery: [
      { src: '/products/p-dazzle.jpeg', alt: 'Dazzle Hair and Edges Growth Oil bottle on a plinth' },
      { src: '/images/tenq1.png', alt: 'Dazzle Growth Oil with the Hairress range' },
      { src: '/images/tenq3.png', alt: 'Dazzle Growth Oil bottles side by side' },
      { src: '/images/personal.jpg', alt: 'Applying Dazzle oil to the scalp' },
    ],
    sizes: [
      { label: '50ml', price: 5000 },
      { label: '100ml', price: 9500 },
      { label: '200ml', price: 18500 },
      { label: '1kg', price: 75000 },
    ],
    defaultSize: '100ml',
    bestValue: '1kg',
    benefits: [
      { icon: 'sprout', text: 'For thinning hair, edges and bald spots' },
      { icon: 'droplet', text: 'Soothes the scalp and helps with dandruff' },
      { icon: 'sparkles', text: 'Promotes thick, strong, lustrous hair' },
    ],
    freeFrom: defaultFreeFrom,
    description:
      'An infusion of lightweight, luxurious oils, essential oils and Ayurvedic herbs that soothes the scalp and promotes healthy hair and lustre. Beneficial for bald spots, thinning hair and edges, hair loss and dandruff.',
    howToUse: [
      'Part clean, damp or dry hair into sections.',
      'Apply a few drops directly to the scalp and edges.',
      'Massage in with your fingertips or a scalp brush for 2–3 minutes.',
      'Use 3–4 times a week. Leave in — no need to rinse.',
    ],
    ingredients:
      'Cucurbita Pepo (Pumpkin) Seed Oil, Serenoa Serrulata (Saw Palmetto) Fruit Extract, Rosmarinus Officinalis (Rosemary) Leaf Oil, Ricinus Communis (Castor) Seed Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Emblica Officinalis (Amla) Fruit Extract, Eclipta Prostrata (Bhringraj) Extract, Mentha Piperita (Peppermint) Oil, Tocopherol (Vitamin E).',
    addOn: {
      slug: 'scalp-massage-brush',
      title: 'Add a scalp massage brush',
      note: 'Work the oil in without your nails',
    },
  },
}

