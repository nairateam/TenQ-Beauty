'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useId, useRef, useState } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

/** Placeholder like the hero's WhatsApp link — add the number after `wa.me/`. */
const whatsapp = { label: 'Chat on WhatsApp', href: 'https://wa.me/' }

const linkClass = 'font-medium text-[#24260F] underline underline-offset-4 hover:text-olive'

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Do you deliver outside Nigeria?',
    a: (
      <>
        Yes — we deliver worldwide. You can also buy from our distributors in South Africa,
        Cameroon, the UK, the USA and Canada (see{' '}
        <a href="#stockists-title" className={linkClass}>
          Stockists
        </a>{' '}
        above).
      </>
    ),
  },
  {
    q: 'Which products help with dandruff and an itchy scalp?',
    a: (
      <>
        Start with the Relief Scalp Detox Shampoo, then follow with the Antidandruff Spray or the
        Growth &amp; Anti-Dandruff Pomade. Not sure which suits you?{' '}
        <a href="#topic-consultation" className={linkClass}>
          Book a consultation
        </a>{' '}
        and our experts will build your routine.
      </>
    ),
  },
  {
    q: 'Are your products safe for children?',
    a: (
      <>
        Yes — our{' '}
        <Link href="/shop?collection=afro-kids" className={linkClass}>
          Afro Kids range
        </Link>{' '}
        is made to be gentle on young scalps. As with any new product, do a small patch test first.
      </>
    ),
  },
  {
    q: 'Are Ten-Q products NAFDAC approved?',
    a: 'Yes. Ten-Q products are NAFDAC approved and made with natural African botanicals.',
  },
  {
    q: 'How do I become a distributor or reseller?',
    a: (
      <>
        <a href="#topic-wholesale" className={linkClass}>
          Send us a message
        </a>{' '}
        with &ldquo;Wholesale &amp; distribution&rdquo; selected and tell us where you&rsquo;re
        based — our team will share pricing and next steps.
      </>
    ),
  },
  {
    q: 'Can I book a hair consultation or salon visit?',
    a: (
      <>
        Yes. Book a{' '}
        <a href="#topic-consultation" className={linkClass}>
          hair consultation
        </a>{' '}
        online, or{' '}
        <a href="#topic-salon" className={linkClass}>
          book a visit
        </a>{' '}
        to Onidiri Natural Hair Salon in Ibadan — walk-ins are welcome, but calling ahead is
        recommended.
      </>
    ),
  },
]

/* ---------- Section ---------- */

/** "Quick answers" — intro with a WhatsApp CTA beside a one-open-at-a-time accordion. */
export function Faq() {
  const root = useRef<HTMLElement>(null)
  const id = useId()
  const [open, setOpen] = useState<number | null>(0)

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
        .from('[data-intro]', { opacity: 0, y: 16, duration: 0.8, stagger: 0.12 }, '-=0.6')
        .from(
          '[data-rule]',
          {
            scaleX: 0,
            transformOrigin: 'left',
            duration: 0.9,
            stagger: 0.08,
            ease: 'power2.inOut',
          },
          '-=0.8',
        )
        .from('[data-question]', { opacity: 0, y: 12, duration: 0.6, stagger: 0.08 }, '<0.1')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="faq-title"
      className="bg-white py-20 md:py-28 lg:py-[120px]"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)] gap-12 px-4 md:px-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16 lg:px-16 xl:gap-24">
        {/* Intro */}
        <div className="flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <div>
            <p
              data-eyebrow
              className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              FAQ
            </p>
            <h2
              id="faq-title"
              data-title
              className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[44px]"
            >
              Quick answers
            </h2>
          </div>
          <p data-intro className="text-base leading-[1.6] text-[#6B6C5A] md:text-[17px]">
            Can’t find what you’re looking for? Message us on WhatsApp — a real person from our team
            will reply.
          </p>
          <a
            data-intro
            href={whatsapp.href}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-olive flex items-center gap-3 bg-[#24260F] px-[26px] py-4 text-[12px] font-semibold tracking-[0.12em] text-white uppercase transition-colors"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[18px]"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            {whatsapp.label}
          </a>
        </div>

        {/* Accordion */}
        <ul className="border-b border-[#DDDCD0]">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <li key={f.q} className="relative">
                <span
                  data-rule
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-[#DDDCD0]"
                />
                <h3 data-question>
                  <button
                    type="button"
                    id={`${id}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-[26px] text-left"
                  >
                    <span className="font-sans text-lg font-medium text-[#24260F] md:text-xl">{f.q}</span>
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                        isOpen
                          ? 'border-[#24260F] bg-[#24260F] text-white'
                          : 'border-[#DDDCD0] text-[#24260F] group-hover:border-[#24260F]',
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        className="size-4"
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
                    </span>
                  </button>
                </h3>
                <div
                  id={`${id}-a${i}`}
                  role="region"
                  aria-labelledby={`${id}-q${i}`}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="max-w-[40rem] pb-[26px] text-base leading-[1.625] text-[#6B6C5A]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
