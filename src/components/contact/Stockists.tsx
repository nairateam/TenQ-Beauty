'use client'

import { useRef, useState } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

type Stockist = { area: string; shop: string; phone: string }

/** Nigerian stockists by region. The tab counts come from these lists — add entries to fill a region. */
const regions: { name: string; stockists: Stockist[] }[] = [
  {
    name: 'Lagos',
    stockists: [
      { area: 'Lekki', shop: 'Ten-Q distributor', phone: '0802 309 5636' },
      { area: 'Yaba', shop: 'K_bee Naturals', phone: '0803 591 5359' },
      { area: 'Ilupeju', shop: 'Ten-Q distributor', phone: '0703 687 9011' },
      { area: 'Sangotedo', shop: 'HOFS Makeover', phone: '0813 941 2326' },
      { area: 'Ikeja', shop: 'Ten-Q distributor', phone: '0816 961 8348' },
      { area: 'Ketu', shop: 'Ten-Q distributor', phone: '0816 331 6017' },
      { area: 'Ogba', shop: 'Opp. Excellence Hotel, Aguda-Ogba', phone: '0812 225 5852' },
      { area: 'Ogudu', shop: 'Pearl’s Touch', phone: '0703 341 1435' },
      { area: 'Ipaja', shop: 'Ten-Q distributor', phone: '0904 826 6106' },
      { area: 'Ikorodu', shop: 'Ten-Q distributor', phone: '0703 739 1490' },
      { area: 'Surulere', shop: 'Adeniran Ogunsanya Mall', phone: '0815 517 5221' },
      { area: 'Shomolu', shop: '5 Bajulaye Rd, by Morocco bus stop', phone: '0707 849 9464' },
    ],
  },
  { name: 'Oyo', stockists: [] },
  { name: 'Ogun', stockists: [] },
  { name: 'Abuja', stockists: [] },
  { name: 'Other states', stockists: [] },
]

/** Stockists outside Nigeria — `detail` is a phone number or a web address. */
const international: { place: string; detail: string; href?: string }[] = [
  { place: 'South Africa', detail: '+27 60 488 2171' },
  { place: 'Cameroon', detail: '+237 7935 0162' },
  {
    place: 'UK · Southampton',
    detail: 'hephzibahbeauty.etsy.com',
    href: 'https://hephzibahbeauty.etsy.com',
  },
  { place: 'UK & Europe', detail: 'GloCre8s on Etsy' },
  { place: 'Scotland', detail: '+44 7520 245259' },
  { place: 'USA', detail: 'tenqbeauty.amioluwa.com', href: 'https://tenqbeauty.amioluwa.com' },
  { place: 'Canada · Manitoba', detail: '+1 204 599 6074' },
  { place: 'Canada · Calgary', detail: '+1 403 966 6171' },
  { place: 'Canada · Ontario', detail: '+1 433 668 834' },
]

const intro = 'Buy in person from 49 trusted distributors across Nigeria and around the world.'

const becomeStockist = {
  text: 'Don’t see your city? Stock Ten-Q in your area.',
  label: 'Become a distributor',
  href: '#topic-wholesale',
}

/* ---------- Helpers ---------- */

const INTERNATIONAL = 'International'

