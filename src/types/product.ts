/* Storefront shapes, mapped from Payload docs in src/lib/queries. Prices are whole naira. */

export type ImageData = { src: string; alt: string; position?: string }

export type ProductCardData = {
  id: string
  slug: string
  title: string
  subtitle: string
  /** The lowest price, in naira */
  price: number
  /** Show "From" when the product comes in several sizes */
  fromPrice?: boolean
  image: ImageData
  badge?: string
  /** Size a card's "Add to bag" adds — the cheapest in stock */
  variantID?: string
  /** False when every size (or the product itself) has sold out */
  inStock: boolean
}

export type FilterOption = { value: string; label: string }

/** A product card plus what the shop filters and sorts on. */
export type ShopProduct = ProductCardData & {
  kind: 'product' | 'kit'
  /** Collection slugs; the first is shown under the name */
  collections: string[]
  concerns: string[]
  hairTypes: string[]
  /** Release time in ms — higher is newer */
  added: number
  /** Lower shows first under "Popularity" */
  popularity: number
}

export type ShopCollection = {
  slug: string
  name: string
  eyebrow: string
  headline: string
  description: string
  productCount: number
  fromPrice: number
  image: ImageData
}

export type ProductSize = { variantID: string; label: string; price: number; inStock: boolean }

export type Review = { name: string; date: string; rating: number; text: string }

export type ProductDetail = {
  product: ShopProduct
  /** The product's first collection, for the breadcrumb and eyebrow */
  collection?: Pick<ShopCollection, 'slug' | 'name' | 'eyebrow'>
  label?: string
  tagline: string
  reviews: Review[]
  inside?: {
    title: string
    note: string[]
    key: { name: string; latin: string; text: string }[]
    also: string[]
  }
  routine?: {
    title: string
    image: ImageData
    steps: { title: string; text: string }[]
  }
  gallery: ImageData[]
  /** Empty for single-size products */
  sizes: ProductSize[]
  defaultSize?: string
  bestValue?: string
  benefits: { icon: 'sprout' | 'droplet' | 'sparkles'; text: string }[]
  freeFrom: string[]
  description: string
  howToUse: string[]
  ingredients: string
  addOn?: { product: ProductCardData; title: string; note: string }
  deliveryAndReturns: string[]
  /** The reassurance strip under the details */
  assurances: { icon: 'globe' | 'badge' | 'lock'; text: string }[]
}

/* ---------- Homepage ---------- */

/** One of the "4 Essential Steps", showing its product. */
export type RoutineStep = { step: string; product: string; href: string; text: string; image: string }

export type Kit = {
  slug: string
  name: string
  tagline: string
  price: number
  fromPrice?: boolean
  image: ImageData
}

/** A concern pill with its three kits — the first one gets the wide card. */
export type ConcernWithKits = { id: string; label: string; kits: Kit[] }

export type Testimonial = {
  headline: string
  quote: string
  name: string
  /** Short context line under the tab title */
  meta: string
  avatar: { src: string; position?: string }
  product: { name: string; price: number; fromPrice?: boolean; href: string; image: string }
}
