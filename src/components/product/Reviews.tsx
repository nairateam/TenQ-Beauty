'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { reviewSummary } from '@/lib/reviews'
import type { Review } from '@/types/product'
import { gsap, useGSAP } from '@/lib/gsap'

import { Stars } from './Stars'

/* ---------- Content (edit here) ---------- */

/** Reviews aren't collected online yet, so "Write a review" opens the contact form. */
const writeReviewHref = '/contact#message'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${iso}T00:00:00`),
  )

/* ---------- Section ---------- */

/** Rating summary with a star breakdown beside the reviews, in the order listed. */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const root = useRef<HTMLElement>(null)
  const { count, average, byStars } = reviewSummary(reviews)

  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-summary]', { opacity: 0, y: 16, duration: 0.8 })
        .from(
          '[data-bar]',
          { scaleX: 0, transformOrigin: 'left', duration: 0.9, stagger: 0.06, ease: 'power2.out' },
          '-=0.5',
        )
        .from('[data-review]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 }, '<')
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="reviews"
      aria-labelledby="reviews-title"
      className="scroll-mt-[var(--header-height)] bg-white py-20 md:py-24 lg:py-[110px]"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)] gap-12 px-4 md:px-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16 lg:px-16 xl:gap-24">
        {/* Summary */}
        <div data-summary className="flex flex-col items-start lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <h2
            id="reviews-title"
            className="text-olive flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
          >
            <span aria-hidden className="bg-olive size-1 rounded-full" />
            Reviews
          </h2>

          <div className="mt-5 flex items-center gap-4">
            <span className="text-olive text-6xl leading-none font-extralight tabular-nums md:text-7xl">
              {count ? average.toFixed(1) : '–'}
            </span>
            <span className="flex flex-col gap-1.5">
              <Stars rating={average} className="text-sm" />
              <span className="text-xs text-[#6B6C5A]">
                {count ? `Based on ${count} review${count > 1 ? 's' : ''}` : 'No reviews yet'}
              </span>
            </span>
          </div>

          <ul className="mt-6 flex w-full flex-col gap-2">
            {byStars.map((row) => (
              <li
                key={row.stars}
                className="grid grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center gap-3 text-[11px] text-[#6B6C5A] tabular-nums"
              >
                <span>{row.stars} ★</span>
                <span className="relative h-[3px] bg-[#ECEBE4]">
                  <span
                    data-bar
                    className="bg-olive absolute inset-y-0 left-0"
                    style={{ width: count ? `${(row.count / count) * 100}%` : 0 }}
                  />
                </span>
                <span className="text-right">
                  <span className="sr-only">{row.stars}-star reviews: </span>
                  {row.count}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={writeReviewHref}
            className="mt-8 border border-[#24260F] px-6 py-3.5 text-[11px] font-semibold tracking-[0.14em] text-[#24260F] uppercase transition-colors hover:bg-[#24260F] hover:text-white"
          >
            Write a review
          </Link>
        </div>

        {/* List */}
        {count > 0 ? (
          <ul className="border-b border-[#DDDCD0]">
            {reviews.map((r) => (
              <li
                key={`${r.name}-${r.date}`}
                data-review
                className="border-t border-[#DDDCD0] py-6 md:py-7"
              >
                <article>
                  <header className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="text-olive flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F6F5EF] text-sm font-medium"
                      >
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-sans text-sm font-semibold text-[#24260F]">
                          {r.name}
                        </h3>
                        <p className="text-olive mt-0.5 flex items-center gap-1 text-[11px]">
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <span className="text-[#6B6C5A]">Reviewer</span>
                        </p>
                      </div>
                    </div>
                    <time dateTime={r.date} className="shrink-0 text-xs text-[#6B6C5A]">
                      {formatDate(r.date)}
                    </time>
                  </header>
                  <Stars rating={r.rating} className="mt-3 text-xs" />
                  <p className="mt-3 text-base leading-[1.6] text-[#24260F]">{r.text}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="self-center text-base text-[#6B6C5A]">
            Be the first to tell us how this product worked for you.
          </p>
        )}
      </div>
    </section>
  )
}
