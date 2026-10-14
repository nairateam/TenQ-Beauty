'use client'

import { getImageProps } from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

type Slide = {
  desktop: string
  mobile: string
  alt: string
}

const slides: Slide[] = [
  {
    desktop: '/images/fall.jpg',
    mobile: '/hero/model-mobile.webp',
    alt: 'Woman with long natural curls holding Bloom Hair Growth Serum',
  },
  {
    desktop: '/images/hero-fallback.jpg',
    mobile: '/hero/range-mobile.webp',
    alt: 'Ten-Q natural hair care range on stone plinths with fresh botanicals',
  },
    {
    desktop: '/images/personal.jpg',
    mobile: '/hero/range-mobile.webp',
    alt: 'Ten-Q natural hair care range on stone plinths with fresh botanicals',
  },
]

const SLIDE_DURATION = 6 // seconds each image stays on screen

/** Art-directed image: wide crop on desktop, portrait crop on phones. */
function HeroImage({ slide, priority }: { slide: Slide; priority: boolean }) {
  const common = { alt: slide.alt, sizes: '100vw', priority }
  const { props: desktop } = getImageProps({ ...common, src: slide.desktop, width: 1672, height: 941 })
  const { props: mobile } = getImageProps({ ...common, src: slide.mobile, width: 705, height: 941 })

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop.srcSet} />
      <source srcSet={mobile.srcSet} />
      <img {...desktop} alt={slide.alt} className="size-full object-cover" />
    </picture>
  )
}

/**
 * Full-screen home hero.
 * Images cross-fade with a slow zoom; the headline reveals line by line.
 * The header sits on top of it (no top padding needed).
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-slide]')
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Headline + copy entrance
      const split = SplitText.create('[data-hero-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.1, delay: 0.2 })
        .from('[data-hero-fade]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, '-=0.6')

      if (reduced || items.length < 2) return () => split.revert()

      // Slideshow: the next slide fades in on top with a slow zoom-out, then hands over
      const FADE = 1.2
      let current = 0
      let timer: gsap.core.Tween | undefined

      const zoom = (el: HTMLElement) =>
        gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: SLIDE_DURATION + FADE, ease: 'none' })

      const showNext = () => {
        const prev = items[current]
        current = (current + 1) % items.length
        const next = items[current]

        gsap.set(prev, { zIndex: 0 })
        gsap.set(next, { zIndex: 1 })
        zoom(next)
        gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: FADE, ease: 'power2.inOut' })
        gsap.to(prev, { opacity: 0, duration: 0, delay: FADE })

        timer = gsap.delayedCall(SLIDE_DURATION, showNext)
      }

      zoom(items[0])
      timer = gsap.delayedCall(SLIDE_DURATION, showNext)

      return () => {
        timer?.kill()
        gsap.killTweensOf(items)
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative h-svh min-h-[36rem] overflow-hidden bg-[#ece3d8]">
      {/* Images */}
      <div aria-hidden className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.desktop}
            data-slide
            className="absolute inset-0 will-change-transform"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <HeroImage slide={slide} priority={i === 0} />
          </div>
        ))}
      </div>

      {/* Soft fade so text stays readable: bottom on phones, right side on desktop */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-t from-[#f3ece3] via-[#f3ece3]/40 to-transparent md:bg-gradient-to-l md:from-[#f3ece3]/80 md:via-transparent"
      />

      {/* Copy */}
      <div className="relative z-20 flex h-full items-end px-5 pb-14 md:items-center md:justify-end md:px-10 md:pb-0 lg:px-15">
        <div className="max-w-xl text-brand md:text-right">
          <p data-hero-fade className="mb-5 text-xs tracking-[0.25em] uppercase">
            Natural hair care
          </p>
          <h1 data-hero-title className="font-display text-5xl leading-[0.95] font-bold md:text-7xl lg:text-8xl">
            Rooted in nature, made for your crown
          </h1>
          <p data-hero-fade className="mt-6 text-lg md:ml-auto md:max-w-sm">
            Botanical formulas for growth, moisture and healthy edges.
          </p>
          <Link
            data-hero-fade
            href="/shop"
            className="mt-8 inline-block bg-brand px-8 py-4 text-sm tracking-[0.15em] text-white uppercase transition-opacity hover:opacity-85"
          >
            Shop the range
          </Link>
        </div>
      </div>
    </section>
  )
}