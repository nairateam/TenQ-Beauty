'use client'

/**
 * Single place where GSAP plugins are registered.
 * Always import gsap / ScrollTrigger / SplitText from here, never from 'gsap' directly,
 * so plugins are registered exactly once.
 */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
