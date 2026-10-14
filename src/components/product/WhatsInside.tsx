'use client'

import { useRef } from 'react'

import type { ProductDetail } from '@/types/product'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/** "What's inside" — dark olive band with the headline actives and the rest as chips. */
export function WhatsInside({ inside }: { inside: NonNullable<ProductDetail['inside']> }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.3')
        .from('[data-note]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.7')
        .from('[data-active]', { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 }, '-=0.5')
        .from('[data-chip]', { opacity: 0, y: 8, duration: 0.4, stagger: 0.03 }, '-=0.4')
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="inside-title"
      className="bg-[#24260F] bg-[radial-gradient(ellipse_70%_60%_at_45%_0%,#4A4F14_0%,#30330F_55%,#24260F_100%)] py-20 text-white md:py-24 lg:py-[110px]"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              data-eyebrow
              className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#B9C46A] uppercase md:text-xs"
            >
              <span aria-hidden className="size-1 rounded-full bg-[#B9C46A]" />
              What’s inside
            </p>
            <h2
              id="inside-title"
              data-title
              className="mt-4 max-w-[30rem] text-3xl leading-[1.15] font-normal tracking-[0.01em] uppercase md:text-4xl lg:text-[44px]"
            >
              {inside.title}
            </h2>
          </div>
          <p data-note className="text-sm leading-[1.6] text-white/70 md:text-right">
            {inside.note.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {inside.key.map((k, i) => (
            <li
              key={k.name}
              data-active
              className="sm:pr-8 sm:even:border-l sm:even:border-white/15 sm:even:pl-8 lg:border-white/15 lg:pl-8 lg:[&:not(:first-child)]:border-l lg:first:pl-0"
            >
              <span className="block text-4xl leading-none font-extralight text-[#B9C46A] tabular-nums md:text-[44px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 font-sans text-sm font-semibold tracking-[0.12em] uppercase">
                {k.name}
              </h3>
              <p className="mt-2 text-[13px] text-white/55 italic">{k.latin}</p>
              <p className="mt-4 text-sm leading-[1.65] text-white/75">{k.text}</p>
            </li>
          ))}
        </ol>

        {inside.also.length > 0 && (
          <div className="mt-12 border-t border-white/15 pt-6 lg:mt-14">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">
              Also inside
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {inside.also.map((a) => (
                <li
                  key={a}
                  data-chip
                  className="rounded-full border border-white/25 px-3 py-1.5 text-xs text-white/85"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
