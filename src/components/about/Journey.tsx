'use client'

import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

/** `highlight` fills that chapter's node — the moment Ten-Q Beauty was born. */
const chapters: { title: string; description: string; highlight?: boolean }[] = [
  {
    title: 'The struggle',
    description:
      'Years of dry, hard hair and a scalp that never stopped flaking — and products that never brought lasting relief.',
  },
  {
    title: 'The experiment',
    description:
      'Researching and formulating with locally sourced botanicals and herbs, including dogoyaro, rooted in African tradition.',
  },
  {
    title: 'The proof',
    description: 'The scalp cleared, the dandruff disappeared — and people started asking what she was using.',
  },
  {
    title: 'Ten-Q Beauty',
    description:
      'Passion became purpose: effective, intentional haircare for anyone who had struggled for too long.',
    highlight: true,
  },
  {
    title: 'The family grows',
    description:
      'Onidiri Natural Hair Salon in Ibadan and the Ten-Q Formulation School, training the next formulators.',
  },
]

/* ---------- Section ---------- */

/** "The journey" — five-chapter timeline on a dark olive ground. */
export function Journey() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      const mm = gsap.matchMedia()

      const tl = gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.12 }, '-=0.3')
        .from('[data-note]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')

      // The rail draws along the timeline's axis, then each chapter follows it in
      mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' }, (ctx) => {
        const desktop = ctx.conditions?.desktop
        tl.fromTo(
          '[data-rail]',
          { scaleX: desktop ? 0 : 1, scaleY: desktop ? 1 : 0 },
          { scaleX: 1, scaleY: 1, duration: 1.6, ease: 'power2.inOut' },
          '-=0.4',
        )
          .from('[data-node]', { scale: 0, duration: 0.5, stagger: 0.25, ease: 'back.out(2.5)' }, '<0.1')
          .from('[data-chapter-body]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.25 }, '<0.1')
      })

      return () => {
        mm.revert()
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="journey-title"
      className="bg-[#2B2F10] bg-[radial-gradient(ellipse_60%_60%_at_15%_0%,#6A720F4D_0%,#6A720F00_100%)] py-20 text-white md:py-28 lg:py-[120px]"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              data-eyebrow
              className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#C9D27A] uppercase md:text-xs"
            >
              <span aria-hidden className="size-1 rounded-full bg-[#C9D27A]" />
              The journey
            </p>
            <h2
              id="journey-title"
              data-title
              className="mt-4 text-3xl leading-[1.16] font-normal tracking-[0.01em] uppercase md:text-4xl lg:text-[44px]"
            >
              From a personal struggle
              <br className="hidden sm:block" /> to a shared answer
            </h2>
          </div>
          <p data-note className="text-base leading-relaxed text-white/70 md:text-right md:text-[17px]">
            6+ years of formulating,
            <br className="hidden md:block" /> one scalp-first philosophy.
          </p>
        </div>

        {/* Timeline — a vertical rail on mobile, a horizontal one from lg up */}
        <ol className="relative mt-14 grid gap-12 pl-8 lg:mt-[72px] lg:grid-cols-5 lg:gap-8 lg:pl-0">
          <span
            data-rail
            aria-hidden
            className="absolute top-0 bottom-0 left-[5.5px] w-px origin-top bg-white/20 lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto lg:origin-left"
          />
          {chapters.map((c, i) => (
            <li key={c.title} className="relative lg:pt-[22px]">
              <span
                data-node
                aria-hidden
                className={cn(
                  'absolute top-1.5 -left-8 size-3 rounded-full border-[1.5px] border-[#C9D27A] lg:-top-1.5 lg:left-0',
                  c.highlight ? 'bg-[#C9D27A]' : 'bg-[#2B2F10]',
                )}
              />
              <div data-chapter-body className="flex flex-col gap-4">
                <span className="text-[40px] leading-none font-extralight text-[#C9D27A] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-normal tracking-[0.12em] uppercase">{c.title}</h3>
                <p className="max-w-[28rem] text-[15px] leading-6 text-white/70">{c.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
