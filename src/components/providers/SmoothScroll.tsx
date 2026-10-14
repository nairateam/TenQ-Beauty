'use client'

import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef, type ReactNode } from 'react'

import { gsap, ScrollTrigger } from '@/lib/gsap'

/** Keeps ScrollTrigger in sync with Lenis' virtual scroll position. */
function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update())
  return null
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so Lenis and
 * GSAP animations run on the same frame loop.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1 }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  )
}
