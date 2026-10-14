import type { ShopCollection, ShopProduct } from '@/types/product'

/** "Afro Kids · Hairress", or "Hairress Collection" for a single collection. */
export function collectionLine(product: ShopProduct, collections: ShopCollection[], limit = 2) {
  const names = product.collections
    .slice(0, limit)
    .map((slug) => collections.find((c) => c.slug === slug)?.name ?? slug)
  return names.length === 1 ? `${names[0]} Collection` : names.join(' · ')
}
