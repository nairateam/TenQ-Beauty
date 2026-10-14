'use client'

import Image from 'next/image'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

/** Set `src` once the botanicals photo is in /public; until then a placeholder shows. */
const image: { src?: string; alt: string } = {
  alt: 'African botanicals — neem leaves, chebe, baobab and moringa',
}

const botanicals = ['Dogoyaro (neem)', 'Chebe', 'Baobab', 'Moringa', 'Rosemary']

const freeFrom = ['Sulfates', 'Parabens', 'Drying alcohol', 'Petroleum']

/* ---------- Section ---------- */

/** "Rooted in tradition" — botanicals photo beside the ingredient story and free-from list. */
export function RootedInTradition() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })

      // Gentle parallax on the photo while the section scrolls by
      gsap.fromTo(
        '[data-img]',
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        // Photo wipes in from the left while drifting back to scale
        .fromTo(
          '[data-img-wrap]',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut' },
        )
        .from('[data-img-zoom]', { scale: 1.2, duration: 1.8 }, 0)
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, 0.3)
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.3')
        .from('[data-body]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
        .from('[data-chip]', { opacity: 0, y: 12, scale: 0.9, duration: 0.5, stagger: 0.07 }, '-=0.4')
        .from('[data-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'power2.inOut' }, '-=0.3')
        .from('[data-free]', { opacity: 0, x: -10, duration: 0.5, stagger: 0.08 }, '-=0.6')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="tradition-title" className="grid bg-[#F6F5EF] lg:grid-cols-[minmax(0,700px)_1fr]">
      {/* Image */}
      <div
        data-img-wrap
        className="relative aspect-[4/3] overflow-hidden bg-[#ECEBE4] lg:aspect-auto lg:min-h-[720px]"
      >
        {/* Taller than the frame so the parallax never shows an edge */}
        <div data-img className="absolute inset-x-0 -inset-y-[8%]">
          <div data-img-zoom className="absolute inset-0">
            {image.src ? (
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] font-semibold tracking-[0.16em] text-[#6B6C5A] uppercase">
                Botanicals photo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="flex items-center px-4 py-16 md:px-8 md:py-20 lg:px-16 xl:px-24">
        <div className="w-full max-w-[36rem]">
          <p
            data-eyebrow
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-olive uppercase md:text-xs"
          >
            <span aria-hidden className="size-1 rounded-full bg-olive" />
            Rooted in tradition
          </p>
          <h2
            id="tradition-title"
            data-title
            className="mt-7 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px]"
          >
            African botanicals,
            <br /> measured by science
          </h2>
          <p data-body className="mt-7 text-base leading-[1.65] text-[#6B6C5A] md:text-[17px]">
            Our formulas start with herbs and oils that African women have trusted for generations — then we refine
            them in the lab for consistency, safety and results you can see.
          </p>

          <ul aria-label="Key botanicals" className="mt-7 flex flex-wrap gap-2">
            {botanicals.map((b) => (
              <li
                key={b}
                data-chip
                className="rounded-full border border-[#24260F] px-4 py-[9px] text-sm leading-none text-[#24260F]"
              >
                {b}
              </li>
            ))}
          </ul>

          <div className="relative mt-7 pt-6">
            <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-[#DDDCD0]" />
            <p className="text-[11px] font-semibold tracking-[0.15em] text-[#6B6C5A] uppercase">Always free from</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {freeFrom.map((f) => (
                <li key={f} data-free className="flex items-center gap-2 text-[15px] text-[#24260F]">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-olive"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="9" x2="15" y1="15" y2="9" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
