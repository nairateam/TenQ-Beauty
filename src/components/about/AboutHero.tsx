'use client'

import { useRef } from 'react'

import { Container } from '@/components/ui'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/** About page intro — centred eyebrow, two-line headline and a short subhead. */
export function AboutHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.3')
        .from('[data-subhead]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="about-title"
      className="bg-[#F6F5EF] pt-[calc(var(--header-height)+3.5rem)] pb-14 md:pt-[calc(var(--header-height)+6rem)] md:pb-[4.5rem]"
    >
      <Container className="flex flex-col items-center text-center">
        <p
          data-eyebrow
          className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
        >
          <span aria-hidden className="bg-olive size-1 rounded-full" />
          Our story
        </p>
        <h1
          id="about-title"
          data-title
          className="mt-6 text-[2.75rem] leading-[1.02] font-medium tracking-[0.01em] text-[#24260F] uppercase sm:text-6xl md:mt-7 lg:text-[88px]"
        >
          Beauty, powered
          <br />
          by nature.
        </h1>
        <p
          data-subhead
          className="mt-6 max-w-[38rem] text-base leading-relaxed text-[#6B6C5A] md:mt-7 md:text-xl md:leading-[1.5]"
        >
          Ten-Q began with one woman’s search for a healthy scalp —{' '}
          <br className="hidden md:block" />
          and grew into a home for intentional, natural haircare.
        </p>
      </Container>
    </section>
  )
}
