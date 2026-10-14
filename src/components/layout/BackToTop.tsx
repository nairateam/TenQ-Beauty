'use client'

import { useLenis } from 'lenis/react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/** Shown once the page has scrolled this far (px) */
const SHOW_AFTER = 400
const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Sticky "back to top" button whose ring fills as you scroll down the page. */
export function BackToTop() {
  const ring = useRef<SVGCircleElement>(null)
  const [visible, setVisible] = useState(false)

  const lenis = useLenis(({ scroll, progress }) => {
    // Drawn straight onto the ring every frame, without re-rendering
    ring.current?.style.setProperty('stroke-dashoffset', String(CIRCUMFERENCE * (1 - progress)))
    setVisible(scroll > SHOW_AFTER)
  })

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (lenis) lenis.scrollTo(0, { immediate: reduce, duration: 1.4 })
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        'group relative flex size-[52px] items-center justify-center rounded-full bg-white/90 text-[#24260F] shadow-[0_8px_24px_rgba(36,38,15,0.14)] backdrop-blur-sm transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      {/* Progress ring: track, then the olive arc starting at 12 o'clock */}
      <svg aria-hidden viewBox="0 0 52 52" className="absolute inset-0 size-full -rotate-90">
        <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="#DDDCD0" strokeWidth="2" />
        <circle
          ref={ring}
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="text-olive"
        />
      </svg>
      {/* Lucide arrow-up */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </button>
  )
}
