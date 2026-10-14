'use client'

import { useLenis } from 'lenis/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'

import { bag as actions, MAX_QUANTITY, useBag, type BagItem } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import type { CheckoutSettings } from '@/lib/queries/shop'
import { cn } from '@/lib/utils'
import type { ShopProduct } from '@/types/product'

/* ---------- Icons (Lucide) ---------- */

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
    >
      {children}
    </svg>
  )
}

const icons = {
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
}

const smallCaps = 'text-[11px] font-semibold tracking-[0.14em] uppercase'

/* ---------- Drawer ---------- */

/** The slide-out bag. Opens when something is added, or from the header's bag link. */
export function CartDrawer({
  products,
  settings,
}: {
  products: ShopProduct[]
  settings: CheckoutSettings
}) {
  const bag = useBag()
  const { drawerOpen: open, items, count, subtotal, discount, total, promo, justAdded } = bag
  const pathname = usePathname()
  const lenis = useLenis()
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  // Close when the page changes (e.g. after "Checkout" or "View full bag")
  useEffect(() => actions.closeDrawer(), [pathname])

  // Hold the page still, move focus in, and close on Escape while open
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') actions.closeDrawer()
      // Keep Tab inside the drawer
      if (e.key === 'Tab' && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
      document.documentElement.style.overflow = ''
      previous?.focus()
    }
  }, [open, lenis])

  const latest = items.find((i) => i.key === justAdded[justAdded.length - 1])
  const inBag = new Set(items.map((i) => i.productID))

  return (
    <div
      className={cn('fixed inset-0 z-[60]', !open && 'pointer-events-none')}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Backdrop */}
      <div
        onClick={() => bag.closeDrawer()}
        className={cn(
          'absolute inset-0 bg-[#24260F]/40 transition-opacity duration-500',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Panel */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-white text-[#24260F] shadow-[-24px_0_60px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 md:px-6">
          <h2
            id="drawer-title"
            className="flex items-center gap-3 text-lg tracking-[0.06em] uppercase"
          >
            Your bag
            {count > 0 && (
              <span className="bg-olive flex size-6 items-center justify-center rounded-full text-[11px] font-semibold text-white tabular-nums">
                <span className="sr-only">, </span>
                {count}
                <span className="sr-only"> item{count === 1 ? '' : 's'}</span>
              </span>
            )}
          </h2>
          <button
            ref={closeButton}
            type="button"
            onClick={() => bag.closeDrawer()}
            aria-label="Close bag"
            className="flex size-10 items-center justify-center rounded-full border border-[#DDDCD0] transition-colors hover:border-[#24260F]"
          >
            <Icon>{icons.x}</Icon>
          </button>
        </div>

        {/* Just added */}
        <p
          role="status"
          className={cn(
            'flex items-center gap-2.5 bg-[#F0F1DE] px-5 text-[13px] transition-all md:px-6',
            latest ? 'py-3' : 'h-0 overflow-hidden py-0',
          )}
        >
          {latest && (
            <>
              <Icon className="text-olive">{icons.check}</Icon>
              <span className="min-w-0 truncate">
                Added to your bag: {latest.title}
                {latest.size && `, ${latest.size}`}
              </span>
            </>
          )}
        </p>

        {items.length === 0 ? (
          <EmptyBag onShop={() => bag.closeDrawer()} />
        ) : (
          <>
            {/* Lines, note and suggestions scroll; the footer stays put */}
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ul className="px-5 md:px-6">
                {items.map((item) => (
                  <Line key={item.key} item={item} fresh={justAdded.includes(item.key)} />
                ))}
              </ul>

              {settings.drawerNote && (
                <p className="border-olive mx-5 mt-2 flex items-center gap-2.5 border bg-[#FAFAF3] px-4 py-3 text-[13px] md:mx-6">
                  <Icon className="text-olive">{icons.tag}</Icon>
                  {settings.drawerNote}
                </p>
              )}

              <PairsWell products={products} inBag={inBag} />
            </div>

            {/* Footer */}
            <div className="border-t border-[#DDDCD0] px-5 pt-5 pb-4 md:px-6">
              <dl className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className={smallCaps}>Subtotal</dt>
                  <dd className="text-2xl tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                {promo && discount > 0 && (
                  <div className="flex justify-between gap-4 text-[13px]">
                    <dt className="text-[#6B6C5A]">Discount ({promo.code})</dt>
                    <dd className="text-olive tabular-nums">−{formatPrice(discount)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-1.5 flex items-center justify-between gap-4 text-[13px]">
                <span className="text-[#6B6C5A]">Delivery & codes calculated at checkout</span>
                <Link href="/cart" className="shrink-0 underline-offset-4 hover:underline">
                  View full bag
                </Link>
              </div>

              <Link
                href="/checkout"
                className="hover:bg-olive mt-4 flex items-center justify-between bg-[#24260F] px-5 py-[18px] text-white transition-colors"
              >
                <span className={cn(smallCaps, 'flex items-center gap-2.5 text-[12px]')}>
                  <Icon>{icons.lock}</Icon>
                  Checkout
                </span>
                <span className="text-sm tabular-nums">{formatPrice(total)}</span>
              </Link>

              {settings.bagPaymentNote && (
                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#6B6C5A]">
                  <Icon className="text-olive size-3.5">{icons.shield}</Icon>
                  {settings.bagPaymentNote}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- Pieces ---------- */

function Line({ item, fresh }: { item: BagItem; fresh: boolean }) {
  const bag = useBag()
  const href = `/shop/${item.slug}`
  const button =
    'flex size-9 items-center justify-center transition-colors hover:bg-[#F6F5EF] disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <li className="flex gap-4 border-b border-[#DDDCD0] py-4 last:border-b-0">
      <Link href={href} className="relative size-[72px] shrink-0 overflow-hidden bg-[#ECEBE4]">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="72px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-[15px] leading-snug font-medium">
            <Link href={href} className="hover:text-olive">
              {item.title}
            </Link>
          </h3>
          <button
            type="button"
            onClick={() => void bag.remove(item.key)}
            aria-label={`Remove ${item.title}`}
            className="-mt-0.5 shrink-0 p-1 text-[#6B6C5A] hover:text-[#24260F]"
          >
            <Icon>{icons.trash}</Icon>
          </button>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#6B6C5A]">
          {item.size ? `Size: ${item.size}` : item.collectionLine}
          {fresh && (
            <span className="bg-olive px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-white uppercase">
              Just added
            </span>
          )}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div
            role="group"
            aria-label={`Quantity of ${item.title}`}
            className="flex items-center border border-[#DDDCD0]"
          >
            <button
              type="button"
              onClick={() => void bag.setQuantity(item.key, item.quantity - 1)}
              aria-label="Decrease quantity"
              className={button}
            >
              −
            </button>
            <span aria-live="polite" className="w-7 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => void bag.setQuantity(item.key, item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
              className={button}
            >
              +
            </button>
          </div>
          <p className="text-[15px] font-medium tabular-nums">{formatPrice(item.lineTotal)}</p>
        </div>
      </div>
    </li>
  )
}

/** In-stock products not in the bag, those sharing its collections first. */
function PairsWell({ products, inBag }: { products: ShopProduct[]; inBag: Set<string> }) {
  const bag = useBag()
  const track = useRef<HTMLUListElement>(null)

  const bagCollections = new Set(
    products.filter((p) => inBag.has(p.id)).flatMap((p) => p.collections),
  )
  const picks = products
    .filter((p) => !inBag.has(p.id) && p.inStock)
    .map((p) => ({ p, related: p.collections.some((c) => bagCollections.has(c)) }))
    .sort((a, b) => Number(b.related) - Number(a.related) || a.p.popularity - b.p.popularity)
    .slice(0, 8)
    .map(({ p }) => p)

  if (!picks.length) return null

  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth * 0.8,
      behavior: 'smooth',
    })

  return (
    <section aria-labelledby="drawer-pairs" className="mt-6 pb-6">
      <div className="flex items-center justify-between px-5 md:px-6">
        <h3 id="drawer-pairs" className={cn(smallCaps, 'font-sans')}>
          Pairs well with
        </h3>
        <div className="flex gap-1.5">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d)}
              aria-label={d < 0 ? 'Previous suggestions' : 'Next suggestions'}
              className="flex size-8 items-center justify-center rounded-full border border-[#DDDCD0] transition-colors hover:border-[#24260F]"
            >
              <Icon className="size-3.5">{d < 0 ? icons.chevronLeft : icons.chevronRight}</Icon>
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        className="mt-3 flex snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] gap-2.5 overflow-x-auto px-5 md:scroll-px-6 md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {picks.map((p) => (
          <li
            key={p.id}
            className="flex w-[calc(50%-5px)] shrink-0 snap-start items-center gap-3 border border-[#DDDCD0] p-2"
          >
            <Link
              href={`/shop/${p.slug}`}
              className="relative size-14 shrink-0 overflow-hidden bg-[#ECEBE4]"
            >
              <Image
                src={p.image.src}
                alt={p.image.alt}
                fill
                sizes="56px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${p.slug}`}
                className="hover:text-olive line-clamp-2 text-[13px] leading-snug font-medium"
              >
                {p.title}
              </Link>
              <p className="mt-0.5 text-xs text-[#6B6C5A] tabular-nums">
                {p.fromPrice && 'From '}
                {formatPrice(p.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void bag.add(p.id, p.variantID)}
              aria-label={`Add ${p.title} to bag`}
              className="hover:bg-olive flex size-8 shrink-0 items-center justify-center rounded-full bg-[#24260F] text-white transition-colors"
            >
              <Icon className="size-4">{icons.plus}</Icon>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyBag({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-olive flex size-14 items-center justify-center rounded-full bg-[#F6F5EF]">
        <Icon className="size-6">{icons.bag}</Icon>
      </span>
      <p className="text-lg uppercase">Your bag is empty</p>
      <p className="max-w-xs text-sm text-[#6B6C5A]">
        Find the scalp-first routine that suits your hair.
      </p>
      <Link
        href="/shop"
        onClick={onShop}
        className={cn(
          smallCaps,
          'hover:bg-olive mt-2 bg-[#24260F] px-8 py-4 text-white transition-colors',
        )}
      >
        Shop haircare
      </Link>
    </div>
  )
}
