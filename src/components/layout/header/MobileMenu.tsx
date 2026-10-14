'use client'

import { useLenis } from 'lenis/react'
import { useEffect } from 'react'

import { accountNav, mainNav } from '@/config/site'
import { cn } from '@/lib/utils'

import { NavLink } from './NavLink'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const lenis = useLenis()

  // Lock page scroll while the menu is open.
  useEffect(() => {
    if (open) lenis?.stop()
    else lenis?.start()
  }, [open, lenis])

  return (
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 absolute inset-x-0 top-full h-[calc(100dvh-var(--header-height))] backdrop-blur-md transition-[opacity,visibility] duration-300 lg:hidden',
        open ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <nav aria-label="Mobile" className="flex flex-col gap-8 px-6 py-10">
        {[...mainNav, ...accountNav].map(({ href, label }) => (
          <NavLink key={href} href={href} onClick={onClose} className="text-2xl">
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
