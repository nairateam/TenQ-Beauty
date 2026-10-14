'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { Container } from '@/components/ui'
import type { Testimonial } from '@/types/product'
import { formatPrice } from '@/lib/format'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const STEP_DURATION = 8 // seconds each review stays up

/** "In their words" — one featured review at a time; tabs below show progress and switch reviews. */
export function Testimonials({
  rating,
  testimonials,
}: {
  rating: string
  testimonials: Testimonial[]
}) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false) // pointer over / focus inside the section
  const [inView, setInView] = useState(false)
  const firstRender = useRef(true)

  const review = testimonials[active]
  const go = (dir: 1 | -1) =>
    setActive((a) => (a + dir + testimonials.length) % testimonials.length)

  // Only auto-advance while the section is on screen
  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top 75%',
      end: 'bottom 25%',
      onToggle: (self) => setInView(self.isActive),
    })
    return () => st.kill()
  })

  // Entrance
  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-topbar]', { opacity: 0, y: 12, duration: 0.6 })
        .from(
          '[data-mark]',
          { opacity: 0, scale: 0.6, duration: 0.8, ease: 'back.out(2)' },
          '-=0.3',
        )
        .from('[data-part]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, '-=0.5')
        // Inner spans, not the buttons: the buttons' CSS opacity transition would fight the tween
        .from('[data-tab] > span', { opacity: 0, y: 16, duration: 0.6, stagger: 0.05 }, '-=0.5')
    },
    { scope: root },
  )

  // Review swap: quote words rise in, the rest follows
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false
        return
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const split = SplitText.create('[data-quote]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: () => split.revert() })
        .from('[data-headline]', { opacity: 0, y: 10, duration: 0.5 })
        .from(split.lines, { yPercent: 100, duration: 0.8, stagger: 0.07 }, '<0.05')
        .from('[data-byline] > *', { opacity: 0, y: 12, duration: 0.6, stagger: 0.08 }, '-=0.5')
    },
    { scope: root, dependencies: [active], revertOnUpdate: false },
  )

  // Progress: the active tab's line fills, then the next review takes over.
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

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) {
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
    <section
      ref={root}
      aria-labelledby="testimonials-title"
      aria-roledescription="carousel"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      className="relative z-10 bg-[#2B2F10] bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(106,114,15,0.35),transparent)] py-20 text-white shadow-[0_30px_60px_-10px_rgba(0,0,0,0.45)] md:pt-28 md:pb-18"
    >
      <Container>
        {/* Top bar */}
        <div data-topbar className="flex items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2
              id="testimonials-title"
              className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#C9D27A] uppercase md:text-xs"
            >
              <span aria-hidden className="size-1 rounded-full bg-[#C9D27A]" />
              In their words
            </h2>
            <span aria-hidden className="hidden h-3.5 w-px bg-white/15 sm:block" />
            <p className="text-[13px] text-white/70 md:text-sm">
              <span aria-hidden className="mr-1.5 tracking-[0.1em]">
                ★★★★★
              </span>
              {rating}
            </p>
          </div>

          <div className="flex shrink-0 gap-2.5">
            <ArrowButton dir="prev" onClick={() => go(-1)} />
            <ArrowButton dir="next" onClick={() => go(1)} />
          </div>
        </div>

        {/* Featured review */}
        <figure
          aria-live="polite"
          className="mx-auto mt-12 flex max-w-[1000px] flex-col items-center text-center md:mt-14"
        >
          <span
            data-mark
            aria-hidden
            className="h-14 font-serif text-[140px] leading-[0.9] text-[#C9D27A] md:h-[72px] md:text-[180px]"
          >
            “
          </span>
          <div data-part className="mt-6 md:mt-9">
            <p
              data-headline
              className="text-[11px] font-semibold tracking-[0.18em] text-[#C9D27A] uppercase md:text-[13px]"
            >
              {review.headline}
            </p>
          </div>
          <blockquote data-part className="mt-6 md:mt-9">
            <p
              data-quote
              key={active}
              className="text-[22px] leading-[1.4] font-light md:text-[32px] md:leading-[1.35] lg:text-[38px]"
            >
              {review.quote}
            </p>
          </blockquote>

          <figcaption
            data-part
            className="mt-9 flex flex-col items-center gap-6 sm:flex-row sm:gap-8"
          >
            <div data-byline className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              {/* Reviewer */}
              <div className="flex items-center gap-3.5 text-left">
                <Avatar
                  src={review.avatar.src}
                  position={review.avatar.position}
                  className="size-[52px] ring-[1.5px] ring-[#C9D27A]"
                />
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/70">
                    <CheckIcon />
                    Verified purchase
                  </p>
                </div>
              </div>

              <span aria-hidden className="hidden h-10 w-px bg-white/15 sm:block" />

              {/* Shop the product */}
              <Link
                href={review.product.href}
                className="group flex items-center gap-3.5 rounded-full bg-white/[0.06] py-2 pr-5 pl-2 text-left ring-1 ring-white/15 transition-colors hover:bg-white/10"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white">
                  <Image
                    src={review.product.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase">
                    {review.product.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-white/70">
                    {review.product.fromPrice && 'From '}
                    {formatPrice(review.product.price)}
                  </span>
                </span>
                <span className="ml-2 text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap text-[#C9D27A] uppercase">
                  Shop{' '}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </div>
          </figcaption>
        </figure>

        {/* Review tabs */}
        <div
          role="tablist"
          aria-label="Customer reviews"
          className="mt-14 grid grid-cols-3 gap-4 md:mt-16 md:gap-8"
        >
          {testimonials.map((t, i) => {
            const selected = i === active
            return (
              <button
                key={t.headline}
                data-tab
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={t.headline}
                onClick={() => setActive(i)}
                className={cn(
                  'group pt-6 text-left transition-opacity duration-500 outline-none focus-visible:ring-2 focus-visible:ring-[#C9D27A]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#2B2F10]',
                  selected ? 'opacity-100' : 'opacity-55 hover:opacity-80',
                )}
              >
                {/* Progress line */}
                <span aria-hidden className="relative block h-0.5 w-full bg-white/15">
                  <span data-fill className="absolute inset-0 origin-left scale-x-0 bg-[#C9D27A]" />
                </span>

                <span className="mt-5 flex items-center gap-3.5">
                  <Avatar
                    src={t.avatar.src}
                    position={t.avatar.position}
                    className="hidden size-10 md:block"
                  />
                  <span className="hidden min-w-0 flex-1 md:block">
                    <span className="font-heading block truncate text-[17px]">{t.headline}</span>
                    <span className="mt-1 block truncate text-[13px] text-white/70">{t.meta}</span>
                  </span>
                  <span className="text-xs font-medium tracking-[0.08em] text-white/70 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

function Avatar({
  src,
  position,
  className,
}: {
  src: string
  position?: string
  className?: string
}) {
  return (
    <span className={cn('relative shrink-0 overflow-hidden rounded-full', className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </span>
  )
}

function ArrowButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous review' : 'Next review'}
      className={cn(
        'grid size-11 place-items-center rounded-full ring-1 transition-colors md:size-12',
        dir === 'prev'
          ? 'text-white/50 ring-white/30 hover:text-white hover:ring-white'
          : 'text-white ring-white hover:bg-white hover:text-[#2B2F10]',
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9D27A"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  )
}
