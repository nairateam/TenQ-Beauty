'use client'

import Image from 'next/image'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/**
 * Pinned photo reveal under the About hero. The image starts as a small rounded
 * frame, opens to full-bleed as you scroll, then a caption rises over it.
 */
export function AboutReveal() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section) return

      const split = SplitText.create('[data-caption]', { type: 'lines', mask: 'lines' })
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Frame size as an inset from each edge, so it stays responsive on refresh
        const startClip = () => {
          const w = section.clientWidth
          const h = section.clientHeight
          const fw = Math.min(w * (w < 768 ? 0.78 : 0.42), 560)
          const fh = Math.min(h * 0.5, fw * 0.75)
          const x = (w - fw) / 2
          const y = (h - fh) / 2
          return `inset(${y}px ${x}px ${y}px ${x}px round 24px)`
        }

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=160%',
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            '[data-frame]',
            { clipPath: startClip },
            { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.7, ease: 'power2.inOut' },
            0,
          )
          .fromTo('[data-photo]', { scale: 1.35 }, { scale: 1, duration: 0.7, ease: 'power2.inOut' }, 0)
          .fromTo('[data-shade]', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.55)
          .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.15 }, 0.7)
          .from(split.lines, { yPercent: 110, duration: 0.2, stagger: 0.04, ease: 'power3.out' }, 0.72)
          // Short hold so the finished frame sits before the pin releases
          .to({}, { duration: 0.15 })
      })

      return () => {
        mm.revert()
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Made for every crown" className="relative h-svh overflow-hidden bg-[#F6F5EF]">
      <div data-frame className="absolute inset-0 overflow-hidden">
        <Image
          data-photo
          src="/images/about-together.webp"
          alt="Three women seen from behind — a high bun, long box braids and a full afro"
          fill
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        <div
          data-shade
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-center md:pb-20">
          <p
            data-eyebrow
            className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#F6F5EF]/80 uppercase md:text-xs"
          >
            <span aria-hidden className="size-1 rounded-full bg-[#F6F5EF]/80" />
            For every texture
          </p>
          <h2
            data-caption
            className="mx-auto mt-4 max-w-[16ch] text-4xl leading-[1.02] font-medium tracking-[0.01em] text-[#F6F5EF] uppercase sm:text-5xl lg:text-[72px]"
          >
            Made for every crown.
          </h2>
        </div>
      </div>
    </section>
  )
}
