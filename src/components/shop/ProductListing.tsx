'use client'

import { useLenis } from 'lenis/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { ProductCard } from '@/components/products/ProductCard'
import { Container } from '@/components/ui'
import { formatPrice } from '@/lib/format'
import { gsap, useGSAP } from '@/lib/gsap'
import type { ShopPromo } from '@/lib/queries/shop'
import { collectionLine } from '@/lib/shop'
import { cn } from '@/lib/utils'
import type { FilterOption, ShopCollection as Collection, ShopProduct } from '@/types/product'

const PAGE_SIZE = 12
const PRICE_STEP = 500
/** Grid slot the promo tile takes (0-based) */
const PROMO_SLOT = 5

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const

type SortOption = (typeof sortOptions)[number]['value']

type Filters = { concerns: string[]; hairTypes: string[]; price: [number, number] }

/** Shop listing — collection tabs, sort, filters sidebar (drawer on phones) and the product grid. */
export function ProductListing({
  products,
  collections,
  concerns,
  hairTypes,
  promo,
}: {
  products: ShopProduct[]
  collections: Collection[]
  concerns: FilterOption[]
  hairTypes: FilterOption[]
  promo: ShopPromo | null
}) {
  const root = useRef<HTMLElement>(null)
  const params = useSearchParams()

  // Collection and sort live in the URL so the hero buttons and shared links can set them
  const collection = collections.some((c) => c.slug === params.get('collection'))
    ? params.get('collection')!
    : 'all'
  const sort = (sortOptions.find((o) => o.value === params.get('sort'))?.value ??
    'popularity') as SortOption

  const priceBounds = useMemo<[number, number]>(() => {
    const prices = products.map((p) => p.price)
    return [
      Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
      Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
    ]
  }, [products])

  const emptyFilters: Filters = { concerns: [], hairTypes: [], price: priceBounds }
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount =
    filters.concerns.length +
    filters.hairTypes.length +
    (filters.price[0] !== priceBounds[0] || filters.price[1] !== priceBounds[1] ? 1 : 0)

  function setParam(key: string, value: string, fallback: string) {
    const next = new URLSearchParams(params.toString())
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    const query = next.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }

  // Start from the first page whenever the result set changes
  const signature = `${collection}|${sort}|${JSON.stringify(filters)}`
  const [lastSignature, setLastSignature] = useState(signature)
  if (signature !== lastSignature) {
    setLastSignature(signature)
    setVisible(PAGE_SIZE)
  }

  const results = useMemo(() => {
    const matches = products.filter(
      (p) =>
        (collection === 'all' || p.collections.includes(collection)) &&
        (!filters.concerns.length || filters.concerns.some((c) => p.concerns.includes(c))) &&
        (!filters.hairTypes.length || filters.hairTypes.some((t) => p.hairTypes.includes(t))) &&
        p.price >= filters.price[0] &&
        p.price <= filters.price[1],
    )
    if (sort === 'newest') return [...matches].sort((a, b) => b.added - a.added)
    if (sort === 'price-asc') return [...matches].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...matches].sort((a, b) => b.price - a.price)
    return [...matches].sort((a, b) => a.popularity - b.popularity)
  },[products, collection, sort, filters])

  const shown = results.slice(0, visible)
  const showPromo =
    promo !== null &&
    (collection === 'all' || promo.collections.includes(collection)) &&
    shown.length >= PROMO_SLOT

  // Cards rise in: all of them when the results change, only the new ones after "Load more"
  const animateFrom = useRef(0)
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const cards = gsap.utils
        .toArray<HTMLElement>('[data-card]', root.current)
        .filter((el) => Number(el.dataset.card) >= animateFrom.current)
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05, overwrite: true },
      )
    },
    { scope: root, dependencies: [signature, visible], revertOnUpdate: false },
  )

  function loadMore() {
    animateFrom.current = visible
    setVisible((v) => v + PAGE_SIZE)
  }
  function update(next: Filters) {
    animateFrom.current = 0
    setFilters(next)
  }

  const countFor = (slug: string) =>
    slug === 'all' ? products.length : products.filter((p) => p.collections.includes(slug)).length

  const filterPanel = (
    <FilterPanel
      filters={filters}
      concerns={concerns}
      hairTypes={hairTypes}
      priceBounds={priceBounds}
      activeCount={activeCount}
      onChange={update}
      onClear={() => update(emptyFilters)}
    />
  )

  return (
    <section ref={root} id="products" aria-label="Products" className="scroll-mt-24 pb-20 md:pb-28">
      {/* Toolbar: collection tabs + sort */}
      <div className="border-b border-[#E7E6DC]">
        <Container className="flex items-center gap-6">
          <nav
            aria-label="Collections"
            className="-mx-4 flex min-w-0 flex-1 [scrollbar-width:none] gap-7 overflow-x-auto px-4 md:mx-0 md:px-0"
          >
            {[{ slug: 'all', name: 'All' }, ...collections].map((c) => {
              const selected = c.slug === collection
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    animateFrom.current = 0
                    setParam('collection', c.slug, 'all')
                  }}
                  className={cn(
                    'focus-visible:ring-olive/40 -mb-px shrink-0 border-b-2 py-5 text-[11px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors outline-none focus-visible:ring-2',
                    selected
                      ? 'border-olive text-[#24260F]'
                      : 'border-transparent text-[#6B6C5E] hover:text-[#24260F]',
                  )}
                >
                  {c.name}
                  <span className="ml-1.5 font-normal text-[#A9A898] tabular-nums">
                    {countFor(c.slug)}
                  </span>
                </button>
              )
            })}
          </nav>

          <label className="hidden shrink-0 items-center gap-2 text-xs text-[#6B6C5E] md:flex">
            Sort by:
            <SortSelect value={sort} onChange={(v) => setParam('sort', v, 'popularity')} />
          </label>
        </Container>
      </div>

      <Container className="mt-6 md:mt-10">
        {/* Phones: filters button + sort */}
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 border border-[#DDDCD0] px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase"
          >
            <FilterIcon />
            Filters
            {activeCount > 0 && (
              <span className="bg-olive grid size-5 place-items-center rounded-full text-[10px] text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="flex items-center gap-2 text-xs text-[#6B6C5E] md:hidden">
            <span className="sr-only">Sort by</span>
            <SortSelect value={sort} onChange={(v) => setParam('sort', v, 'popularity')} />
          </label>
        </div>

        <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10 xl:gap-12">
          {/* Sidebar */}
          <aside aria-label="Filters" className="hidden lg:block">
            {filterPanel}
            <RoutineCard className="mt-8" />
          </aside>

          {/* Grid */}
          <div>
            {results.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <p className="text-sm font-semibold tracking-[0.12em] uppercase">
                  No products match
                </p>
                <p className="mt-2 text-sm text-[#6B6C5E]">Try removing a filter or two.</p>
                <button
                  type="button"
                  onClick={() => update(emptyFilters)}
                  className="mt-6 border border-[#24260F] px-6 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-[#24260F] hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:grid-cols-3 md:gap-y-12">
                {shown.map((p, i) => (
                  <ProductItem key={p.slug} index={i} product={p} collections={collections}>
                    {showPromo && promo && i === PROMO_SLOT - 1 && (
                      <li data-card={i} className="col-span-2 md:col-span-1">
                        <PromoTile promo={promo} />
                      </li>
                    )}
                  </ProductItem>
                ))}
              </ul>
            )}

            {/* Load more */}
            {results.length > 0 && (
              <div className="mt-14 flex flex-col items-center md:mt-16">
                <p className="text-xs text-[#6B6C5E]">
                  Showing {shown.length} of {results.length} products
                </p>
                <span aria-hidden className="mt-3 block h-0.5 w-40 bg-[#E7E6DC]">
                  <span
                    className="bg-olive block h-full transition-[width] duration-700"
                    style={{ width: `${(shown.length / results.length) * 100}%` }}
                  />
                </span>
                {shown.length < results.length && (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="mt-6 border border-[#24260F] px-8 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-[#24260F] hover:text-white"
                  >
                    Load more products
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={results.length}
      >
        {filterPanel}
      </FilterDrawer>
    </section>
  )
}

/* ---------- Grid items ---------- */

function ProductItem({
  product,
  index,
  collections,
  children,
}: {
  product: ShopProduct
  index: number
  collections: Collection[]
  /** Rendered after this card (the promo tile) */
  children?: ReactNode
}) {
  const subtitle = collectionLine(product, collections, 3)

  return (
    <>
      <li data-card={index}>
        <ProductCard product={{ ...product, subtitle }} priority={index < 3} />
      </li>
      {children}
    </>
  )
}

function PromoTile({ promo }: { promo: ShopPromo }) {
  return (
    <div className="flex h-full flex-col bg-[#272A10] p-5 text-white lg:p-6">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C9D27A] uppercase">
        {promo.eyebrow}
      </p>
      <h3 className="mt-2.5 text-xl leading-tight font-normal tracking-[0.02em] uppercase lg:text-[22px]">
        {promo.headline}
      </h3>
      <Link
        href={promo.href}
        className="group relative mt-5 block aspect-[4/3] overflow-hidden bg-white md:aspect-auto md:min-h-40 md:flex-1"
      >
        <Image
          src={promo.image.src}
          alt={promo.image.alt}
          fill
          sizes="(min-width: 768px) 25vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.1em] uppercase">{promo.name}</p>
          <p className="mt-1 text-sm text-white/75">
            {promo.fromPrice && 'From '}
            {formatPrice(promo.price)}
          </p>
        </div>
        {promo.cta && (
          <Link
            href={`/shop?collection=${promo.cta.collection}#products`}
            scroll={false}
            className="group shrink-0 pb-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase"
          >
            {promo.cta.label}{' '}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

function RoutineCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-cream p-5', className)}>
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
        Not sure where to start?
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-[#5B5C4E]">
        Tell us your hair concern and we’ll build a routine around it.
      </p>
      <Link
        href="/#concern-title"
        className="mt-5 inline-block bg-[#24260F] px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-olive"
      >
        Find your routine
      </Link>
    </div>
  )
}

/* ---------- Filters ---------- */

function FilterPanel({
  filters,
  concerns,
  hairTypes,
  priceBounds,
  activeCount,
  onChange,
  onClear,
}: {
  filters: Filters
  concerns: FilterOption[]
  hairTypes: FilterOption[]
  priceBounds: [number, number]
  activeCount: number
  onChange: (next: Filters) => void
  onClear: () => void
}) {
  function toggle<K extends 'concerns' | 'hairTypes'>(key: K, value: Filters[K][number]) {
    const list = filters[key] as string[]
    onChange({
      ...filters,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#E7E6DC] pb-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
          <FilterIcon />
          Filters
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="text-xs text-[#6B6C5E] transition-colors hover:text-[#24260F] disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Concern">
        {concerns.map((o) => (
          <Checkbox
            key={o.value}
            label={o.label}
            checked={filters.concerns.includes(o.value)}
            onChange={() => toggle('concerns', o.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Hair type">
        {hairTypes.map((o) => (
          <Checkbox
            key={o.value}
            label={o.label}
            checked={filters.hairTypes.includes(o.value)}
            onChange={() => toggle('hairTypes', o.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price" last>
        <PriceRange
          bounds={priceBounds}
          value={filters.price}
          onChange={(price) => onChange({ ...filters, price })}
        />
      </FilterGroup>
    </div>
  )
}

function FilterGroup({
  title,
  last,
  children,
}: {
  title: string
  last?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <fieldset className={cn('py-5', !last && 'border-b border-[#E7E6DC]')}>
      <legend className="contents">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between text-[11px] font-semibold tracking-[0.16em] uppercase"
        >
          {title}
          <span aria-hidden className="text-base leading-none font-normal text-[#6B6C5E]">
            {open ? '−' : '+'}
          </span>
        </button>
      </legend>
      {open && <div className="mt-4 space-y-2.5">{children}</div>}
    </fieldset>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 text-[13px] text-[#3A3B2C]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className="peer-focus-visible:ring-olive/40 grid size-4 shrink-0 place-items-center border border-[#BDBCAE] transition-colors group-hover:border-[#24260F] peer-checked:border-[#24260F] peer-checked:bg-[#24260F] peer-focus-visible:ring-2"
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="white" strokeWidth={2}>
            <path d="m2.5 6 2.5 2.5 4.5-5" />
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

function PriceRange({
  bounds: [min, max],
  value: [low, high],
  onChange,
}: {
  bounds: [number, number]
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const thumb =
    'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-[#24260F] [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-[#24260F] [&::-webkit-slider-thumb]:bg-white focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-olive/40'

  return (
    <div className="pt-1">
      <div className="relative h-4">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#BDBCAE]" />
        <span
          aria-hidden
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-[#24260F]"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={PRICE_STEP}
          value={low}
          onChange={(e) => onChange([Math.min(Number(e.target.value), high - PRICE_STEP), high])}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={PRICE_STEP}
          value={high}
          onChange={(e) => onChange([low, Math.max(Number(e.target.value), low + PRICE_STEP)])}
          className={thumb}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-[#6B6C5E] tabular-nums">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  )
}

/* ---------- Phone filter drawer ---------- */

function FilterDrawer({
  open,
  onClose,
  resultCount,
  children,
}: {
  open: boolean
  onClose: () => void
  resultCount: number
  children: ReactNode
}) {
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis, onClose])

  return (
    <div
      className={cn('fixed inset-0 z-[60] lg:hidden', open ? 'visible' : 'invisible delay-500')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-500',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          'absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5 pt-6">
          {children}
        </div>
        <div className="flex gap-3 border-t border-[#E7E6DC] p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#24260F] py-3.5 text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
          >
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid size-12 place-items-center border border-[#DDDCD0]"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Bits ---------- */

function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  return (
    <span className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="focus-visible:ring-olive/40 cursor-pointer appearance-none bg-transparent py-1 pr-5 text-[11px] font-semibold tracking-[0.16em] text-[#24260F] uppercase outline-none focus-visible:ring-2"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}

function FilterIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    >
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  )
}
