'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { ProductCard } from '@/components/products/ProductCard'
import { Container } from '@/components/ui'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import type { ProductCardData } from '@/types/product'

type BestsellersProps = {
  products: ProductCardData[]
}

export function Bestsellers({ products }: BestsellersProps) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'words', mask: 'words' })
      const trigger = { trigger: root.current, start: 'top 80%', once: true }

      gsap
        .timeline({ scrollTrigger: trigger, defaults: { ease: 'power3.out' } })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.words, { yPercent: 110, duration: 1, stagger: 0.08 }, '-=0.3')
        .from('[data-view-all]', { opacity: 0, duration: 0.6 }, '-=0.6')

      // Cards rise in as each row reaches the viewport
      ScrollTriggerBatch()

      return () => split.revert()

      function ScrollTriggerBatch() {
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card, i) => {
          gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: (i % 4) * 0.08, // stagger across each row of 4
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          })
        })
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="bestsellers-title" className="py-20 md:py-28">
      <Container>
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <p data-eyebrow className="mb-4 flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-olive uppercase">
              <span aria-hidden className="size-1 rounded-full bg-olive" />
              The collection
            </p>
            <h2 id="bestsellers-title" data-title className="text-4xl font-normal tracking-[0.02em] uppercase md:text-5xl">
              Bestsellers
            </h2>
          </div>

          <Link
            data-view-all
            href="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase"
          >
            View all products
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4 lg:gap-y-16">
          {products.map((product, i) => (
            <li key={product.slug} data-card className="flex">
              <ProductCard product={product} priority={i < 4} className="w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}