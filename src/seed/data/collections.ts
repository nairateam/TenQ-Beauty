/* Shop page collection carousel. Images are placeholders until the collection shots land in /public/collections. */

export type Collection = {
  slug: string
  /** Short name for the tab under the carousel, e.g. "Afro Kids" */
  name: string
  /** Eyebrow above the headline, e.g. "Hairress collection" */
  eyebrow: string
  headline: string
  description: string
  productCount: number
  fromPrice: number
  image: { src: string; alt: string; position?: string }
}

export const shopIntro = {
  title: 'Shop all',
  description:
    'Science-backed formulas made with African botanicals — for kinks, coils, curls, TWAs and locs. 107 products across 10 collections.',
}

export const collections: Collection[] = [
  {
    slug: 'hairress',
    name: 'Hairress',
    eyebrow: 'Hairress collection',
    headline: 'Women’s hair care, rooted in nature',
    description:
      'Shampoos, conditioners, growth oils and serums for kinks, coils, curls, TWAs and locs.',
    productCount: 44,
    fromPrice: 3800,
    image: {
      src: '/images/personal.jpg',
      alt: 'A woman with long natural curls holding Ten-Q Calm scalp spray',
    },
  },
  {
    slug: 'afro-kids',
    name: 'Afro Kids',
    eyebrow: 'Afro Kids collection',
    headline: 'Gentle care for little curls',
    description:
      'Tear-free shampoos, detanglers and creams made mild enough for children’s scalps.',
    productCount: 16,
    fromPrice: 3500,
    image: { src: '/images/tenq1.png', alt: 'The Ten-Q Afro Kids range on a pastel set' },
  },
  {
    slug: 'sabi-man',
    name: 'Sabi Man',
    eyebrow: 'Sabi Man collection',
    headline: 'Beard and hair care for men',
    description: 'Beard oils, balms and washes that soften, define and keep the skin calm.',
    productCount: 12,
    fromPrice: 4200,
    image: { src: '/images/tenq3.png', alt: 'Ten-Q Sabi Man beard and hair products' },
  },
  {
    slug: 'combos',
    name: 'Combos',
    eyebrow: 'Combos & kits',
    headline: 'Complete routines, better value',
    description: 'Hand-picked kits for growth, moisture and scalp health — everything in one box.',
    productCount: 11,
    fromPrice: 18500,
    image: { src: '/images/tenq2.png', alt: 'Ten-Q kits arranged on stone plinths' },
  },
  {
    slug: 'styling',
    name: 'Styling',
    eyebrow: 'Styling collection',
    headline: 'Hold, shine and definition',
    description: 'Gels, pomades and edge controls that hold without flaking or drying hair out.',
    productCount: 9,
    fromPrice: 3800,
    image: { src: '/products/p-pomade.jpeg', alt: 'Ten-Q styling pomade' },
  },
  {
    slug: 'tools',
    name: 'Tools',
    eyebrow: 'Tools & accessories',
    headline: 'The right tools for gentle care',
    description: 'Wide-tooth combs, satin bonnets and applicator bottles made for textured hair.',
    productCount: 8,
    fromPrice: 2500,
    image: { src: '/images/fall.jpg', alt: 'Hair care tools and accessories' },
  },
  {
    slug: 'oils-and-herbs',
    name: 'Oils & Herbs',
    eyebrow: 'Oils & herbs',
    headline: 'Pure botanicals, straight from Africa',
    description: 'Cold-pressed oils and herbal blends for hot oil treatments, rinses and DIY mixes.',
    productCount: 7,
    fromPrice: 4500,
    image: { src: '/products/p-dazzle.jpeg', alt: 'Dazzle Hair and Edges Growth Oil' },
  },
]
