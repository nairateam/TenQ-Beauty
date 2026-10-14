/* Seed content: the shop catalogue and filter options. Only src/seed/index.ts reads this. */

/** A product card as the seed knows it, before it has a Payload id */
type ProductCardData = {
  slug: string
  title: string
  subtitle: string
  price: number
  fromPrice?: boolean
  image: { src: string; alt: string }
  badge?: string
}

export const concernOptions = [
  { value: 'dandruff', label: 'Dandruff & itchy scalp' },
  { value: 'edges', label: 'Thinning edges' },
  { value: 'breakage', label: 'Breakage' },
  { value: 'dryness', label: 'Dryness' },
  { value: 'growth', label: 'Hair growth' },
  { value: 'greying', label: 'Early greying' },
] as const

export const hairTypeOptions = [
  { value: 'kinky', label: 'Kinky & coily' },
  { value: 'curly', label: 'Curly' },
  { value: 'locs', label: 'Locs' },
  { value: 'twa', label: 'TWA' },
  { value: 'transitioning', label: 'Transitioning' },
] as const

export const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const

export type Concern = (typeof concernOptions)[number]['value']
export type HairType = (typeof hairTypeOptions)[number]['value']
export type SortOption = (typeof sortOptions)[number]['value']

/** A product card plus what the shop filters on. Listed in popularity order. */
export type ShopProduct = Omit<ProductCardData, 'subtitle'> & {
  /** Collection slugs (see data/collections.ts); the first is shown under the name */
  collections: string[]
  concerns: Concern[]
  hairTypes: HairType[]
  /** Higher = newer */
  added: number
}

const allTypes: HairType[] = ['kinky', 'curly', 'locs', 'twa', 'transitioning']

const img = (file: string, alt: string) => ({ src: `/products/${file}`, alt })

