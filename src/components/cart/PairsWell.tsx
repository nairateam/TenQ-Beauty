'use client'

import { useRef } from 'react'

import { ProductCard } from '@/components/products/ProductCard'
import { useBag } from '@/lib/cart'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { collectionLine } from '@/lib/shop'
import type { ShopCollection, ShopProduct } from '@/types/product'

/* ---------- Content (edit here) ---------- */

const eyebrow = 'Complete your routine'
const title = 'Pairs well with your bag'
const limit = 4

/* ---------- Section ---------- */

/**
 * Four products not already in the bag — those sharing a collection with it first, then by popularity.
 * With an empty bag it simply shows the most popular products.
 */
export function PairsWell({
  products,
  collections,
}: {
  products: ShopProduct[]
  collections: ShopCollection[]
}) {
  const root = useRef<HTMLElement>(null)
  const { items } = useBag()

  const inBag = new Set(items.map((i) => i.productID))
  const bagCollections = new Set(
    products.filter((p) => inBag.has(p.id)).flatMap((p) => p.collections),
  )
  const picks = products
    .filter((p) => !inBag.has(p.id))
    .map((p, popularity) => ({
      p,
      popularity,
      related: p.collections.some((c) => bagCollections.has(c)),
    }))
    .sort((a, b) => Number(b.related) - Number(a.related) || a.popularity - b.popularity)
    .slice(0, limit)
    .map(({ p }) => p)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1 }, '-=0.3')
        .from('[data-card]', { opacity: 0, y: 32, duration: 0.9, stagger: 0.1 }, '-=0.6')
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="pairs-title"
      className="bg-[#F6F5EF] py-20 md:py-24 lg:py-[110px]"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        <p
          data-eyebrow
          className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
        >
          <span aria-hidden className="bg-olive size-1 rounded-full" />
          {eyebrow}
        </p>
        <h2
          id="pairs-title"
          data-title
          className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px]"
        >
          {title}
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-5 lg:mt-12 lg:grid-cols-4">
          {picks.map((p) => (
            <li key={p.slug} data-card>
              <ProductCard product={{ ...p, subtitle: collectionLine(p, collections) }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
