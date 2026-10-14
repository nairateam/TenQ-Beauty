/* "In their words" reviews. Avatars are crops of existing shots until real customer photos are supplied. */

export type Testimonial = {
  headline: string
  quote: string
  name: string
  /** Short context line under the tab title */
  meta: string
  avatar: { src: string; position?: string }
  product: { name: string; price: number; fromPrice?: boolean; href: string; image: string }
}

export const rating = '5.0 on our bestsellers · 5,000+ clients'

export const testimonials: Testimonial[] = [
  {
    headline: 'My curls are thriving again',
    quote:
      'Years of damage left my hair dry, broken and lifeless. After consistently using Ten-Q’s treatments and leave-in, my curls are thriving again — even my confidence is back.',
    name: 'Verified customer',
    meta: 'Verified customer · Leave-in routine',
    avatar: { src: '/images/tenq1.png', position: '35% 20%' },
    product: {
      name: 'Silky Leave-In Conditioner',
      price: 3800,
      fromPrice: true,
      href: '/shop/silky-leave-in-conditioner',
      image: '/products/p-leavein.jpeg',
    },
  },
  {
    headline: 'Her bald patches filled in',
    quote:
      'My daughter had thin, patchy edges for years. A few months on the growth oil and deep conditioner and the bald spots have filled in — her hair is thicker than it has ever been.',
    name: 'Parent',
    meta: 'Parent · Growth oil + deep conditioner',
    avatar: { src: '/images/fall.jpg', position: '50% 30%' },
    product: {
      name: '‘Dazzle’ Hair & Edges Growth Oil',
      price: 5000,
      fromPrice: true,
      href: '/shop/dazzle-hair-edges-growth-oil',
      image: '/products/p-dazzle.jpeg',
    },
  },
  {
    headline: 'Her scalp finally cleared',
    quote:
      'We tried everything for my daughter’s flaky, itchy scalp. The kids routine is gentle enough for her and it actually worked — no more scratching, and wash day is no longer a battle.',
    name: 'Parent',
    meta: 'Parent · Kids routine',
    avatar: { src: '/images/personal.jpg', position: '50% 30%' },
    product: {
      name: 'African Bubbles Shampoo',
      price: 9500,
      fromPrice: true,
      href: '/shop/african-bubbles-shampoo',
      image: '/products/p-bubbles.jpeg',
    },
  },
]
