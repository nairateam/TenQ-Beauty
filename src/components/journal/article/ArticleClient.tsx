'use client'

import { useLenis } from 'lenis/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { previewOf, useBag } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import type { TocEntry } from '@/lib/queries/journal'
import { cn } from '@/lib/utils'
import type { ShopProduct } from '@/types/product'

/* Interactive parts of a journal article: progress bar, sharing, contents and adding to the bag. */

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
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </>
  ),
  bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
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

const roundButton =
  'flex size-8 items-center justify-center rounded-full border border-[#DDDCD0] text-[#24260F] transition-colors hover:border-[#24260F]'

/* ---------- Reading progress ---------- */

/** A thin olive bar along the top of the screen that fills as the article is read. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useLenis(() => {
    const body = document.querySelector<HTMLElement>('[data-article-body]')
    if (!body || !bar.current) return
    const { top, height } = body.getBoundingClientRect()
    const progress = Math.min(1, Math.max(0, -top / Math.max(1, height - window.innerHeight)))
    bar.current.style.transform = `scaleX(${progress})`
  })

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]">
      <div ref={bar} className="bg-olive h-full origin-left scale-x-0" />
    </div>
  )
}

/* ---------- Share ---------- */

const SAVED_KEY = 'tenq-saved-articles'

function readSaved(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Copy link, share sheet and save (top); WhatsApp, Facebook and copy link (bottom). */
export function ShareActions({
  title,
  slug,
  variant,
}: {
  title: string
  slug: string
  variant: 'top' | 'bottom'
}) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setSaved(readSaved().includes(slug))
    setCanShare(typeof navigator.share === 'function')
  }, [slug])

  const url = () => window.location.href.split('#')[0]

  async function copy() {
    try {
      await navigator.clipboard.writeText(url())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked: nothing to do
    }
  }

  function toggleSave() {
    const list = readSaved()
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    } catch {}
    setSaved(next.includes(slug))
  }

  const copyButton = (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Link copied' : 'Copy link'}
      className={roundButton}
    >
      <Icon className="size-3.5">{copied ? icons.check : icons.link}</Icon>
    </button>
  )

  if (variant === 'top') {
    return (
      <div className="flex items-center gap-2">
        {copyButton}
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ title, url: url() }).catch(() => {})}
            aria-label="Share"
            className={roundButton}
          >
            <Icon className="size-3.5">{icons.share}</Icon>
          </button>
        )}
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Saved — remove from saved articles' : 'Save article'}
          className={cn(roundButton, saved && 'border-[#24260F]')}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            {icons.bookmark}
          </svg>
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Link copied' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[10px] font-semibold tracking-[0.16em] text-[#6B6C5A] uppercase">
        Share
      </span>
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`,
            '_blank',
            'noopener',
          )
        }
        aria-label="Share on WhatsApp"
        className={roundButton}
      >
        <Icon className="size-3.5">{icons.chat}</Icon>
      </button>
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`,
            '_blank',
            'noopener',
          )
        }
        aria-label="Share on Facebook"
        className={roundButton}
      >
        <Icon className="size-3.5">{icons.facebook}</Icon>
      </button>
      {copyButton}
    </div>
  )
}

/* ---------- Contents ---------- */

