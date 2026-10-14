'use client'

import { useRef, type ReactNode } from 'react'

import { Container } from '@/components/ui'
import { gsap, useGSAP } from '@/lib/gsap'

/* ---------- Icons (inline, inherit currentColor) ---------- */

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const icons = {
  globe: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  flask: (
    <svg {...iconProps}>
      <path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" />
      <path d="M7 15h10" />
    </svg>
  ),
  leaf: (
    <svg {...iconProps}>
      <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
      <path d="M5 19c3-4 6-7 10-9" />
    </svg>
  ),
  shield: (
    <svg {...iconProps}>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
} satisfies Record<string, ReactNode>

/* ---------- Content (edit here) ---------- */

type Promise = {
  icon: keyof typeof icons
  title: string
  text: string
}

const promises: Promise[] = [
  {
    icon: 'globe',
    title: 'Worldwide delivery',
    text: 'Your Ten-Q favourites, wherever you are.',
  },
  {
    icon: 'flask',
    title: 'Science-backed',
    text: 'Formulated by a UK-trained cosmetic chemist.',
  },
  {
    icon: 'leaf',
    title: 'Made for textured hair',
    text: 'Kinks, coils, curls, TWAs and locs.',
  },
  {
    icon: 'shield',
    title: 'Clean by design',
    text: 'No sulfates, parabens, drying alcohol or petroleum.',
  },
]

/* ---------- Section ---------- */

export function BrandPromises() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('[data-promise]', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Why Ten-Q" className="bg-cream py-10 md:py-12">
      <Container>
        <ul className="grid gap-y-8 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-0">
          {promises.map(({ icon, title, text }) => (
            <li
              key={title}
              data-promise
              className="flex gap-4 lg:border-l lg:border-foreground/10 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="mt-0.5 shrink-0 text-olive">{icons[icon]}</span>
              <div>
                <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase">{title}</h3>
                <p className="mt-1.5 max-w-[26ch] text-sm leading-relaxed text-foreground/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}