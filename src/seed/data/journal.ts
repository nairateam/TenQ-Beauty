/*
 * Seed content: the journal's categories, articles and page copy. Only src/seed/index.ts reads this.
 * Article bodies are placeholders (the excerpt) until the full articles are pasted into the admin;
 * images are the closest existing shots until article photography is added.
 */

export const journalCategories = [
  { title: 'Hair care', slug: 'hair-care' },
  { title: 'Routines', slug: 'routines' },
  { title: 'Ingredients', slug: 'ingredients' },
  { title: 'Guides', slug: 'guides' },
  { title: 'Our story', slug: 'our-story' },
]

export const journalPage = {
  eyebrow: 'The Ten-Q Journal',
  title: 'Notes on healthy hair',
  intro:
    'Guides, routines and ingredient deep-dives from our formulators and scalp & hair health experts.',
  storiesHeading: 'Latest stories',
  newsletterEyebrow: 'Hair notes, in your inbox',
  newsletterTitle: 'New guides, routines and 5% off your first order',
  shelfEyebrow: 'Shop what we write about',
  shelfTitle: 'From the page to your shelf',
}

export type ArticleSeed = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readingTime: number
  image: { src: string; alt: string }
  products?: string[]
  featured?: string
}

export const articles: ArticleSeed[] = [
  {
    slug: 'the-a-z-of-natural-hair',
    title: 'The A–Z of natural hair',
    excerpt:
      '26 words every natural-haired woman should understand. Natural hair can feel complicated — endless products, ingredients, routines and opinions. This guide cuts through it.',
    category: 'guides',
    date: '2023-09-08',
    readingTime: 7,
    image: {
      src: '/images/about-together.webp',
      alt: 'Three women from behind with an updo, long braids and a full afro',
    },
    featured: 'Featured guide',
  },
  {
    slug: 'founders-story',
    title: 'Founder’s Story',
    excerpt:
      'My name is Ladejobi Oluwabukola — a UK-trained cosmetic formulator, scalp and hair health expert, and the founder of Ten-Q Beauty.',
    category: 'our-story',
    date: '2026-02-03',
    readingTime: 2,
    image: { src: '/images/fall.jpg', alt: 'Ten-Q founder story' },
  },
  {
    slug: 'differences-between-scalp-serum-and-hair-oil',
    title: 'Differences between scalp serum and hair oil',
    excerpt:
      'Oils and serums have a lot in common, but the difference is simple: hair oil has an oil-based formula — think baobab, palm kernel, olive or sunflower.',
    category: 'ingredients',
    date: '2024-08-13',
    readingTime: 2,
    image: { src: '/images/personal.jpg', alt: 'A woman holding a bottle of Ten-Q scalp serum' },
    products: ['bloom-peptide-scalp-serum', 'dazzle-hair-edges-growth-oil'],
  },
  {
    slug: 'how-to-wash-your-hair-the-right-way',
    title: 'How to wash your hair the right way',
    excerpt:
      'Washing seems as simple as lather, rinse, condition — but doing it right brings real benefits, like less frizz and less damage.',
    category: 'routines',
    date: '2023-03-10',
    readingTime: 4,
    image: {
      src: '/images/sec-a.png',
      alt: 'A client relaxing at a Ten-Q basin while her curls are washed',
    },
    products: ['african-bubbles-shampoo'],
  },
  {
    slug: 'how-to-care-for-type-4-hair',
    title: 'How to care for type 4 hair',
    excerpt: 'Type 4 hair is not hard to care for — you just need to know how.',
    category: 'hair-care',
    date: '2023-03-09',
    readingTime: 1,
    image: {
      src: '/images/tenq-ladies.jpg',
      alt: 'A stylist applying Ten-Q oil to a smiling woman’s afro',
    },
  },
  {
    slug: 'transitioning-from-damaged-to-healthy-hair',
    title: 'Transitioning from damaged hair to healthy hair',
    excerpt:
      'You know about transitioning from relaxed to natural hair — but did you know you can also transition from damaged to healthy hair?',
    category: 'routines',
    date: '2023-04-24',
    readingTime: 2,
    image: { src: '/images/tenq-ceo.jpg', alt: 'A woman surrounded by Ten-Q hair care products' },
    products: ['keratin-repair-conditioner'],
  },
]
