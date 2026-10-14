'use client'

import { useRef, type ReactNode } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

type FadeInProps = {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
}

/** Fades and lifts a block into view when it scrolls into the viewport. */
export function FadeIn({ children, className, y = 40, delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
