'use client'

import type { ReactNode } from 'react'

import { SmoothScroll } from './SmoothScroll'

/**
 * All client-side providers, composed once and used in the frontend layout.
 * The bag doesn't need one — see src/lib/cart.ts.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>
}