export const shopProducts: ShopProduct[] = [
  {
    slug: 'dazzle-hair-edges-growth-oil',
    title: "'Dazzle' Hair & Edges Growth Oil",
    price: 5000,
    fromPrice: true,
    badge: '5.0 ★',
    image: img('p-dazzle.jpeg', 'Dazzle Hair and Edges Growth Oil bottle'),
    collections: ['hairress', 'oils-and-herbs'],
    concerns: ['edges', 'growth'],
    hairTypes: allTypes,
    added: 12,
  },
  {
    slug: 'silky-leave-in-conditioner',
    title: 'Silky Leave-In Conditioner',
    price: 3800,
    fromPrice: true,
    badge: 'Bestseller',
    image: img('p-leavein.jpeg', 'Silky Leave-In Conditioner pump bottle'),
    collections: ['hairress'],
    concerns: ['dryness', 'breakage'],
    hairTypes: ['kinky', 'curly', 'twa', 'transitioning'],
    added: 8,
  },
  {
    slug: 'bloom-peptide-scalp-serum',
    title: "'Bloom' Peptide Scalp Serum",
    price: 10500,
    fromPrice: true,
    badge: '5.0 ★',
    image: img('p-bloom.jpeg', 'Bloom Hair Growth Serum dropper bottle'),
    collections: ['hairress'],
    concerns: ['growth', 'edges', 'greying'],
    hairTypes: allTypes,
    added: 20,
  },
  {
    slug: 'herbal-hair-booster-cream',
    title: 'Herbal Hair Booster Cream',
    price: 5000,
    fromPrice: true,
    image: img('p-keratin.jpeg', 'Herbal Hair Booster Cream jar'),
    collections: ['hairress'],
    concerns: ['growth', 'dryness'],
    hairTypes: ['kinky', 'curly', 'twa'],
    added: 5,
  },
  {
    slug: 'volumizing-deep-conditioner',
    title: 'Volumizing Deep Conditioner',
    price: 4000,
    fromPrice: true,
    image: img('p-keratin.jpeg', 'Volumizing Deep Conditioner jar'),
    collections: ['hairress'],
    concerns: ['dryness', 'breakage'],
    hairTypes: ['kinky', 'curly', 'transitioning'],
    added: 9,
  },
  {
    slug: 'hydrating-hair-butter',
    title: 'Hydrating Hair Butter',
    price: 6000,
    fromPrice: true,
    badge: '5.0 ★',
    image: img('p-pomade.jpeg', 'Hydrating Hair Butter jar'),
    collections: ['hairress'],
    concerns: ['dryness', 'breakage'],
    hairTypes: ['kinky', 'twa', 'locs'],
    added: 14,
  },
  {
    slug: 'keratin-repair-conditioner',
    title: 'Keratin Repair Conditioner',
    price: 4200,
    fromPrice: true,
    badge: '4.9 ★',
    image: img('p-keratin.jpeg', 'Protect Keratin Repair Conditioner jar'),
    collections: ['hairress'],
    concerns: ['breakage'],
    hairTypes: ['kinky', 'curly', 'transitioning'],
    added: 7,
  },
  {
    slug: 'african-bubbles-shampoo',
    title: 'African Bubbles Shampoo',
    price: 9500,
    fromPrice: true,
    image: img('p-bubbles.jpeg', 'African Bubbles Shampoo bottle'),
    collections: ['hairress'],
    concerns: ['dandruff'],
    hairTypes: allTypes,
    added: 6,
  },
  {
    slug: 'antidandruff-spray',
    title: 'Antidandruff Spray',
    price: 9500,
    fromPrice: true,
    image: img('p-mist.jpeg', 'Antidandruff Spray bottle'),
    collections: ['hairress'],
    concerns: ['dandruff'],
    hairTypes: allTypes,
    added: 11,
  },
  {
    slug: 'floral-essence-mist',
    title: 'Floral Essence Mist',
    price: 8000,
    badge: '4.9 ★',
    image: img('p-mist.jpeg', 'Floral Essence Mist spray bottle'),
    collections: ['afro-kids', 'hairress'],
    concerns: ['dryness'],
    hairTypes: ['kinky', 'curly', 'twa'],
    added: 15,
  },
  {
    slug: 'cloves-rosemary-hair-mist',
    title: 'Cloves & Rosemary Hair Mist',
    price: 9500,
    image: img('p-mist.jpeg', 'Cloves and Rosemary Hair Mist bottle'),
    collections: ['afro-kids', 'hairress', 'styling'],
    concerns: ['growth', 'greying'],
    hairTypes: allTypes,
    added: 13,
  },
  {
    slug: 'basic-hair-care-kit',
    title: 'Basic Hair Care Kit',
    price: 46000,
    fromPrice: true,
    image: img('p-shampoo-relief.png', 'The Basic Hair Care Kit products together'),
    collections: ['combos', 'hairress'],
    concerns: ['dryness', 'breakage', 'growth'],
    hairTypes: allTypes,
    added: 10,
  },
  {
    slug: 'growth-anti-dandruff-pomade',
    title: 'Growth & Anti-Dandruff Pomade',
    price: 9500,
    image: img('p-pomade.jpeg', 'Growth and Anti-Dandruff Pomade tin'),
    collections: ['hairress'],
    concerns: ['dandruff', 'growth', 'edges'],
    hairTypes: ['kinky', 'twa', 'locs'],
    added: 4,
  },
  {
    slug: 'relief-scalp-detox-shampoo',
    title: 'Relief Scalp Detox Shampoo',
    price: 10500,
    fromPrice: true,
    badge: 'New',
    image: img('p-shampoo-relief.png', 'Relief Scalp Detox Shampoo bottle'),
    collections: ['hairress'],
    concerns: ['dandruff'],
    hairTypes: allTypes,
    added: 22,
  },
  {
    slug: 'sabi-man-beard-oil',
    title: 'Sabi Man Beard Oil',
    price: 6500,
    image: img('p-dazzle.jpeg', 'Sabi Man Beard Oil bottle'),
    collections: ['sabi-man', 'oils-and-herbs'],
    concerns: ['growth', 'dryness'],
    hairTypes: ['kinky', 'curly'],
    added: 18,
  },
  {
    slug: 'sabi-man-beard-balm',
    title: 'Sabi Man Beard Balm',
    price: 5500,
    image: img('p-pomade.jpeg', 'Sabi Man Beard Balm tin'),
    collections: ['sabi-man', 'styling'],
    concerns: ['dryness'],
    hairTypes: ['kinky', 'curly'],
    added: 17,
  },
  {
    slug: 'sabi-man-hair-and-beard-wash',
    title: 'Sabi Man Hair & Beard Wash',
    price: 7000,
    image: img('p-bubbles.jpeg', 'Sabi Man Hair and Beard Wash bottle'),
    collections: ['sabi-man'],
    concerns: ['dandruff', 'dryness'],
    hairTypes: ['kinky', 'curly', 'twa', 'locs'],
    added: 16,
  },
  {
    slug: 'kids-detangling-shampoo',
    title: 'Kids Detangling Shampoo',
    price: 4500,
    image: img('p-bubbles.jpeg', 'Afro Kids Detangling Shampoo bottle'),
    collections: ['afro-kids'],
    concerns: ['dryness', 'breakage'],
    hairTypes: ['kinky', 'curly'],
    added: 19,
  },
  {
    slug: 'kids-hair-and-scalp-cream',
    title: 'Kids Hair & Scalp Cream',
    price: 4800,
    image: img('p-keratin.jpeg', 'Afro Kids Hair and Scalp Cream jar'),
    collections: ['afro-kids'],
    concerns: ['dryness', 'growth'],
    hairTypes: ['kinky', 'curly'],
    added: 21,
  },
  {
    slug: 'edge-control-gel',
    title: 'Edge Control Gel',
    price: 3800,
    image: img('p-pomade.jpeg', 'Edge Control Gel tub'),
    collections: ['styling'],
    concerns: ['edges'],
    hairTypes: ['kinky', 'curly', 'twa'],
    added: 3,
  },
  {
    slug: 'wide-tooth-detangling-comb',
    title: 'Wide-Tooth Detangling Comb',
    price: 2500,
    image: img('p-leavein.jpeg', 'Wide-tooth detangling comb'),
    collections: ['tools'],
    concerns: ['breakage'],
    hairTypes: allTypes,
    added: 2,
  },
  {
    slug: 'satin-sleep-bonnet',
    title: 'Satin Sleep Bonnet',
    price: 3500,
    image: img('p-leavein.jpeg', 'Satin sleep bonnet'),
    collections: ['tools'],
    concerns: ['breakage', 'dryness'],
    hairTypes: allTypes,
    added: 1,
  },
  {
    slug: 'scalp-massage-brush',
    title: 'Scalp Massage Brush',
    price: 3500,
    image: img('p-leavein.jpeg', 'Silicone scalp massage brush'),
    collections: ['tools'],
    concerns: ['growth', 'dandruff'],
    hairTypes: allTypes,
    added: 2,
  },
  {
    slug: 'chebe-powder',
    title: 'Chebe Powder',
    price: 4500,
    image: img('p-dazzle.jpeg', 'Chebe powder pouch'),
    collections: ['oils-and-herbs'],
    concerns: ['breakage', 'growth'],
    hairTypes: ['kinky', 'locs', 'twa'],
    added: 23,
  },
  {
    slug: 'hairress-kit',
    title: 'Hairress Kit',
    price: 97500,
    image: { src: '/images/tenq2.png', alt: 'The full Hairress Kit on stone plinths' },
    collections: ['combos', 'hairress'],
    concerns: ['dandruff', 'dryness', 'breakage', 'growth'],
    hairTypes: allTypes,
    added: 24,
  },
]

/** The dark promo tile slotted into the grid. */
export const routinePromo = {
  eyebrow: 'The complete routine',
  headline: 'Everything your hair needs, in one kit',
  name: 'Hairress Kit',
  price: 97500,
  href: '/shop/hairress-kit',
  cta: { label: 'Shop combos', collection: 'combos' },
  image: { src: '/images/tenq2.png', alt: 'The full Hairress Kit on stone plinths' },
}
