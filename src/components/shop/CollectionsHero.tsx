'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { Container } from '@/components/ui'
import type { ShopCollection as Collection } from '@/types/product'
import { formatPrice } from '@/lib/format'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const STEP_DURATION = 7 // seconds each collection stays up

/** Shop page intro — page title plus a carousel of collections with a peek at the next one. */
export function CollectionsHero({
  title,
  description,
  collections,
}: {
  title: string
  description: string
  collections: Collection[]
}) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false) // pointer over / focus inside the carousel
  const [inView, setInView] = useState(false)
  const previous = useRef(0)
  const direction = useRef<1 | -1>(1)

  const count = collections.length
  const collection = collections[active]
  const next = collections[(active + 1) % count]

  function goTo(i: number, dir: 1 | -1 = i > active ? 1 : -1) {
    if (i === active) return
    direction.current = dir
    setActive(i)
  }
  const go = (dir: 1 | -1) => goTo((active + dir + count) % count, dir)

  // Only auto-advance while the carousel is on screen
  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: '[data-stage]',
      start: 'top 85%',
      end: 'bottom 15%',
      onToggle: (self) => setInView(self.isActive),
    })
    return () => st.kill()
  })

  // Entrance
  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'words', mask: 'words' })
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-intro]', { opacity: 0, y: 12, duration: 0.6, stagger: 0.08 })
        .from(split.words, { yPercent: 110, duration: 1, stagger: 0.08 }, '-=0.4')
        .from('[data-stage]', { opacity: 0, y: 40, duration: 1 }, '-=0.6')
        .from('[data-tab] > span', { opacity: 0, y: 12, duration: 0.5, stagger: 0.04 }, '-=0.6')

      return () => split.revert()
    },
    { scope: root },
  )

  // Swap: the new image wipes in over the old one, the copy rises in
  useGSAP(
    () => {
      const from = previous.current
      previous.current = active
      if (from === active) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', root.current)
      slides.forEach((s, i) => gsap.set(s, { zIndex: i === active ? 2 : i === from ? 1 : 0 }))

      const enter = direction.current === 1 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
      gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .fromTo(
          slides[active],
          { clipPath: enter },
          { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, overwrite: true },
        )
        .fromTo(
          slides[active].querySelector('img'),
          { scale: 1.12 },
          { scale: 1, duration: 1.6, ease: 'power3.out' },
          0,
        )
        .from(
          '[data-copy] > *',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
          0.2,
        )
        .from('[data-peek] img', { opacity: 0, scale: 1.08, duration: 0.9, ease: 'power3.out' }, 0.3)
    },
    { scope: root, dependencies: [active], revertOnUpdate: false },
  )

  // Progress: the active tab's line fills, then the next collection takes over.
  // Paused (hover/focus) or off-screen: the line holds where it is.
  useGSAP(
    () => {
      const fills = gsap.utils.toArray<HTMLElement>('[data-fill]', root.current)
      fills.forEach((f, i) => {
        if (i !== active)
          gsap.to(f, { scaleX: 0, duration: 0.4, ease: 'power2.out', overwrite: true })
      })
      const fill = fills[active]
      if (!fill) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(fill, { scaleX: 1 })
        return
      }
      if (paused || !inView) {
        gsap.killTweensOf(fill)
        return
      }

      const current = Number(gsap.getProperty(fill, 'scaleX')) || 0
      gsap.to(fill, {
        scaleX: 1,
        duration: STEP_DURATION * (1 - current),
        ease: 'none',
        overwrite: true,
        onComplete: () => go(1),
      })
    },
    { scope: root, dependencies: [active, paused, inView], revertOnUpdate: false },
  )

  return (
    <section ref={root} aria-labelledby="shop-title" className="pt-[calc(var(--header-height)+1.5rem)] pb-16 md:pt-[calc(var(--header-height)+2rem)] md:pb-24">
      <Container>
        {/* Breadcrumb */}
        <nav data-intro aria-label="Breadcrumb" className="text-xs text-[#6B6C5E]">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-[#24260F]">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-[#C9C8BB]">
              /
            </li>
            <li aria-current="page" className="text-[#24260F]">
              Shop
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-[1fr_minmax(0,26rem)] md:items-end md:gap-12">
          <div>
            <p
              data-intro
              className="text-olive mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              The collection
            </p>
            <h1
              id="shop-title"
              data-title
              className="text-4xl font-normal tracking-[0.02em] text-[#24260F] uppercase md:text-6xl"
            >
              {title}
            </h1>
          </div>
          <p
            data-intro
            className="text-[15px] leading-relaxed text-[#5B5C4E] md:pb-2 md:text-base"
          >
            {description}
          </p>
        </div>

        {/* Carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Collections"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
          className="mt-10 md:mt-12"
        >
          <div data-stage className="grid gap-5 lg:grid-cols-[1fr_14%]">
            {/* Active collection */}
            <div className="grid overflow-hidden bg-[#272A10] md:grid-cols-[42%_1fr] lg:h-[30rem]">
              {/* Image (stacked so the next one can wipe over the last) */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E8DE] md:order-2 md:aspect-auto md:min-h-[26rem]">
                {collections.map((c, i) => (
                  <div
                    key={c.slug}
                    data-slide
                    aria-hidden={i !== active}
                    className="absolute inset-0"
                    style={{ zIndex: i === active ? 2 : 0 }}
                  >
                    <Image
                      src={c.image.src}
                      alt={c.image.alt}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 50vw, (min-width: 768px) 58vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: c.image.position }}
                    />
                  </div>
                ))}
              </div>

              {/* Copy */}
              <div
                aria-live="polite"
                className="flex flex-col justify-between gap-10 p-6 text-white md:order-1 md:p-10 lg:p-11"
              >
                <div data-copy key={`top-${active}`}>
                  <p className="text-[11px] tracking-[0.14em] text-white/60 tabular-nums">
                    {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </p>
                  <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-[#C9D27A] uppercase">
                    {collection.eyebrow}
                  </p>
                  <h2 className="mt-4 text-[28px] leading-[1.12] font-normal tracking-[0.02em] uppercase lg:text-[34px]">
                    {collection.headline}
                  </h2>
                  <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
                    {collection.description}
                  </p>
                </div>

                <div data-copy key={`bottom-${active}`}>
                  <p className="text-[13px] text-white/70">
                    {collection.productCount} products
                    <span aria-hidden className="mx-2">
                      ·
                    </span>
                    From {formatPrice(collection.fromPrice)}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <Link
                      href={`/shop?collection=${collection.slug}#products`}
                      className="bg-white px-6 py-3.5 text-[11px] font-semibold tracking-[0.16em] text-[#24260F] uppercase transition-colors hover:bg-[#C9D27A]"
                    >
                      Shop {collection.name}
                    </Link>
                    <Link
                      href={`/shop?collection=${collection.slug}&sort=popularity#products`}
                      className="group text-[11px] font-semibold tracking-[0.16em] uppercase"
                    >
                      Bestsellers{' '}
                      <span
                        aria-hidden
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Peek at the next collection */}
            <button
              type="button"
              data-peek
              onClick={() => go(1)}
              aria-label={`Next collection: ${next.name}`}
              className="group relative hidden overflow-hidden bg-[#E9E8DE] lg:block"
            >
              <Image
                key={next.slug}
                src={next.image.src}
                alt=""
                fill
                sizes="14vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-white/70"
              />
              <span className="absolute bottom-6 left-6 text-left text-[11px] leading-relaxed font-semibold tracking-[0.16em] text-[#24260F] uppercase">
                Next{' '}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
                <br />
                {next.name}
              </span>
            </button>
          </div>

          {/* Collection tabs + arrows */}
          <div className="mt-8 flex items-center gap-6 md:gap-10">
            <div
              role="tablist"
              aria-label="Collections"
              className="-mx-4 flex min-w-0 flex-1 [scrollbar-width:none] gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] md:gap-5 md:overflow-visible md:px-0"
            >
              {collections.map((c, i) => {
                const selected = i === active
                return (
                  <button
                    key={c.slug}
                    data-tab
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => goTo(i)}
                    className={cn(
                      'focus-visible:ring-olive/40 w-28 shrink-0 text-left transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-offset-4 md:w-auto',
                      selected ? 'text-[#24260F]' : 'text-[#8A8B7C] hover:text-[#24260F]',
                    )}
                  >
                    {/* Progress line */}
                    <span aria-hidden className="relative block h-0.5 w-full bg-[#E3E2D6]">
                      <span
                        data-fill
                        className="bg-olive absolute inset-0 origin-left scale-x-0"
                      />
                    </span>
                    <span className="mt-3.5 flex items-baseline gap-2 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase md:text-[11px]">
                      <span
                        className={cn(
                          'font-normal tabular-nums',
                          selected ? 'text-olive' : 'text-[#B5B4A6]',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {c.name}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="hidden shrink-0 gap-2.5 sm:flex">
              <ArrowButton dir="prev" onClick={() => go(-1)} />
              <ArrowButton dir="next" onClick={() => go(1)} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function ArrowButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous collection' : 'Next collection'}
      className={cn(
        'grid size-11 place-items-center rounded-full transition-colors md:size-12',
        dir === 'prev'
          ? 'text-[#24260F] ring-1 ring-[#DDDCD0] hover:ring-[#24260F]'
          : 'bg-[#24260F] text-white hover:bg-olive',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[18px]"
      >
        {dir === 'prev' ? <path d="M19 12H5m7 7-7-7 7-7" /> : <path d="M5 12h14m-7-7 7 7-7 7" />}
      </svg>
    </button>
  )
}
