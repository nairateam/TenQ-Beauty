'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

const image = {
  // Placeholder until the braids/afro group shot is added to /public
  src: '/images/tenq-ladies.jpg',
  alt: 'Three women with natural afro hair, one holding Ten-Q Bloom Hair Growth Serum',
}

/** `count` animates up from 0; leave it out for text-only stats. */
const stats: { value: string; count?: number; suffix?: string; label: string }[] = [
  { value: '6+', count: 6, suffix: '+', label: 'Years formulating' },
  { value: '5,000+', count: 5000, suffix: '+', label: 'Clients impacted' },
  { value: 'NAFDAC', label: 'Approved formulas' },
]

/* ---------- Section ---------- */

/** "Our story" — founder intro beside a full-height image. */
export function OurStory() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      // Gentle parallax on the image while the section scrolls by
      gsap.fromTo(
        '[data-img]',
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      const tl = gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        // Image reveals upwards while drifting back to scale
        .fromTo(
          '[data-img-wrap]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut' },
        )
        .from('[data-img-zoom]', { scale: 1.2, duration: 1.8 }, 0)
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, 0.3)
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.3')
        .from('[data-body]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
        .from('[data-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'power2.inOut' }, '-=0.5')
        .from('[data-stat]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 }, '-=0.6')
        .from('[data-founder]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.4')

      // Count the numeric stats up as they appear
      gsap.utils.toArray<HTMLElement>('[data-count]', root.current).forEach((el) => {
        const end = Number(el.dataset.count)
        const suffix = el.dataset.suffix ?? ''
        const n = { v: 0 }
        tl.fromTo(
          n,
          { v: 0 },
          {
            v: end,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = `${Math.round(n.v).toLocaleString('en-NG')}${suffix}`
            },
          },
          '<',
        )
      })

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="story-title" className="grid bg-white lg:grid-cols-[47%_1fr]">
      {/* Image */}
      <div data-img-wrap className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:min-h-[48rem]">
        {/* Taller than the frame so the parallax never shows an edge */}
        <div data-img className="absolute inset-x-0 -inset-y-[8%]">
          <div data-img-zoom className="absolute inset-0">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 47vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="flex items-center px-4 py-16 md:px-8 md:py-24 lg:px-16 xl:px-24">
        <div className="w-full max-w-[34rem]">
          <p
            data-eyebrow
            className="mb-5 flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-olive uppercase"
          >
            <span aria-hidden className="size-1 rounded-full bg-olive" />
            Our story
          </p>
          <h2
            id="story-title"
            data-title
            className="text-3xl leading-[1.15] font-normal tracking-[0.02em] text-[#24260F] uppercase md:text-5xl"
          >
            Born from a love for African hair
          </h2>
          <p data-body className="mt-7 text-base leading-relaxed text-[#6B6C5A] md:text-[17px]">
            After a childhood of dandruff and coarse, dry hair, our founder set out to make natural hair care
            easier, healthier and more enjoyable — for women, men and children in Africa and beyond. Ten-Q Beauty
            is rooted in science and inspired by nature, blending the best African herbs and oils with deep
            respect for your kinks, coils, TWAs and locs.
          </p>

          <div className="relative mt-8 pt-8">
            <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-[#DDDCD0]" />
            <dl className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} data-stat className="flex flex-col-reverse gap-2">
                  <dt className="text-[10px] font-medium tracking-[0.14em] text-[#24260F]/70 uppercase md:text-[11px]">
                    {s.label}
                  </dt>
                  <dd
                    data-count={s.count}
                    data-suffix={s.suffix}
                    className="text-2xl font-light text-[#8C9A2E] tabular-nums md:text-3xl"
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-founder className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-base font-medium text-[#24260F]">Ladejobi Oluwabukola</p>
              <p className="mt-1 text-sm text-[#6B6C5A]">Founder &amp; UK-trained cosmetic formulator</p>
            </div>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#24260F] uppercase hover:text-olive"
            >
              Read her story
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
