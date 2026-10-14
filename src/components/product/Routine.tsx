'use client'

import Image from 'next/image'
import { useRef } from 'react'

import type { ProductDetail } from '@/types/product'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/** "How to use" — photo beside numbered steps. */
export function Routine({ routine }: { routine: NonNullable<ProductDetail['routine']> }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-photo]', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power3.inOut' })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, '-=0.7')
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.4')
        .from('[data-step]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.12 }, '-=0.6')
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="routine-title"
      className="grid grid-cols-1 bg-[#F6F5EF] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
    >
      <div data-photo className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
        <Image
          src={routine.image.src}
          alt={routine.image.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center px-4 py-16 md:px-12 md:py-20 lg:px-16 xl:px-24">
        <p
          data-eyebrow
          className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
        >
          <span aria-hidden className="bg-olive size-1 rounded-full" />
          How to use
        </p>
        <h2
          id="routine-title"
          data-title
          className="mt-4 max-w-[28rem] text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[44px]"
        >
          {routine.title}
        </h2>

        <ol className="mt-10 max-w-[32rem] border-b border-[#DDDCD0]">
          {routine.steps.map((s, i) => (
            <li
              key={s.title}
              data-step
              className="flex items-start gap-4 border-t border-[#DDDCD0] py-5"
            >
              <span className="bg-olive flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-sans text-[13px] font-semibold tracking-[0.12em] text-[#24260F] uppercase">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-[1.6] text-[#6B6C5A]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
