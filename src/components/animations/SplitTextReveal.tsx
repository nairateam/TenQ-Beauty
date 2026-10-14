'use client'

import { useRef, type ElementType, type ReactNode } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type SplitTextRevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Split by lines, words or chars. */
  type?: 'lines' | 'words' | 'chars'
  /** Play when scrolled into view (true) or on mount (false). */
  scroll?: boolean
  delay?: number
  stagger?: number
}

/**
 * Reveals text line-by-line / word-by-word / char-by-char with GSAP SplitText.
 * Usage: <SplitTextReveal as="h1" type="lines">Headline</SplitTextReveal>
 */
export function SplitTextReveal({
  children,
  as: Tag = 'div',
  className,
  type = 'lines',
  scroll = true,
  delay = 0,
  stagger = 0.08,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ref.current) return

      const split = SplitText.create(ref.current, {
        type,
        mask: type, // clip each piece so it slides up from behind a mask
        autoSplit: type === 'lines', // re-split lines on resize / font load
        onSplit: (self) =>
          gsap.from(self[type], {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay,
            stagger,
            scrollTrigger: scroll ? { trigger: ref.current, start: 'top 85%', once: true } : undefined,
          }),
      })

      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
