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

export const bestsellers: ProductCardData[] = [
  {
    slug: 'bloom-peptide-scalp-serum',
    title: "'Bloom' Peptide Scalp Serum",
    subtitle: 'Guarana caffeine + rosemary',
    price: 10500,
    fromPrice: true,
    badge: 'Bestseller',
    image: { src: '/products/p-bloom.jpeg', alt: 'Bloom Hair Growth Serum dropper bottle' },
  },
  {
    slug: 'dazzle-hair-edges-growth-oil',
    title: "'Dazzle' Hair & Edges Growth Oil",
    subtitle: 'Pumpkin seed + saw palmetto',
    price: 5000,
    fromPrice: true,
    badge: '5.0 ★',
    image: { src: '/products/p-dazzle.jpeg', alt: 'Dazzle Hair and Edges Growth Oil bottle' },
  },
  {
    slug: 'silky-leave-in-conditioner',
    title: 'Silky Leave-In Conditioner',
    subtitle: 'Baobab + flaxseed + pro-vitamin B5',
    price: 3800,
    fromPrice: true,
    image: { src: '/products/p-leavein.jpeg', alt: 'Silky Leave-In Conditioner pump bottle' },
  },
  {
    slug: 'keratin-repair-conditioner',
    title: 'Keratin Repair Conditioner',
    subtitle: 'Rebuilds weak, breaking strands',
    price: 4200,
    fromPrice: true,
    badge: '5.0 ★',
    image: { src: '/products/p-keratin.jpeg', alt: 'Protect Keratin Repair Conditioner jar' },
  },
  {
    slug: 'african-bubbles-shampoo',
    title: 'African Bubbles Shampoo',
    subtitle: 'Neem + tea tree + mint',
    price: 9500,
    fromPrice: true,
    image: { src: '/products/p-bubbles.jpeg', alt: 'Radiance African Bubbles Shampoo bottle' },
  },
  {
    slug: 'relief-scalp-detox-shampoo',
    title: 'Relief Scalp Detox Shampoo',
    subtitle: 'Calms itch and flaking',
    price: 10500,
    fromPrice: true,
    badge: 'New',
    image: { src: '/products/p-shampoo-relief.png', alt: 'Relief Scalp Therapy Anti-Dandruff Shampoo bottle' },
  },
  {
    slug: 'cloves-rosemary-hair-mist',
    title: 'Cloves & Rosemary Hair Mist',
    subtitle: 'A daily growth spritz',
    price: 9500,
    image: { src: '/products/p-mist.jpeg', alt: 'Boost Hair Growth Spray bottle' },
  },
  {
    slug: 'growth-anti-dandruff-pomade',
    title: 'Growth & Anti-Dandruff Pomade',
    subtitle: 'Seals moisture at the scalp',
    price: 9500,
    fromPrice: true,
    image: { src: '/products/p-pomade.jpeg', alt: 'Hair Growth Pomade tin and box' },
  },
]