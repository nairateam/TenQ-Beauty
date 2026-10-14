'use client'

import Image from 'next/image'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

/** Set `src` once the founder portrait is in /public; until then a placeholder shows. */
const portrait: { src?: string; alt: string } = {
  src: "/images/tenq-ceo.jpg",
  alt: 'Portrait of Ladejobi Oluwabukola, founder of Ten-Q',
}

const founder = {
  name: 'Ladejobi Oluwabukola',
  credentials: ['UK-trained cosmetic formulator', 'Scalp & hair health expert'],
  signature: 'Oluwabukola',
  quote:
    'My scalp cleared, the dandruff disappeared, and my hair gradually transformed — healthier, softer and far more manageable.',
  story: [
    'For years, my hair was excessively dry, hard and difficult to manage, and my scalp was persistently affected by dandruff. Despite trying numerous products, nothing provided lasting relief.',
    'Determined to find a real solution, I began formulating my own haircare using locally sourced botanicals rooted in African traditional knowledge — including dogoyaro. As the results became visible, people started asking what I was using. A personal solution became a shared answer.',
  ],
}

/* ---------- Section ---------- */

/** Founder portrait beside her story, pull quote and signature. */
export function MeetFounder() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const title = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      const quote = SplitText.create('[data-quote]', { type: 'lines', mask: 'lines' })

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        // Portrait reveals upwards while drifting back to scale
        .fromTo(
          '[data-portrait]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut' },
        )
        .from('[data-portrait-zoom]', { scale: 1.15, duration: 1.8 }, 0)
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, 0.3)
        .from(title.lines, { yPercent: 110, duration: 1 }, '-=0.3')
        .from('[data-credentials]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.6')
        .from('[data-quote-rule]', { scaleY: 0, transformOrigin: 'top', duration: 0.9, ease: 'power2.inOut' }, '-=0.4')
        .from(quote.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '<0.1')
        .from('[data-story]', { opacity: 0, y: 16, duration: 0.8, stagger: 0.12 }, '-=0.6')
        // Signature "writes" itself left to right
        .fromTo(
          '[data-signature]',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.inOut' },
          '-=0.3',
        )

      return () => {
        title.revert()
        quote.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="founder-title" className="bg-white py-16 md:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,29rem)_1fr] lg:items-start lg:gap-20 lg:px-14 xl:gap-24">
        {/* Portrait */}
        <div
          data-portrait
          className="relative aspect-[4/5] overflow-hidden border border-[#E3E2D8] bg-[#ECEBE4] lg:aspect-[29/37]"
        >
          <div data-portrait-zoom className="absolute inset-0">
            {portrait.src ? (
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                sizes="(min-width: 1024px) 29rem, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-[#6B6C5A]">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-7"
                >
                  <path d="M16 5h6M19 2v6" />
                  <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                  <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
                  <circle cx="9" cy="9" r="2" />
                </svg>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] uppercase">Founder portrait</p>
                <p className="text-[13px]">Add a photo of {founder.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-[40rem] lg:pt-6">
          <p
            data-eyebrow
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-olive uppercase"
          >
            <span aria-hidden className="size-1 rounded-full bg-olive" />
            Meet the founder
          </p>
          <h2
            id="founder-title"
            data-title
            className="mt-6 text-3xl leading-[1.1] font-normal tracking-[0.02em] text-[#24260F] uppercase md:text-[40px]"
          >
            {founder.name}
          </h2>
          <p data-credentials className="mt-3 text-sm text-[#6B6C5A] md:text-[15px]">
            {founder.credentials.join('  ·  ')}
          </p>

          <blockquote className="relative mt-8 pl-6 md:mt-9">
            <span data-quote-rule aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-olive" />
            <p data-quote className="font-serif text-2xl leading-[1.3] text-[#24260F] italic md:text-[30px]">
              “{founder.quote}”
            </p>
          </blockquote>

          <div className="mt-9 space-y-6 text-base leading-[1.7] text-[#6B6C5A]">
            {founder.story.map((p) => (
              <p key={p.slice(0, 24)} data-story>
                {p}
              </p>
            ))}
          </div>

          <p data-signature aria-label={`Signed, ${founder.signature}`} className="mt-9 font-serif text-4xl text-olive italic md:text-[42px]">
            {founder.signature}
          </p>
        </div>
      </div>
    </section>
  )
}
