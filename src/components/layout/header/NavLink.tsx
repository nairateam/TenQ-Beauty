'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type NavLinkProps = {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
}

export function NavLink({
  href,
  children,
  className,
  onClick,
  'aria-label': ariaLabel,
}: NavLinkProps) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative inline-block text-[13px] tracking-[0.02em] uppercase',
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          'absolute -bottom-1 left-0 h-px w-full origin-left bg-current transition-transform duration-300 ease-out',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
    </Link>
  )
}
