'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'

import { Container } from '@/components/ui'
import type { ConcernWithKits } from '@/types/product'
import { formatPrice } from '@/lib/format'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

/** "Shop by concern" — pick a hair concern, see the three kits that fix it. */
export function ShopByConcern({ concerns }: { concerns: ConcernWithKits[] }) {
  const root = useRef<HTMLElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(0)
  const firstRender = useRef(true)

  const concern = concerns[active]

  // Entrance
  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'words', mask: 'words' })
      const trigger = { trigger: root.current, start: 'top 80%', once: true }

      gsap
        .timeline({ scrollTrigger: trigger, defaults: { ease: 'power3.out' } })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.words, { yPercent: 110, duration: 1, stagger: 0.08 }, '-=0.3')
        .from('[data-pill]', { opacity: 0, y: 10, duration: 0.5, stagger: 0.04 }, '-=0.6')
        .from('[data-kit]', { opacity: 0, y: 40, duration: 0.9, stagger: 0.1 }, '-=0.4')

      return () => split.revert()
    },
    { scope: root },
  )

  // Swap: new kits rise in whenever the concern changes
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false
        return
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(
        '[data-kit]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true },
      )
      gsap.fromTo(
        '[data-kit-img]',
        { scale: 1.08 },
        { scale: 1, duration: 1.2, ease: 'power3.out', overwrite: true },
      )
    },
    { scope: root, dependencies: [active], revertOnUpdate: false },
  )

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = concerns.length - 1
    const next =
      e.key === 'ArrowRight'
        ? i === last
          ? 0
          : i + 1
        : e.key === 'ArrowLeft'
          ? i === 0
            ? last
            : i - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section ref={root} aria-labelledby="concern-title" className="bg-[#F6F5EF] py-20 md:py-28">
      <Container>
        {/* Header */}
        <p
          data-eyebrow
          className="text-olive mb-4 flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase"
        >
          <span aria-hidden className="bg-olive size-1 rounded-full" />
          Shop by concern
        </p>
        <h2
          id="concern-title"
          data-title
          className="text-3xl font-normal tracking-[0.02em] text-[#24260F] uppercase md:text-5xl"
        >
          What does your hair need?
        </h2>

        {/* Concern pills — scroll sideways on phones */}
        <div
          role="tablist"
          aria-label="Hair concerns"
          className="-mx-4 mt-8 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-10 md:flex-wrap md:overflow-visible md:px-0"
        >
          {concerns.map((c, i) => {
            const selected = i === active
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                data-pill
                type="button"
                role="tab"
                id={`concern-tab-${c.id}`}
                aria-selected={selected}
                aria-controls="concern-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  'focus-visible:ring-olive/40 shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  selected
                    ? 'border-[#24260F] bg-[#24260F] text-white'
                    : 'hover:border-olive hover:text-olive border-[#DDDCD0] bg-white text-[#24260F]',
                )}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Kits — swipeable row on phones, 3-up grid (wide lead card) from tablet up */}
        <ul
          id="concern-panel"
          role="tabpanel"
          aria-labelledby={`concern-tab-${concern.id}`}
          className="-mx-4 mt-8 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-10 md:grid md:grid-cols-[3fr_2fr_2fr] md:overflow-visible md:px-0 lg:gap-4"
        >
          {concern.kits.map((kit, i) => {
            return (
              <li
                key={`${concern.id}-${kit.slug}`}
                data-kit
                className="w-[82%] shrink-0 snap-start sm:w-[60%] md:w-auto"
              >
                <Link
                  href={`/shop/${kit.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden bg-[#E9E8DE] md:aspect-auto md:h-[26rem] lg:h-[30rem]"
                >
                  <Image
                    data-kit-img
                    src={kit.image.src}
                    alt={kit.image.alt}
                    fill
                    sizes={
                      i === 0 ? '(min-width: 768px) 43vw, 82vw' : '(min-width: 768px) 29vw, 82vw'
                    }
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />

                  {/* Shade under the caption */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[#1c1e0a]/80"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-6">
                    <p className="text-sm leading-snug text-white/85">{kit.tagline}</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <h3 className="text-lg font-medium tracking-[0.06em] uppercase lg:text-xl">
                        {kit.name}
                      </h3>
                      <p className="shrink-0 pb-0.5 text-sm tabular-nums">
                        {kit.fromPrice && 'From '}
                        {formatPrice(kit.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
