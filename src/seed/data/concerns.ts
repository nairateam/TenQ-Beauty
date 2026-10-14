/* "Shop by concern" content. Kit images are placeholders until the real kit shots land in /public/kits. */

export type Kit = {
  slug: string
  name: string
  tagline: string
  price: number
  fromPrice?: boolean
  image: { src: string; alt: string }
}

export type Concern = {
  id: string
  label: string
  /** Three kits shown for this concern — the first one gets the wide card. */
  kits: [string, string, string]
}

/** A concern with its three kits resolved — what the section renders. */
export type ConcernWithKits = { id: string; label: string; kits: Kit[] }

export const kits: Record<string, Kit> = {
  'dandruff-away': {
    slug: 'dandruff-away-kit',
    name: 'Dandruff Away Kit',
    tagline: 'Detox, soothe and protect a flaky, itchy scalp',
    price: 49500,
    fromPrice: true,
    image: { src: '/images/tenq2.png', alt: 'The Ten-Q scalp therapy range arranged on stone plinths' },
  },
  edges: {
    slug: 'edges-kit',
    name: 'Edges Kit',
    tagline: 'Regrow and protect fragile hairlines',
    price: 29500,
    fromPrice: true,
    image: { src: '/products/p-dazzle.jpeg', alt: 'Dazzle Hair and Edges Growth Oil with Bloom serum' },
  },
  'curl-master': {
    slug: 'curl-master-kit',
    name: 'Curl Master Kit',
    tagline: 'Bouncy, defined, frizz-free curls',
    price: 29000,
    image: { src: '/images/tenq1.png', alt: 'Woman with long defined curls holding Bloom Hair Growth Serum' },
  },
  'strength-repair': {
    slug: 'strength-repair-kit',
    name: 'Strength Repair Kit',
    tagline: 'Rebuild weak, snapping strands from within',
    price: 32000,
    fromPrice: true,
    image: { src: '/products/p-keratin.jpeg', alt: 'Keratin Repair Conditioner jar' },
  },
  'growth-boost': {
    slug: 'growth-boost-kit',
    name: 'Growth Boost Kit',
    tagline: 'Wake up the scalp for fuller, denser hair',
    price: 34500,
    fromPrice: true,
    image: { src: '/products/p-bloom.jpeg', alt: 'Bloom Peptide Scalp Serum dropper bottle' },
  },
  'loc-care': {
    slug: 'loc-care-kit',
    name: 'Loc Care Kit',
    tagline: 'Residue-free cleanse and a light, nourishing mist',
    price: 24500,
    image: { src: '/products/p-mist.jpeg', alt: 'Ten-Q scalp mist spray bottle' },
  },
  'little-ones': {
    slug: 'little-ones-kit',
    name: 'Little Ones Kit',
    tagline: 'Gentle wash and tear-free detangling',
    price: 21000,
    image: { src: '/products/p-leavein.jpeg', alt: 'Silky Leave-In Conditioner pump bottle' },
  },
  'beard-groom': {
    slug: 'beard-groom-kit',
    name: 'Beard Groom Kit',
    tagline: 'Softer, fuller, itch-free beard growth',
    price: 18500,
    image: { src: '/products/p-pomade.jpeg', alt: 'Grandmother’s Hair Growth Pomade tin' },
  },
  'lice-free': {
    slug: 'lice-free-kit',
    name: 'Lice Free Kit',
    tagline: 'Natural shampoo, oil and comb to clear lice fast',
    price: 15500,
    image: { src: '/images/tenq3.png', alt: 'Natural Anti-Lice Shampoo, Anti Head Lice Oil and a metal comb' },
  },
}

export const concerns: Concern[] = [
  { id: 'dandruff', label: 'Dandruff & itch', kits: ['dandruff-away', 'edges', 'curl-master'] },
  { id: 'thinning-edges', label: 'Thinning edges', kits: ['edges', 'growth-boost', 'dandruff-away'] },
  { id: 'breakage', label: 'Breakage', kits: ['strength-repair', 'growth-boost', 'curl-master'] },
  { id: 'curls', label: 'Curl definition', kits: ['curl-master', 'strength-repair', 'edges'] },
  { id: 'greying', label: 'Greying', kits: ['growth-boost', 'strength-repair', 'edges'] },
  { id: 'locs', label: 'Locs', kits: ['loc-care', 'dandruff-away', 'growth-boost'] },
  { id: 'kids', label: 'Kids', kits: ['little-ones', 'lice-free', 'curl-master'] },
  { id: 'beard', label: 'Beard', kits: ['beard-groom', 'growth-boost', 'dandruff-away'] },
  { id: 'lice', label: 'Lice', kits: ['lice-free', 'little-ones', 'dandruff-away'] },
]
