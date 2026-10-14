'use client'

import { useEffect, useState } from 'react'

import { useBag } from '@/lib/cart'
import { cn } from '@/lib/utils'

/** "Add to bag +" text button — adds one and confirms for a moment. */
export function AddToBagButton({
  productID,
  variantID,
  title,
  inStock = true,
  className,
}: {
  productID: string
  /** The size to add, for products that come in several */
  variantID?: string
  title: string
  inStock?: boolean
  className?: string
}) {
  const { add } = useBag()
  const [added, setAdded] = useState(false)

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
        void add(productID, variantID)
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
