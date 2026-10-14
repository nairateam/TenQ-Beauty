'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'

import type { Journal, JournalPost } from '@/lib/queries/journal'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { subscribe } from '@/lib/subscribe'
import { cn } from '@/lib/utils'

import { formatDate, StoryCard } from './StoryCard'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
/** Grid slot (0-based) the newsletter tile takes when browsing everything */
const NEWSLETTER_SLOT = 5

const eyebrowClass =
  'text-olive flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase md:text-[11px]'

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

/** The journal: intro, category tabs and search, the featured article, then the story grid. */
export function JournalView({ journal }: { journal: Journal }) {
  const root = useRef<HTMLDivElement>(null)
  const params = useSearchParams()
  const { posts, featured, categories } = journal

  // Category and search live in the URL so they can be shared and survive a refresh
  const [category, setCategory] = useState(() =>
    categories.some((c) => c.slug === params.get('category')) ? params.get('category')! : 'all',
  )
  const [query, setQuery] = useState(() => params.get('q') ?? '')

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(window.location.search)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }

  const browsing = category === 'all' && !query.trim()
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return posts.filter(
      (p) =>
        // The featured article has its own slot while browsing everything
        (!browsing || p.id !== featured?.id) &&
        (category === 'all' || p.category?.slug === category) &&
        (!needle ||
          [p.title, p.excerpt, p.category?.title ?? ''].some((t) =>
            t.toLowerCase().includes(needle),
          )),
    )
  }, [posts, featured, category, query, browsing])

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })
      const tl = gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.08 }, '-=0.3')
        .from('[data-fade]', { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, '-=0.7')
      // Only when an article is featured (a filtered link can open without it)
      if (root.current?.querySelector('[data-featured-image]')) {
        tl.from(
          '[data-featured-image]',
          { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power3.inOut' },
          '-=0.9',
        )
      }
      return () => split.revert()
    },
    { scope: root },
  )

  const count = browsing ? posts.length : results.length

  return (
    <div ref={root}>
      {/* Intro */}
      <section
        aria-labelledby="journal-title"
        className="bg-white pt-[calc(var(--header-height)+2.5rem)] md:pt-[calc(var(--header-height)+4rem)]"
      >
        <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {journal.eyebrow && (
                <p data-eyebrow className={eyebrowClass}>
                  <span aria-hidden className="bg-olive size-1 rounded-full" />
                  {journal.eyebrow}
                </p>
              )}
              <h1
                id="journal-title"
                data-title
                className="mt-4 max-w-[36rem] text-4xl leading-[1.05] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-5xl lg:text-[64px]"
              >
                {journal.title}
              </h1>
            </div>
            {journal.intro && (
              <p
                data-fade
                className="max-w-sm text-[15px] leading-relaxed text-[#6B6C5A] lg:text-right"
              >
                {journal.intro}
              </p>
            )}
          </div>

          {/* Tabs + search */}
          <div
            data-fade
            className="mt-10 flex flex-col gap-4 border-b border-[#DDDCD0] md:mt-14 md:flex-row md:items-center md:justify-between"
          >
            <div
              role="tablist"
              aria-label="Topics"
              className="-mb-px flex [scrollbar-width:none] gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            >
              {[{ slug: 'all', title: 'All' }, ...categories].map((c) => {
                const on = category === c.slug
                return (
                  <button
                    key={c.slug}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      setCategory(c.slug)
                      setParam('category', c.slug)
                    }}
                    className={cn(
                      'shrink-0 border-b-2 py-4 text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors',
                      on
                        ? 'border-olive text-[#24260F]'
                        : 'border-transparent text-[#6B6C5A] hover:text-[#24260F]',
                    )}
                  >
                    {c.title}
                  </button>
                )
              })}
            </div>

            <label className="flex items-center gap-2.5 pb-4 md:w-64 md:pb-0">
              <Icon className="text-[#6B6C5A]">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </Icon>
              <span className="sr-only">Search the journal</span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setParam('q', e.target.value.trim())
                }}
                placeholder="Search the journal"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-[#24260F] outline-none placeholder:text-[#9A9B8A]"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Featured */}
      {browsing && featured && <Featured post={featured} />}

      {/* Stories */}
      <section
        aria-labelledby="stories-title"
        className={cn('bg-white pb-20 md:pb-28', browsing && featured ? 'pt-0' : 'pt-12 md:pt-16')}
      >
        <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
          <div
            className={cn(
              'flex items-center justify-between',
              browsing && featured && 'border-t border-[#DDDCD0] pt-10 md:pt-14',
            )}
          >
            <h2 id="stories-title" className={cn(eyebrowClass, 'font-sans')}>
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              {browsing
                ? journal.storiesHeading
                : query.trim()
                  ? `Results for “${query.trim()}”`
                  : categories.find((c) => c.slug === category)?.title}
            </h2>
            <p aria-live="polite" className="text-xs text-[#6B6C5A]">
              {count} {count === 1 ? 'story' : 'stories'}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="mt-10 flex flex-col items-start gap-4 border-t border-[#DDDCD0] pt-10">
              <p className="text-[15px] text-[#6B6C5A]">No stories match that yet.</p>
              <button
                type="button"
                onClick={() => {
                  setCategory('all')
                  setQuery('')
                  setParam('category', 'all')
                  setParam('q', '')
                }}
                className="text-[11px] font-semibold tracking-[0.14em] text-[#24260F] uppercase underline underline-offset-4"
              >
                Show all stories
              </button>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-x-8">
              {results.map((post, i) => (
                <StoryItem key={post.id} post={post}>
                  {browsing && i === Math.min(NEWSLETTER_SLOT, results.length) - 1 && (
                    <li>
                      <NewsletterTile {...journal.newsletter} />
                    </li>
                  )}
                </StoryItem>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function StoryItem({ post, children }: { post: JournalPost; children?: ReactNode }) {
  return (
    <>
      <li>
        <StoryCard post={post} />
      </li>
      {children}
    </>
  )
}

function Featured({ post }: { post: JournalPost }) {
  const href = `/blog/${post.slug}`
  // "Featured guide" → "Read the guide"
  const kind = post.featuredLabel.replace(/^featured\s*/i, '').trim()
  const cta = kind ? `Read the ${kind.toLowerCase()}` : 'Read the article'
  const letters = new Set(post.glossaryLetters)

  return (
    <section aria-labelledby="featured-title" className="bg-white py-10 md:py-14">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-8 px-4 md:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:px-16 xl:gap-20">
        <Link
          href={href}
          data-featured-image
          className="group relative block aspect-[4/3] overflow-hidden bg-[#ECEBE4] lg:aspect-[11/9]"
        >
          {post.image.src && (
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          )}
        </Link>

        <div data-fade>
          <p className="flex flex-wrap items-center gap-3 text-xs text-[#6B6C5A]">
            <span className="bg-olive px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-white uppercase">
              {post.featuredLabel}
            </span>
            <span>
              {post.readingTime} min read ·{' '}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
          </p>
          <h2
            id="featured-title"
            className="mt-5 text-3xl leading-[1.1] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[44px]"
          >
            <Link href={href} className="hover:text-olive transition-colors">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#6B6C5A]">
              {post.excerpt}
            </p>
          )}

          {/* A–Z jump index into the article's glossary */}
          {letters.size > 0 && (
            <nav aria-label={`${post.title} — jump to a letter`} className="mt-7">
              <ul className="grid max-w-md grid-cols-9 gap-1.5 sm:grid-cols-13">
                {ALPHABET.map((letter) => (
                  <li key={letter}>
                    {letters.has(letter) ? (
                      <Link
                        href={`${href}#glossary-${letter.toLowerCase()}`}
                        className={cn(
                          'flex aspect-square items-center justify-center border text-[11px] font-semibold transition-colors',
                          letter === post.glossaryLetters[0]
                            ? 'border-[#24260F] bg-[#24260F] text-white'
                            : 'hover:border-olive border-[#DDDCD0] text-[#24260F]',
                        )}
                      >
                        {letter}
                      </Link>
                    ) : (
                      <span className="flex aspect-square items-center justify-center border border-[#EEEDE5] text-[11px] text-[#C9C8BA]">
                        {letter}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <Link
            href={href}
            className="hover:bg-olive mt-8 inline-flex items-center gap-3 bg-[#24260F] px-7 py-4 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-colors"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  )
}

function NewsletterTile({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setState('sending')
    setState((await subscribe(email, 'journal')) ? 'done' : 'error')
  }

  return (
    <div className="flex h-full min-h-[22rem] flex-col bg-[linear-gradient(160deg,#4a5418_0%,#2c3010_55%,#24260F_100%)] p-7 text-white md:p-8">
      <Icon className="size-5 text-[#C9D27A]">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </Icon>
      {eyebrow && (
        <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-[#C9D27A] uppercase">
          {eyebrow}
        </p>
      )}
      <h3 className="mt-3 text-xl leading-tight font-normal tracking-[0.02em] uppercase md:text-[22px]">
        {title}
      </h3>

      {state === 'done' ? (
        <p role="status" className="mt-auto border-t border-white/20 pt-5 text-sm text-white/85">
          Thanks — you’re on the list. Watch your inbox for your 5% code.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-2.5 pt-10">
          <label htmlFor="journal-email" className="sr-only">
            Email address
          </label>
          <input
            id="journal-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (state === 'error') setState('idle')
            }}
            placeholder="Your email address"
            className="h-12 border border-white/25 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/55 focus:border-white/70"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="group flex h-12 items-center justify-between bg-white px-4 text-[11px] font-semibold tracking-[0.16em] text-[#24260F] uppercase transition-colors hover:bg-[#F0F1DE] disabled:opacity-70"
          >
            {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </button>
          {state === 'error' && (
            <p role="alert" className="text-xs text-[#F3C7BD]">
              That didn’t go through — check the address and try again.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
