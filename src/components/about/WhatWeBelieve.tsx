'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

/** Lucide icons (microscope, flask-conical, graduation-cap), drawn inline at 24px. */
const icons: Record<string, ReactNode> = {
  microscope: (
    <>
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </>
  ),
  flask: (
    <>
      <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
      <path d="M6.453 15h11.094" />
      <path d="M8.5 2h7" />
    </>
  ),
  cap: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
}

const pillars = [
  {
    icon: 'microscope',
    title: 'Scalp-first haircare',
    description:
      'Healthy hair starts at the root. Every formula is designed to treat the scalp first — dandruff, itch and build-up included.',
  },
  {
    icon: 'flask',
    title: 'Professional-grade formulas',
    description:
      'Formulated by a UK-trained cosmetic chemist, NAFDAC approved, and free from sulfates, parabens, drying alcohol and petroleum.',
  },
  {
    icon: 'cap',
    title: 'Education that empowers',
    description:
      'We teach women to truly understand their hair — and train the next generation of formulators and entrepreneurs.',
  },
]

/* ---------- Section ---------- */

/** "What we believe" — centred statement over three brand pillars. */
export function WhatWeBelieve() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-statement]', { type: 'lines', mask: 'lines' })

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.3')
        .from('[data-divider]', { scaleX: 0, scaleY: 0, duration: 1, stagger: 0.15, ease: 'power2.inOut' }, '-=0.5')
        .from('[data-icon]', { scale: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(2)' }, '<0.1')
        .from('[data-pillar-body]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.15 }, '<0.15')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="believe-title" className="bg-white py-20 md:py-28 lg:py-[130px]">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p
            data-eyebrow
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-olive uppercase md:text-xs"
          >
            <span aria-hidden className="size-1 rounded-full bg-olive" />
            What we believe
          </p>
          <h2
            id="believe-title"
            data-statement
            className="mt-5 max-w-[22ch] text-[1.75rem] leading-[1.25] font-normal tracking-[0.01em] text-[#24260F] uppercase md:max-w-none md:text-4xl lg:text-[40px]"
          >
            Our work sits at the intersection of
            <br className="hidden md:block" /> science, tradition and intention
          </h2>
        </div>

        {/* Pillars — stacked with rules between on mobile, three columns with dividers from lg up */}
        <ul className="mt-14 grid lg:mt-[72px] lg:grid-cols-3">
          {pillars.map((p, i) => (
            <li
              key={p.title}
              className="relative py-8 first:pt-0 lg:px-12 lg:py-2 lg:first:pt-2 lg:first:pl-0 lg:last:pr-0"
            >
              {i > 0 && (
                <span
                  data-divider
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[#DDDCD0] lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-px lg:origin-top"
                />
              )}
              <span
                data-icon
                aria-hidden
                className="flex size-14 items-center justify-center rounded-full bg-[#F6F5EF] text-olive"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  {icons[p.icon]}
                </svg>
              </span>
              <div data-pillar-body className="mt-5">
                <h3 className="text-base font-normal tracking-[0.08em] text-[#24260F] uppercase">{p.title}</h3>
                <p className="mt-5 max-w-[30rem] text-base leading-[1.625] text-[#6B6C5A]">{p.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
