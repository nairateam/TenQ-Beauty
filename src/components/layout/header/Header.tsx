'use client'

import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { accountNav, mainNav } from '@/config/site'
import { cn } from '@/lib/utils'

import { CartLink } from './CartLink'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './NavLink'

export function Header() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useLenis(({ scroll, direction }) => {
    setHidden(direction === 1 && scroll > 120)
  })

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname])

  // Checkout has its own pared-back header
  if (pathname.startsWith('/checkout')) return null

  return (
    <header
      className={cn(
        'bg-background/70 text-foreground fixed inset-x-0 top-0 z-50 h-(--header-height) backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hidden && !menuOpen && '-translate-y-full',
      )}
    >
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10 lg:px-15">
        {/* Left */}
        <div className="flex items-center">
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {mainNav.map(({ href, label }) => (
                <li key={href}>
                  <NavLink href={href}>{label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="group -ml-2 flex size-11 items-center justify-center lg:hidden"
          >
            {/* Three hairlines in falling lengths that even out on hover, one after another.
                Opening: the middle line draws away while the outer two slide together, then turn into an X.
                Closing runs the same steps in reverse. */}
            <span aria-hidden className="relative block h-[13px] w-7">
              <span
                className={cn(
                  'absolute top-0 left-0 h-px w-full bg-current transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
                  menuOpen
                    ? 'translate-y-[6px] rotate-45 [transition-delay:0ms,200ms]'
                    : '[transition-delay:200ms,0ms]',
                )}
              />
              <span
                className={cn(
                  'absolute top-[6px] left-0 h-px w-[70%] origin-left bg-current transition-[width,scale,opacity] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:w-full',
                  menuOpen
                    ? 'scale-x-0 opacity-0 duration-300'
                    : '[transition-delay:60ms,250ms,250ms] duration-500',
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-px bg-current transition-[translate,rotate,width] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
                  menuOpen
                    ? 'w-full -translate-y-[6px] -rotate-45 [transition-delay:0ms,200ms,0ms]'
                    : 'w-[40%] [transition-delay:200ms,0ms,120ms] group-hover:w-full',
                )}
              />
            </span>
          </button>
        </div>

        {/* Centre */}
        <Logo />

        {/* Right */}
        <div className="flex items-center justify-end gap-10">
          {accountNav.map(({ href, label }) => (
            <NavLink key={href} href={href} className="hidden lg:inline-block">
              {label}
            </NavLink>
          ))}
          <CartLink />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