/** `0802 309 5636` → `tel:+2348023095636`; international numbers keep their country code. */
function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits.startsWith('+') ? digits : `+234${digits.replace(/^0/, '')}`}`
}

function internationalHref(i: (typeof international)[number]) {
  if (i.href) return i.href
  return /^\+[\d\s]+$/.test(i.detail) ? telHref(i.detail) : undefined
}

const pinIcon = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-olive size-[18px] shrink-0"
  >
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const phoneIcon = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-[15px]"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

/* ---------- Section ---------- */

/** "Find Ten-Q near you" — region tabs over a list of stockists, beside the international card. */
export function Stockists() {
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(regions[0].name)

  const tabs = [
    ...regions.map((r) => ({ name: r.name, count: r.stockists.length })),
    { name: INTERNATIONAL, count: international.length },
  ]

  // Rows for the active tab: Nigerian stockists get a call button, international ones their phone or web link
  const current: (Stockist & { href?: string })[] =
    active === INTERNATIONAL
      ? international.map((i) => ({
          area: i.place,
          shop: i.detail,
          phone: '',
          href: internationalHref(i),
        }))
      : (regions.find((r) => r.name === active)?.stockists ?? []).map((s) => ({
          ...s,
          href: telHref(s.phone),
        }))
  const half = Math.ceil(current.length / 2)
  const columns = [current.slice(0, half), current.slice(half)].filter((c) => c.length)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.3')
        .from('[data-intro]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
        .from('[data-tab]', { opacity: 0, y: 10, duration: 0.5, stagger: 0.05 }, '-=0.5')
        .from('[data-panel]', { opacity: 0, y: 24, duration: 0.9, stagger: 0.15 }, '-=0.3')

      return () => split.revert()
    },
    { scope: root },
  )

  // Rows rise in each time the region changes
  useGSAP(
    () => {
      gsap.from('[data-row]', {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power2.out',
      })
    },
    { scope: list, dependencies: [active] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="stockists-title"
      className="bg-[#F6F5EF] py-20 md:py-28 lg:py-[120px]"
    >
      <div className="mx-auto flex max-w-[90rem] flex-col gap-10 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              data-eyebrow
              className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              Stockists
            </p>
            <h2
              id="stockists-title"
              data-title
              className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[44px]"
            >
              Find Ten-Q near you
            </h2>
          </div>
          <p
            data-intro
            className="max-w-[24rem] text-base leading-relaxed text-[#6B6C5A] md:shrink-0 md:text-right md:text-[17px]"
          >
            {intro}
          </p>
        </div>

        {/* Region tabs */}
        <div
          role="tablist"
          aria-label="Regions"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
        >
          {tabs.map((t) => {
            const selected = t.name === active
            return (
              <button
                key={t.name}
                data-tab
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="stockist-list"
                onClick={() => setActive(t.name)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-[18px] py-3 transition-colors',
                  selected
                    ? 'border-[#24260F] bg-[#24260F] text-white'
                    : 'border-[#DDDCD0] bg-white text-[#24260F] hover:border-[#24260F]',
                )}
              >
                <span className="text-[11px] font-semibold tracking-[0.11em] uppercase">
                  {t.name}
                </span>
                {t.count > 0 && (
                  <span className={cn('text-xs', selected ? 'text-[#C9D27A]' : 'text-[#6B6C5A]')}>
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Stockist list */}
          <div data-panel className="flex flex-col gap-6">
            <div ref={list} id="stockist-list" role="tabpanel" aria-label={`${active} stockists`}>
              {columns.length ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  {columns.map((col, c) => (
                    <ul key={c} className="flex flex-col bg-white">
                      {col.map((s) => {
                        const { href } = s
                        return (
                          <li
                            key={s.area}
                            data-row
                            className="flex items-center gap-4 border-t border-[#DDDCD0] px-5 py-[18px] first:border-t-0 md:px-6"
                          >
                            {pinIcon}
                            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                              <span className="text-base font-semibold text-[#24260F]">
                                {s.area}
                              </span>
                              <span className="text-[13px] leading-[18px] text-[#6B6C5A]">
                                {s.shop}
                              </span>
                            </span>
                            {s.phone && (
                              <span className="hidden text-sm whitespace-nowrap text-[#24260F] sm:inline">
                                {s.phone}
                              </span>
                            )}
                            {href && (
                              <a
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                                aria-label={`${href.startsWith('tel:') ? 'Call' : 'Visit'} ${s.area} stockist`}
                                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#DDDCD0] text-[#24260F] transition-colors hover:border-[#24260F] hover:bg-[#24260F] hover:text-white"
                              >
                                {href.startsWith('tel:') ? phoneIcon : <span aria-hidden>↗</span>}
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  ))}
                </div>
              ) : (
                <div
                  data-row
                  className="bg-white px-6 py-10 text-center text-[15px] text-[#6B6C5A]"
                >
                  Our {active} stockist list is on its way.{' '}
                  <a
                    href="#message"
                    className="font-medium text-[#24260F] underline underline-offset-4"
                  >
                    Message us
                  </a>{' '}
                  and we’ll point you to the nearest one.
                </div>
              )}
            </div>

            <a
              href={becomeStockist.href}
              className="group flex flex-col gap-3 border border-[#24260F] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-base font-medium text-[#24260F]">{becomeStockist.text}</span>
              <span className="text-olive text-[11px] font-semibold tracking-[0.13em] whitespace-nowrap uppercase">
                {becomeStockist.label}{' '}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </a>
          </div>

          {/* International */}
          <aside
            data-panel
            aria-labelledby="international-title"
            className="flex flex-col gap-5 self-start bg-[#2B2F10] p-7 md:p-9"
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#C9D27A] uppercase md:text-xs">
              <span aria-hidden className="size-1 rounded-full bg-[#C9D27A]" />
              Outside Nigeria
            </p>
            <h3
              id="international-title"
              className="text-xl leading-[1.3] font-normal text-white uppercase"
            >
              We ship worldwide — or buy locally
            </h3>
            <ul className="flex flex-col">
              {international.map((i) => {
                const href = internationalHref(i)
                return (
                  <li
                    key={i.place}
                    className="flex items-center justify-between gap-4 border-t border-white/15 py-[13px]"
                  >
                    <span className="text-[15px] font-medium text-white">{i.place}</span>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noreferrer' : undefined}
                        className="truncate text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {i.detail}
                      </a>
                    ) : (
                      <span className="truncate text-sm text-white/70">{i.detail}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
