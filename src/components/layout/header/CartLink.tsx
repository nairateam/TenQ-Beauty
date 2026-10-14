'use client'

import { useBag } from '@/lib/cart'

export function CartLink() {
  const { count, openDrawer } = useBag()

  return (
    // Opens the slide-out bag; the full bag page is linked from inside it
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Cart, ${count} item${count > 1 ? 's' : ''}` : 'Cart'}
      className="group relative inline-block text-[13px] tracking-[0.02em] uppercase"
    >
      <span className="inline-flex items-center gap-2">
        {/* Lucide shopping-bag */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[22px] -translate-y-px lg:size-[18px]"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {/* Icon only on mobile; the label joins it from lg up */}
        <span className="hidden lg:inline">Cart</span>
        {count > 0 && <span className="tabular-nums">({count})</span>}
      </span>
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </button>
  )
}
