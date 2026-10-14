'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

const quote = 'Welcome to the home of intentional, natural haircare — where beauty is powered by nature.'

const attribution = 'Ladejobi Oluwabukola, Founder'

const ctas = {
  primary: { label: 'Shop haircare', href: '/shop' },
  secondary: { label: 'Find your routine', href: '/#routine' },
}

/* ---------- Section ---------- */

/** Closing founder line on the olive ground, with the two final calls to action. */
export function ClosingCta() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-quote]', { type: 'lines', mask: 'lines' })

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12 })
        .from('[data-attribution]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.5')
        .from('[data-cta]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 }, '-=0.4')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="A note from the founder" className="bg-olive py-20 text-white md:py-28 lg:py-[120px]">
      <figure className="mx-auto flex max-w-[90rem] flex-col items-center px-4 text-center md:px-8 lg:px-16">
        <blockquote>
          <p
            data-quote
            className="max-w-[60rem] font-serif text-[2rem] leading-[1.15] italic md:text-[40px] lg:text-[48px]"
          >
            “{quote}”
          </p>
        </blockquote>
        <figcaption
          data-attribution
          className="mt-8 text-[11px] font-semibold tracking-[0.15em] text-white/80 uppercase md:text-xs"
        >
          — {attribution}
        </figcaption>

        <div className="mt-11 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            data-cta
            href={ctas.primary.href}
            className="bg-white px-[34px] py-[18px] text-[13px] font-semibold tracking-[0.11em] text-[#24260F] uppercase transition-colors duration-300 hover:bg-[#F6F5EF]"
          >
            {ctas.primary.label}
          </Link>
          <Link
            data-cta
            href={ctas.secondary.href}
            className="border border-white px-[34px] py-[17px] text-[13px] font-semibold tracking-[0.11em] text-white uppercase transition-colors duration-300 hover:bg-white hover:text-[#24260F]"
          >
            {ctas.secondary.label}
          </Link>
        </div>
      </figure>
    </section>
  )
}
