'use client'

import { useEffect, useState } from 'react'

import { previewOf, useBag } from '@/lib/cart'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types/product'

/** "Add to bag +" text button — adds one (its cheapest size in stock) and confirms for a moment. */
export function AddToBagButton({
  product,
  className,
}: {
  product: ProductCardData
  className?: string
}) {
  const { add } = useBag()
  const [added, setAdded] = useState(false)
  const { id, variantID, title, inStock } = product

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(t)
  }, [added])

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => {
        // Shows in the bag straight away; the server saves it in the background
        void add(id, variantID, 1, previewOf(product))
        setAdded(true)
      }}
      aria-label={inStock ? `Add ${title} to bag` : `${title} is sold out`}
      className={cn(
        'text-olive text-[10px] font-medium tracking-[0.18em] whitespace-nowrap uppercase transition-opacity hover:opacity-70 disabled:cursor-default disabled:text-[#9A9B8A] disabled:hover:opacity-100',
        className,
      )}
    >
      <span aria-live="polite">{!inStock ? 'Sold out' : added ? 'Added ✓' : 'Add to bag +'}</span>
    </button>
  )
}
