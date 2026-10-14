'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { ProductCard } from '@/components/products/ProductCard'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { collectionLine } from '@/lib/shop'
import type { ShopCollection, ShopProduct } from '@/types/product'

/* ---------- Content (edit here) ---------- */

const eyebrow = 'Complete the routine'
const title = 'Works beautifully with'
const limit = 4

/* ---------- Section ---------- */

/** Four other products, those sharing the most concerns and collections first, then by popularity. */
export function RelatedProducts({
  product,
  products,
  collections,
}: {
  product: ShopProduct
  products: ShopProduct[]
  collections: ShopCollection[]
}) {
  const root = useRef<HTMLElement>(null)
  const collection = collections.find((c) => c.slug === product.collections[0])

  const overlap = (p: ShopProduct) =>
    p.concerns.filter((c) => product.concerns.includes(c)).length +
    p.collections.filter((c) => product.collections.includes(c)).length
  const picks = products
    .filter((p) => p.slug !== product.slug)
    .map((p, popularity) => ({ p, popularity, score: overlap(p) }))
    .sort((a, b) => b.score - a.score || a.popularity - b.popularity)
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
      aria-labelledby="related-title"
      className="bg-[#F6F5EF] py-20 md:py-24 lg:py-[110px]"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p
              data-eyebrow
              className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              {eyebrow}
            </p>
            <h2
              id="related-title"
              data-title
              className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px]"
            >
              {title}
            </h2>
          </div>
          {collection && (
            <Link
              data-eyebrow
              href={`/shop?collection=${collection.slug}`}
              className="group text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-[#24260F] uppercase"
            >
              Shop {collection.name}{' '}
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          )}
        </div>

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
