'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'

import { MAX_QUANTITY, useBag } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { gsap, useGSAP } from '@/lib/gsap'
import { reviewSummary } from '@/lib/reviews'
import { cn } from '@/lib/utils'
import type { ProductDetail } from '@/types/product'

import { Stars } from './Stars'

/* ---------- Icons (Lucide, drawn inline at 24px) ---------- */

const icons = {
  sprout: (
    <>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </>
  ),
  droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />,
  sparkles: (
    <>
      <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" />
      <path d="M20 3v4M22 5h-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </>
  ),
  badge: (
    <>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
}

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

const smallCaps = 'font-semibold tracking-[0.14em] uppercase'

/* ---------- Section ---------- */

/** Product page top: gallery beside name, sizes, add to bag and details. */
export function ProductView({ detail }: { detail: ProductDetail }) {
  const root = useRef<HTMLElement>(null)
  const { product, sizes } = detail
  const { collection } = detail

  // Start on the default size, or the first one in stock if that has sold out
  const [sizeLabel, setSizeLabel] = useState(
    sizes.find((s) => s.label === detail.defaultSize && s.inStock)?.label ??
      sizes.find((s) => s.inStock)?.label ??
      sizes[0]?.label,
  )
  const size = sizes.find((s) => s.label === sizeLabel)
  const price = size?.price ?? product.price
  const reviews = reviewSummary(detail.reviews)

  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        .from('[data-gallery]', { opacity: 0, y: 24, duration: 1 })
        .from('[data-fade]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.06 }, '<0.15')
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="product-title"
      className="bg-white pt-[calc(var(--header-height)+1.5rem)] pb-20 md:pt-[calc(var(--header-height)+2rem)] lg:pb-28"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" data-fade>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B6C5A]">
            <li>
              <Link href="/" className="hover:text-[#24260F]">
                Home
              </Link>
            </li>
            <Sep />
            <li>
              <Link href="/shop" className="hover:text-[#24260F]">
                Shop
              </Link>
            </li>
            {collection && (
              <>
                <Sep />
                <li>
                  <Link
                    href={`/shop?collection=${collection.slug}`}
                    className="hover:text-[#24260F]"
                  >
                    {collection.name} Collection
                  </Link>
                </li>
              </>
            )}
            <Sep />
            <li aria-current="page" className="truncate text-[#24260F]">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <Gallery images={detail.gallery} label={detail.label} />

          {/* Details */}
          <div className="flex flex-col">
            {collection && (
              <p data-fade className={cn(smallCaps, 'text-olive text-[11px]')}>
                {collection.eyebrow}
              </p>
            )}
            <h1
              id="product-title"
              data-fade
              className="mt-3 text-[28px] leading-[1.1] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl"
            >
              {product.title}
            </h1>

            {reviews.count > 0 && (
              <p data-fade className="mt-3 flex items-center gap-2 text-xs text-[#6B6C5A]">
                <Stars rating={reviews.average} />
                <span className="text-[#24260F]">{reviews.average.toFixed(1)}</span>·
                <a href="#reviews" className="underline-offset-4 hover:text-[#24260F] hover:underline">
                  {reviews.count} review{reviews.count > 1 && 's'}
                </a>
              </p>
            )}

            <p data-fade className="mt-5 max-w-[34rem] text-[15px] leading-[1.6] text-[#6B6C5A]">
              {detail.tagline}
            </p>

            <p data-fade className="mt-6 flex items-baseline gap-2">
              <span className="text-[28px] leading-none text-[#24260F] tabular-nums">
                {formatPrice(price)}
              </span>
              {size && <span className="text-sm text-[#6B6C5A]">{size.label}</span>}
            </p>

            {sizes.length > 0 && (
              <SizePicker
                detail={detail}
                selected={sizeLabel}
                onSelect={setSizeLabel}
              />
            )}

            <Purchase
              detail={detail}
              variantID={size?.variantID}
              price={price}
              inStock={size ? size.inStock : product.inStock}
            />

            {detail.benefits.length > 0 && (
              <ul data-fade className="mt-6 flex flex-col gap-2.5 text-[13px] text-[#24260F]">
                {detail.benefits.map((b) => (
                  <li key={b.text} className="flex items-center gap-3">
                    <Icon className="text-olive">{icons[b.icon]}</Icon>
                    {b.text}
                  </li>
                ))}
              </ul>
            )}

            <div data-fade className="mt-6">
              <p className={cn(smallCaps, 'text-[10px] text-[#6B6C5A]')}>Free from</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {detail.freeFrom.map((f) => (
                  <li
                    key={f}
                    className="rounded-full border border-[#DDDCD0] px-3 py-1.5 text-xs text-[#24260F]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Details detail={detail} />

            {detail.assurances.length > 0 && (
              <ul
                data-fade
                className="mt-8 grid auto-cols-fr grid-flow-col gap-2 bg-[#F6F5EF] px-3 py-5 text-center text-[11px] leading-tight text-[#24260F] md:text-xs"
              >
                {detail.assurances.map((a) => (
                  <li key={a.text} className="flex flex-col items-center gap-2">
                    <Icon className="text-olive">{icons[a.icon]}</Icon>
                    {a.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Pieces ---------- */

function Sep() {
  return (
    <li aria-hidden className="text-[#C9C8BB]">
      /
    </li>
  )
}


function Gallery({ images, label }: { images: ProductDetail['gallery']; label?: string }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const image = images[active]

  return (
    <div
      data-gallery
      className="flex flex-col-reverse gap-3 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:flex-row lg:self-start"
    >
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:flex lg:w-[72px] lg:shrink-0 lg:flex-col">
          {images.map((img, i) => (
            <li key={img.src} className="sm:w-[72px] sm:shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden border bg-[#ECEBE4] transition-colors',
                  i === active ? 'border-[#24260F]' : 'border-transparent hover:border-[#C9C8BB]',
                )}
              >
                <Image src={img.src} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-[#ECEBE4]">
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {label && (
          <span className="absolute top-4 left-4 bg-white px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-[#24260F] uppercase">
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Enlarge image"
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white text-[#24260F] transition-transform hover:scale-105"
        >
          <Icon>{icons.expand}</Icon>
        </button>
      </div>

      {zoomed && <Lightbox image={image} onClose={() => setZoomed(false)} />}
    </div>
  )
}

function Lightbox({
  image,
  onClose,
}: {
  image: ProductDetail['gallery'][number]
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#24260F]/90 p-4 md:p-10"
    >
      <div className="relative size-full max-w-[min(90vh,64rem)]">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" />
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white text-[#24260F]"
      >
        <Icon>{icons.close}</Icon>
      </button>
    </div>
  )
}

function SizePicker({
  detail,
  selected,
  onSelect,
}: {
  detail: ProductDetail
  selected?: string
  onSelect: (label: string) => void
}) {
  return (
    <fieldset data-fade className="mt-6">
      <div className="flex items-baseline justify-between gap-4">
        <legend className={cn(smallCaps, 'text-[11px] text-[#24260F]')}>
          Size: <span className="font-medium">{selected}</span>
        </legend>
        {detail.bestValue && (
          <span className="text-olive text-xs">Best value per ml: {detail.bestValue}</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {detail.sizes.map((s) => {
          const isOn = s.label === selected
          return (
            <label
              key={s.label}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 border px-2 py-3 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#24260F]',
                isOn
                  ? 'border-[#24260F] bg-[#F6F5EF]'
                  : 'border-[#DDDCD0] hover:border-[#24260F]',
              )}
            >
              <input
                type="radio"
                name="size"
                value={s.label}
                checked={isOn}
                onChange={() => onSelect(s.label)}
                className="sr-only"
              />
              <span
                className={cn(
                  smallCaps,
                  'text-xs text-[#24260F]',
                  !s.inStock && 'text-[#9A9B8A] line-through',
                )}
              >
                {s.label}
              </span>
              <span className="text-[11px] text-[#6B6C5A] tabular-nums">
                {s.inStock ? formatPrice(s.price) : 'Sold out'}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function Purchase({
  detail,
  variantID,
  price,
  inStock,
}: {
  detail: ProductDetail
  variantID?: string
  price: number
  inStock: boolean
}) {
  const { product, addOn } = detail
  const addOnProduct = addOn?.product
  const bag = useBag()
  const [quantity, setQuantity] = useState(1)
  const [withAddOn, setWithAddOn] = useState(false)
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  const addToBag = () => {
    setAdded(true)
    // Queued in order, so the add-on lands in the cart the first add creates
    void bag.add(product.id, variantID, quantity)
    if (withAddOn && addOnProduct) void bag.add(addOnProduct.id, addOnProduct.variantID)
  }

  return (
    <div data-fade className="mt-6 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex h-14 shrink-0 items-center border border-[#DDDCD0]">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="h-full w-10 text-[#24260F] disabled:opacity-30"
          >
            −
          </button>
          <span aria-live="polite" className="w-6 text-center text-sm tabular-nums">
            <span className="sr-only">Quantity </span>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Increase quantity"
            className="h-full w-10 text-[#24260F] disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={addToBag}
          disabled={!inStock}
          className="hover:bg-olive disabled:hover:bg-[#24260F] flex h-14 disabled:cursor-not-allowed disabled:opacity-60 min-w-0 flex-1 items-center justify-between gap-3 bg-[#24260F] px-5 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition-colors"
        >
          <span aria-live="polite">
            {!inStock ? 'Sold out' : added ? 'Added to bag ✓' : 'Add to bag'}
          </span>
          <span className="tabular-nums">{formatPrice(price * quantity)}</span>
        </button>

        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'flex size-14 shrink-0 items-center justify-center border transition-colors',
            saved
              ? 'border-[#24260F] text-[#24260F]'
              : 'border-[#DDDCD0] text-[#24260F] hover:border-[#24260F]',
          )}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[18px]"
          >
            {icons.heart}
          </svg>
        </button>
      </div>

      {addOn && addOnProduct?.inStock && (
        <label className="flex cursor-pointer items-center gap-3 border border-[#DDDCD0] bg-[#F6F5EF] p-3 has-[:checked]:border-[#24260F]">
          <input
            type="checkbox"
            checked={withAddOn}
            onChange={(e) => setWithAddOn(e.target.checked)}
            className="accent-olive size-4 shrink-0"
          />
          <span className="relative size-11 shrink-0 overflow-hidden bg-white">
            <Image
              src={addOnProduct.image.src}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[13px] font-medium text-[#24260F]">{addOn.title}</span>
            <span className="text-xs text-[#6B6C5A]">{addOn.note}</span>
          </span>
          <span className="text-[13px] text-[#24260F] tabular-nums">
            + {formatPrice(addOnProduct.price)}
          </span>
        </label>
      )}
    </div>
  )
}

function Details({ detail }: { detail: ProductDetail }) {
  const id = useId()
  const [open, setOpen] = useState<number | null>(0)

  const panels: { title: string; body: ReactNode }[] = [
    { title: 'Description', body: <p>{detail.description}</p> },
    {
      title: 'How to use',
      body: (
        <ol className="list-decimal space-y-1.5 pl-5">
          {detail.howToUse.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ),
    },
    { title: 'Full ingredients', body: <p>{detail.ingredients}</p> },
    {
      title: 'Delivery & returns',
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          {detail.deliveryAndReturns.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div data-fade className="mt-8 border-b border-[#DDDCD0]">
      {panels.map((p, i) => {
        const isOpen = open === i
        return (
          <div key={p.title} className="border-t border-[#DDDCD0]">
            <h2>
              <button
                type="button"
                id={`${id}-h${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  smallCaps,
                  'flex w-full items-center justify-between gap-4 py-[18px] text-left font-sans text-[11px] text-[#24260F]',
                )}
              >
                {p.title}
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="size-3.5"
                >
                  <path d="M5 12h14" />
                  {/* Vertical stroke folds away to turn the plus into a minus */}
                  <path
                    d="M12 5v14"
                    className={cn(
                      'origin-center transition-transform duration-300 [transform-box:fill-box]',
                      isOpen && 'scale-y-0',
                    )}
                  />
                </svg>
              </button>
            </h2>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-h${i}`}
              className={cn(
                'grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-5 text-sm leading-[1.65] text-[#6B6C5A]">{p.body}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
