'use client'

import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

/** Numeric values count up on reveal (any `+` or `,` is kept); text values like "NAFDAC" just fade in. */
const stats = [
  { value: '6+', label: 'Years formulating' },
  { value: '5,000+', label: 'Clients impacted' },
  { value: '107', label: 'Products & tools' },
  { value: 'NAFDAC', label: 'Approved products' },
]

/* ---------- Section ---------- */

/** Four headline numbers in a row, divided by hairlines — two by two on mobile. */
export function Stats() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
        defaults: { ease: 'power3.out' },
      })

      tl.from('[data-divider]', { scaleY: 0, duration: 0.9, stagger: 0.12, ease: 'power2.inOut' })
        .from('[data-value]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.12 }, 0.1)
        .from('[data-label]', { opacity: 0, y: 10, duration: 0.6, stagger: 0.12 }, 0.3)

      // Count numeric values up from zero, keeping their formatting
      gsap.utils.toArray<HTMLElement>('[data-value]').forEach((el, i) => {
        const match = el.textContent?.match(/^([\d,]+)(.*)$/)
        if (!match) return
        const target = Number(match[1].replace(/,/g, ''))
        const suffix = match[2]
        const counter = { n: 0 }
        tl.to(
          counter,
          {
            n: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(counter.n).toLocaleString('en-US') + suffix
            },
          },
          0.1 + i * 0.12,
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Ten-Q in numbers" className="bg-[#F6F5EF] py-12 md:py-14">
      <dl className="mx-auto grid max-w-[90rem] grid-cols-2 gap-y-10 px-4 md:px-8 lg:grid-cols-4 lg:px-16">
        {stats.map((s, i) => (
          <div key={s.label} className="relative flex flex-col-reverse items-center gap-1.5 px-2 text-center">
            {/* Hairline before every item except the first in its row */}
            <span
              data-divider
              aria-hidden
              className={cn(
                'absolute inset-y-0 left-0 w-px origin-top bg-[#DDDCD0]',
                i % 2 === 0 && 'hidden lg:block',
                i === 0 && 'lg:hidden',
              )}
            />
            <dt
              data-label
              className="text-[10px] font-semibold tracking-[0.15em] text-[#6B6C5A] uppercase md:text-[11px]"
            >
              {s.label}
            </dt>
            <dd data-value className="text-4xl leading-none font-light text-olive tabular-nums md:text-5xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