/** "In this article" — highlights the section being read and scrolls smoothly to a section. */
export function Contents({ entries }: { entries: TocEntry[] }) {
  const lenis = useLenis()
  const [active, setActive] = useState(entries[0]?.anchor)

  useEffect(() => {
    const targets = entries
      .map((e) => document.getElementById(e.anchor))
      .filter((el): el is HTMLElement => Boolean(el))
    // The active section is the last one whose top has passed a line a third down the screen
    const update = () => {
      const line = window.innerHeight / 3
      let current = targets[0]?.id
      for (const el of targets) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [entries])

  if (!entries.length) return null

  return (
    <nav aria-labelledby="contents-title">
      <p
        id="contents-title"
        className="text-[10px] font-semibold tracking-[0.18em] text-[#6B6C5A] uppercase"
      >
        In this article
      </p>
      <ol className="mt-3 border-l border-[#DDDCD0]">
        {entries.map((e) => {
          const on = e.anchor === active
          return (
            <li key={e.anchor}>
              <a
                href={`#${e.anchor}`}
                aria-current={on ? 'location' : undefined}
                onClick={(ev) => {
                  if (!lenis) return
                  ev.preventDefault()
                  lenis.scrollTo(`#${e.anchor}`, { offset: -110 })
                  history.replaceState(null, '', `#${e.anchor}`)
                }}
                className={cn(
                  '-ml-px block border-l-2 py-1.5 pl-3 text-xs leading-snug transition-colors',
                  on
                    ? 'border-[#24260F] font-semibold text-[#24260F]'
                    : 'border-transparent text-[#6B6C5A] hover:text-[#24260F]',
                )}
              >
                {e.number !== undefined && (
                  <span className="tabular-nums">{String(e.number).padStart(2, '0')} </span>
                )}
                {e.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ---------- Adding to the bag ---------- */

/** "Add +" text button for a product in the article. */
export function AddText({ product }: { product: ShopProduct }) {
  const { add } = useBag()
  return (
    <button
      type="button"
      onClick={() => void add(product.id, product.variantID, 1, previewOf(product))}
      disabled={!product.inStock}
      aria-label={product.inStock ? `Add ${product.title} to bag` : `${product.title} is sold out`}
      className="text-olive text-[10px] font-semibold tracking-[0.16em] uppercase hover:opacity-70 disabled:text-[#9A9B8A]"
    >
      {product.inStock ? 'Add +' : 'Sold out'}
    </button>
  )
}

/** The sidebar list of everything the article uses, with an "add the lot" button. */
export function ShopRoutine({
  title,
  note,
  items,
}: {
  title: string
  note: string
  items: { step?: number; product: ShopProduct }[]
}) {
  const { add } = useBag()
  const available = items.filter((i) => i.product.inStock)

  return (
    <aside aria-labelledby="routine-title" className="border border-[#DDDCD0] p-5">
      <h2
        id="routine-title"
        className="font-sans text-[11px] font-semibold tracking-[0.16em] text-[#24260F] uppercase"
      >
        {title}
      </h2>
      {note && <p className="mt-1 text-xs text-[#6B6C5A]">{note}</p>}

      <ul className="mt-4">
        {items.map(({ step, product }) => (
          <li
            key={product.id}
            className="flex items-center gap-3 border-t border-[#EEEDE5] py-3 first:border-t-0 first:pt-0"
          >
            <Link
              href={`/shop/${product.slug}`}
              className="relative size-12 shrink-0 overflow-hidden bg-[#ECEBE4]"
            >
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                sizes="48px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              {step !== undefined && (
                <p className="text-olive text-[9px] font-semibold tracking-[0.16em] uppercase">
                  Step {String(step).padStart(2, '0')}
                </p>
              )}
              <Link
                href={`/shop/${product.slug}`}
                className="hover:text-olive line-clamp-2 text-xs leading-snug font-medium text-[#24260F]"
              >
                {product.title}
              </Link>
              <p className="mt-0.5 text-[11px] text-[#6B6C5A] tabular-nums">
                {product.fromPrice && 'From '}
                {formatPrice(product.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void add(product.id, product.variantID, 1, previewOf(product))}
              disabled={!product.inStock}
              aria-label={
                product.inStock ? `Add ${product.title} to bag` : `${product.title} is sold out`
              }
              className={cn(roundButton, 'shrink-0 disabled:opacity-40')}
            >
              <Icon className="size-3.5">{icons.plus}</Icon>
            </button>
          </li>
        ))}
      </ul>

      {available.length > 1 && (
        <button
          type="button"
          // Queued one after another, so they all land in the same bag
          onClick={() =>
            available.forEach(
              ({ product }) => void add(product.id, product.variantID, 1, previewOf(product)),
            )
          }
          className="hover:bg-olive mt-4 flex w-full items-center justify-between bg-[#24260F] px-4 py-3.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors"
        >
          Add routine to bag
          <Icon className="size-4">{icons.bag}</Icon>
        </button>
      )}
    </aside>
  )
}
