'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { Container } from '@/components/ui'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import type { RoutineStep } from '@/types/product'

const TICK = 56 // resting stroke width (px)
const STEP_DURATION = 5 // seconds each step stays active

/* ---------- Section ---------- */

/** "4 Essential Steps" — the Ten-Q routine. One step is active at a time; hover/focus/tap moves it. */
export function EssentialSteps({ steps }: { steps: RoutineStep[] }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false) // mouse over / keyboard focus on a step
  const [inView, setInView] = useState(false)

  // Only run the loop while the section is on screen.
  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top 75%',
      end: 'bottom 25%',
      onToggle: (self) => setInView(self.isActive),
    })
    return () => st.kill()
  })

  // The active stroke grows like a progress bar until it reaches the next step's marker,
  // then the next step takes over. Hovering/focusing a step holds it fully grown.
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-step]', root.current)
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', root.current)
      const item = items[active]
      const bar = bars[active]
      if (!item || !bar) return

      bars.forEach((b, i) => {
        if (i !== active) gsap.to(b, { width: TICK, duration: 0.5, ease: 'power2.out', overwrite: true })
      })

      // Stretch across the column gap to the next marker when it sits in the same row.
      const next = items[active + 1]
      const target =
        next && next.offsetTop === item.offsetTop ? next.offsetLeft - item.offsetLeft : item.offsetWidth

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (paused || !inView || reduceMotion) {
        gsap.to(bar, { width: target, duration: 0.6, ease: 'power2.out', overwrite: true })
        return
      }

      const current = bar.offsetWidth
      const remaining = Math.max(0, (target - current) / Math.max(1, target - TICK))
      gsap.to(bar, {
        width: target,
        duration: STEP_DURATION * remaining,
        ease: 'none',
        overwrite: true,
        onComplete: () => setActive((a) => (a + 1) % steps.length),
      })
    },
    { scope: root, dependencies: [active, paused, inView], revertOnUpdate: false },
  )

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'words', mask: 'words' })
      const trigger = { trigger: root.current, start: 'top 80%', once: true }

      gsap
        .timeline({ scrollTrigger: trigger, defaults: { ease: 'power3.out' } })
        .from('[data-numeral]', { opacity: 0, yPercent: 20, duration: 1.1 })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, '<0.15')
        .from(split.words, { yPercent: 110, duration: 1, stagger: 0.08 }, '-=0.4')
        .from('[data-intro]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.6')
        .from('[data-cta]', { opacity: 0, duration: 0.6 }, '-=0.5')
        .from('[data-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power2.inOut' }, '-=0.6')
        .from('[data-step]', { opacity: 0, y: 32, duration: 0.9, stagger: 0.1 }, '-=0.9')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="routine" aria-labelledby="steps-title" className="scroll-mt-20 py-20 md:py-28 lg:py-32">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5 md:gap-7">
            <span
              data-numeral
              aria-hidden
              className="text-[120px] leading-[0.9] font-extralight text-[#8C9A2E] md:text-[200px]"
            >
              4
            </span>
            <div>
              <p
                data-eyebrow
                className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-olive uppercase md:text-xs"
              >
                <span aria-hidden className="size-1 rounded-full bg-olive" />
                The Ten-Q routine
              </p>
              <h2
                id="steps-title"
                data-title
                className="text-3xl font-medium tracking-[0.01em] text-[#24260F] uppercase md:text-5xl"
              >
                Essential steps
              </h2>
              <p data-intro className="mt-3 max-w-[34ch] text-base leading-snug text-[#6B6C5A] md:text-lg">
                that cleanse, strengthen and protect textured hair from root to tip.
              </p>
            </div>
          </div>

          <Link
            data-cta
            href="/shop"
            className="self-start bg-[#24260F] px-8 py-4 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-olive md:self-auto"
          >
            Shop the routine
          </Link>
        </div>

        {/* Timeline */}
        <div className="relative mt-14 md:mt-18">
          <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-[#DDDCD0]" />

          <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const isActive = i === active
              return (
                <li
                  key={s.step}
                  data-step
                  tabIndex={0}
                  aria-current={isActive ? 'step' : undefined}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse') return
                    setActive(i)
                    setPaused(true)
                  }}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
                  onFocus={() => {
                    setActive(i)
                    setPaused(true)
                  }}
                  onBlur={() => setPaused(false)}
                  onClick={() => setActive(i)}
                  className="group relative cursor-default outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-4"
                >
                  {/* Marker: width is driven by GSAP (progress towards the next step) */}
                  <span data-bar aria-hidden className="relative z-10 block h-[2px] w-14 -translate-y-px bg-olive" />

                  <div className="flex items-center justify-between pt-9 pb-2">
                    <div>
                      <span className="text-sm font-medium text-olive">{i + 1}/</span>
                      <h3
                        className={cn(
                          'mt-1.5 text-[26px] font-semibold tracking-[0.04em] uppercase transition-[color,translate] duration-500 lg:text-[28px]',
                          isActive ? 'translate-x-1 text-olive' : 'text-[#24260F]',
                        )}
                      >
                        {s.step}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'relative size-[84px] shrink-0 overflow-hidden rounded-full ring-1 transition-[scale,box-shadow] duration-500 ease-out',
                        isActive ? 'scale-110 shadow-lg ring-olive/40' : 'ring-transparent',
                      )}
                    >
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="96px"
                        className={cn(
                          'object-cover transition-transform duration-700 ease-out',
                          isActive && 'scale-110',
                        )}
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-xs font-semibold tracking-[0.1em] text-olive uppercase">{s.product}</p>
                  <p
                    className={cn(
                      'mt-5 max-w-[34ch] text-base leading-relaxed transition-colors duration-500',
                      isActive ? 'text-[#24260F]' : 'text-[#6B6C5A]',
                    )}
                  >
                    {s.text}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </Container>
    </section>
  )
}
