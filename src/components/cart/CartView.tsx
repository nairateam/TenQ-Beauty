'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { MAX_QUANTITY, useBag, type Bag, type BagItem } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import type { CheckoutSettings } from '@/lib/queries/shop'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

const steps = ['Bag', 'Details', 'Delivery', 'Payment']

const checkoutHref = '/checkout'

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
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
}

const smallCaps = 'text-[11px] font-semibold tracking-[0.14em] uppercase'

/* ---------- Page ---------- */

/** The bag: checkout steps, line items and the order summary. */
export function CartView({ settings }: { settings: CheckoutSettings }) {
  const root = useRef<HTMLElement>(null)
  const bag = useBag()
  // The bag is fetched after the page loads; hold the content back until it arrives — no empty-bag flash
  const { ready, items, saved, count, subtotal, promo, discount, total, giftNote } = bag

  useGSAP(
    () => {
      if (!ready) return
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        .from(split.lines, { yPercent: 110, duration: 1 })
        .from('[data-fade]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, '-=0.6')
      return () => split.revert()
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="bag-title"
      className="bg-white pt-[calc(var(--header-height)+2rem)] pb-20 md:pt-[calc(var(--header-height)+3rem)] lg:pb-28"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        {/* Breadcrumb */}
        <nav data-fade aria-label="Breadcrumb" className="text-xs text-[#6B6C5A]">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#24260F]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-[#24260F]">
              Bag
            </li>
          </ol>
        </nav>

        {/* Title + steps */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-baseline gap-4">
            <h1
              id="bag-title"
              data-title
              className="text-4xl leading-none font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-5xl lg:text-[56px]"
            >
              Your bag
            </h1>
            {ready && (
              <span data-fade className="text-sm text-[#6B6C5A]">
                {count} item{count === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <ol data-fade aria-label="Checkout steps" className="flex items-center gap-2 sm:gap-3">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="w-4 border-t border-dashed border-[#C9C8BA] sm:w-10"
                  />
                )}
                <span
                  aria-current={i === 0 ? 'step' : undefined}
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[11px] tabular-nums',
                    i === 0 ? 'bg-[#24260F] text-white' : 'border border-[#DDDCD0] text-[#6B6C5A]',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-[0.14em] uppercase',
                    i === 0 ? 'text-[#24260F]' : 'hidden text-[#6B6C5A] sm:inline',
                  )}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {!ready ? (
          <div className="min-h-[50vh]" />
        ) : items.length ? (
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 md:mt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-16">
            {/* Line items */}
            <div data-fade>
              <div
                className={cn(
                  smallCaps,
                  'hidden grid-cols-[minmax(0,1fr)_140px_110px] border-b border-[#DDDCD0] pb-4 text-[10px] text-[#6B6C5A] md:grid',
                )}
              >
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <ul>
                {items.map((item) => (
                  <LineItem key={item.key} item={item} bag={bag} />
                ))}
              </ul>

              <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-start sm:justify-between">
                <Link
                  href="/shop"
                  className={cn(
                    smallCaps,
                    'group inline-flex items-center gap-2 text-[10px] text-[#24260F]',
                  )}
                >
                  <span
                    aria-hidden
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  Continue shopping
                </Link>
                <GiftNote value={giftNote} bag={bag} />
              </div>

              {saved.length > 0 && <SavedForLater bag={bag} />}
            </div>

            {/* Summary */}
            <aside
              data-fade
              aria-labelledby="summary-title"
              className="flex flex-col gap-6 self-start bg-[#F6F5EF] p-6 md:p-8 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
            >
              <h2 id="summary-title" className="text-sm tracking-[0.12em] text-[#24260F] uppercase">
                Order summary
              </h2>

              <PromoCode bag={bag} />

              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6B6C5A]">Subtotal</dt>
                  <dd className="text-[#24260F] tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                {promo && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6B6C5A]">Discount ({promo.code})</dt>
                    <dd className="text-olive tabular-nums">−{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6B6C5A]">Delivery</dt>
                  <dd className="text-[#6B6C5A]">Calculated at next step</dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between gap-4 border-t border-[#DDDCD0] pt-6">
                <span className={cn(smallCaps, 'text-[#24260F]')}>Estimated total</span>
                <span className="text-[28px] leading-none text-[#24260F] tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={checkoutHref}
                  className="group hover:bg-olive flex items-center justify-between bg-[#24260F] px-6 py-[18px] text-[13px] font-semibold tracking-[0.11em] text-white uppercase transition-colors"
                >
                  Secure checkout
                  <Icon className="size-[18px]">{icons.lock}</Icon>
                </Link>
                <p className="flex items-center gap-2 text-xs text-[#6B6C5A]">
                  <Icon className="text-olive size-3.5">{icons.check}</Icon>
                  {settings.bagPaymentNote}
                </p>
              </div>

              <ul className="flex flex-col gap-3 border-t border-[#DDDCD0] pt-6 text-[13px] text-[#24260F]">
                {settings.trustPoints.map((point) => (
                  <li key={point.text} className="flex items-center gap-3">
                    <Icon className="text-olive">{icons[point.icon]}</Icon>
                    {point.text}
                  </li>
                ))}
                {settings.whatsappHref && (
                  <li className="flex items-center gap-3">
                    <Icon className="text-olive">{icons.chat}</Icon>
                    <span>
                      Questions?{' '}
                      <a
                        href={settings.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4"
                      >
                        Chat with us on WhatsApp
                      </a>
                    </span>
                  </li>
                )}
              </ul>
            </aside>
          </div>
        ) : (
          <EmptyBag bag={bag} />
        )}
      </div>
    </section>
  )
}

/* ---------- Pieces ---------- */

function LineItem({ item, bag }: { item: BagItem; bag: Bag }) {
  const { title, image, collectionLine, badge, quantity, unitPrice, lineTotal, slug, size, key } =
    item
  const href = `/shop/${slug}`
  const rating = badge?.endsWith('★') ? badge : null

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-[#DDDCD0] py-6 md:grid-cols-[minmax(0,1fr)_140px_110px] md:items-center md:gap-x-0">
      <div className="col-span-2 flex gap-4 md:col-span-1 md:gap-6">
        <Link
          href={href}
          className="relative size-24 shrink-0 overflow-hidden bg-[#ECEBE4] md:size-[120px]"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="120px"
            className="object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-col gap-1.5 md:pr-6">
          <h3 className="font-sans text-[13px] font-semibold tracking-[0.06em] text-[#24260F] uppercase md:text-sm">
            <Link href={href} className="hover:text-olive">
              {title}
            </Link>
          </h3>
          <p className="text-[13px] text-[#6B6C5A]">
            {[collectionLine, size].filter(Boolean).join(' · ')}
          </p>
          <p className="text-[13px] text-[#24260F] tabular-nums">
            {formatPrice(unitPrice)}
            {rating && <span className="text-[#6B6C5A]"> · {rating}</span>}
          </p>
          <div className="mt-1 flex gap-4 text-xs text-[#6B6C5A]">
            <button
              type="button"
              onClick={() => void bag.remove(key)}
              className="hover:text-[#24260F]"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => void bag.saveForLater(key)}
              className="hover:text-[#24260F]"
            >
              Save for later
            </button>
          </div>
        </div>
      </div>

      <div className="col-start-1 flex md:col-start-auto md:justify-center">
        <Stepper
          title={title}
          quantity={quantity}
          busy={bag.isLoading}
          onChange={(q) => void bag.setQuantity(key, q)}
        />
      </div>
      <p className="self-center text-right text-sm text-[#24260F] tabular-nums md:text-[15px]">
        {formatPrice(lineTotal)}
      </p>
    </li>
  )
}

function Stepper({
  title,
  quantity,
  busy,
  onChange,
}: {
  title: string
  quantity: number
  /** A cart update is in flight — wait for it so presses don't race */
  busy: boolean
  onChange: (q: number) => void
}) {
  const button =
    'flex size-10 items-center justify-center text-[#24260F] transition-colors hover:bg-[#F6F5EF] disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div
      className="flex items-center border border-[#DDDCD0]"
      role="group"
      aria-label={`Quantity of ${title}`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={busy}
        aria-label="Decrease quantity"
        className={button}
      >
        −
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={busy || quantity >= MAX_QUANTITY}
        aria-label="Increase quantity"
        className={button}
      >
        +
      </button>
    </div>
  )
}

function PromoCode({ bag }: { bag: Bag }) {
  const { promo, discount } = bag
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  if (promo) {
    return (
      <div className="border-olive flex items-center gap-3 border bg-white px-4 py-3 text-[13px]">
        <Icon className="text-olive">{icons.tag}</Icon>
        <span className="font-semibold tracking-[0.08em] text-[#24260F] uppercase">
          {promo.code}
        </span>
        <span className="min-w-0 flex-1 truncate text-[#6B6C5A]">
          {discount > 0 || !promo.minimumSubtotal
            ? promo.label
            : `Applies from ${formatPrice(promo.minimumSubtotal)}`}
        </span>
        <button
          type="button"
          onClick={() => void bag.removePromo()}
          aria-label={`Remove code ${promo.code}`}
          className="text-[#6B6C5A] hover:text-[#24260F]"
        >
          <Icon className="size-3.5">{icons.x}</Icon>
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const ok = await bag.applyPromo(code)
        setBusy(false)
        setError(!ok)
        if (ok) setCode('')
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex">
        <label className="sr-only" htmlFor="promo-code">
          Promo code
        </label>
        <input
          id="promo-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          placeholder="Promo code"
          autoComplete="off"
          aria-invalid={error}
          aria-describedby={error ? 'promo-error' : undefined}
          className="h-12 min-w-0 flex-1 border border-r-0 border-[#DDDCD0] bg-white px-4 text-sm text-[#24260F] uppercase outline-none placeholder:text-[#9A9B8A] placeholder:normal-case focus:border-[#24260F]"
        />
        <button
          type="submit"
          disabled={!code.trim() || busy}
          className={cn(
            smallCaps,
            'border border-[#24260F] px-5 text-[10px] text-[#24260F] transition-colors hover:bg-[#24260F] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#24260F]',
          )}
        >
          Apply
        </button>
      </div>
      {error && (
        <p id="promo-error" role="alert" className="text-xs text-[#9B3B2A]">
          That code isn’t valid.
        </p>
      )}
    </form>
  )
}

function GiftNote({ value, bag }: { value: string; bag: Bag }) {
  const [open, setOpen] = useState(Boolean(value))
  const [draft, setDraft] = useState(value)

  // Saved to the cart once typing pauses; runs only when the draft changes
  useEffect(() => {
    if (draft === value) return
    const t = setTimeout(() => void bag.setGiftNote(draft), 800)
    return () => clearTimeout(t)
  }, [draft])

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="gift-note"
        className="hover:text-olive inline-flex items-center gap-2 text-[13px] text-[#24260F]"
      >
        <Icon className="text-olive">{icons.gift}</Icon>
        {value ? 'Edit gift note' : 'Add a gift note'}
      </button>
      {open && (
        <label className="w-full sm:w-80">
          <span className="sr-only">Gift note</span>
          <textarea
            id="gift-note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={240}
            rows={3}
            placeholder="We’ll print this on a card in the parcel."
            className="w-full resize-none border border-[#DDDCD0] bg-white p-3 text-sm text-[#24260F] outline-none placeholder:text-[#9A9B8A] focus:border-[#24260F]"
          />
        </label>
      )}
    </div>
  )
}

function SavedForLater({ bag }: { bag: Bag }) {
  const { saved } = bag
  return (
    <div className="mt-14">
      <h2 className={cn(smallCaps, 'text-[#24260F]')}>Saved for later ({saved.length})</h2>
      <ul className="mt-4 border-t border-[#DDDCD0]">
        {saved.map((p) => (
          <li key={p.key} className="flex items-center gap-4 border-b border-[#DDDCD0] py-4">
            <Link
              href={`/shop/${p.slug}`}
              className="relative size-16 shrink-0 overflow-hidden bg-[#ECEBE4]"
            >
              <Image
                src={p.image.src}
                alt={p.image.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-[0.06em] text-[#24260F] uppercase">
                {p.title}
              </p>
              <p className="text-[13px] text-[#6B6C5A] tabular-nums">
                {formatPrice(p.price)}
                {p.size && ` · ${p.size}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => void bag.moveToBag(p.key)}
                className="text-olive hover:opacity-70"
              >
                Move to bag
              </button>
              <button
                type="button"
                onClick={() => void bag.removeSaved(p.key)}
                className="text-[#6B6C5A] hover:text-[#24260F]"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmptyBag({ bag }: { bag: Bag }) {
  return (
    <div data-fade className="mt-10 border-t border-[#DDDCD0] pt-12 md:mt-12">
      <div className="flex flex-col items-start gap-5">
        <span className="text-olive flex size-14 items-center justify-center rounded-full bg-[#F6F5EF]">
          <Icon className="size-6">{icons.bag}</Icon>
        </span>
        <h2 className="text-2xl font-normal text-[#24260F] uppercase">Your bag is empty</h2>
        <p className="max-w-md text-[15px] leading-relaxed text-[#6B6C5A]">
          Find the scalp-first routine that suits your hair — or let our experts build one for you.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="hover:bg-olive bg-[#24260F] px-8 py-4 text-[13px] font-semibold tracking-[0.11em] text-white uppercase transition-colors"
          >
            Shop haircare
          </Link>
          <Link
            href="/contact#topic-consultation"
            className="border border-[#24260F] px-8 py-4 text-[13px] font-semibold tracking-[0.11em] text-[#24260F] uppercase transition-colors hover:bg-[#24260F] hover:text-white"
          >
            Book a consultation
          </Link>
        </div>
      </div>
      {bag.saved.length > 0 && <SavedForLater bag={bag} />}
    </div>
  )
}
