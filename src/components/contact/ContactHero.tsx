'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

import { ContactForm } from './ContactForm'

/* ---------- Content (edit here) ---------- */

/** Lucide icons (message-circle, phone, mail, map-pin), drawn inline at 24px. */
const icons: Record<string, ReactNode> = {
  whatsapp: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
}

/** Placeholder details from the design — replace `value` and `href` with the real ones. */
const methods = [
  {
    icon: 'whatsapp',
    title: 'WhatsApp',
    value: '+234 [WhatsApp number]',
    action: 'Chat now',
    href: 'https://wa.me/',
  },
  { icon: 'phone', title: 'Call us', value: '[Head-office phone]', action: 'Call', href: 'tel:' },
  {
    icon: 'mail',
    title: 'Email',
    value: 'hello@tenqbeauty.com',
    action: 'Write to us',
    href: 'mailto:hello@tenqbeauty.com',
  },
  {
    icon: 'pin',
    title: 'Visit the salon',
    value: 'Onidiri Natural Hair Salon, Ibadan',
    action: 'Directions',
    href: 'https://www.google.com/maps/search/?api=1&query=Onidiri+Natural+Hair+Salon+Ibadan',
  },
]

const social = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/' },
]

/* ---------- Section ---------- */

/** Contact page hero — ways to reach the team beside the message form. */
export function ContactHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })

      gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.3')
        .from('[data-sub]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
        .from('[data-form]', { opacity: 0, y: 32, duration: 1 }, '<')
        .from(
          '[data-rule]',
          { scaleX: 0, transformOrigin: 'left', duration: 0.9, stagger: 0.1, ease: 'power2.inOut' },
          '-=0.6',
        )
        .from('[data-method]', { opacity: 0, x: -12, duration: 0.6, stagger: 0.1 }, '<0.1')
        .from('[data-social]', { opacity: 0, y: 10, duration: 0.6 }, '-=0.3')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="contact-title"
      className="bg-[#F6F5EF] pt-[calc(var(--header-height)+3.5rem)] pb-20 md:pt-[calc(var(--header-height)+5rem)] lg:pt-[calc(var(--header-height)+6rem)] lg:pb-28"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)] gap-14 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,37.5rem)] lg:gap-16 lg:px-16 xl:gap-24">
        {/* Contact info */}
        <div className="flex flex-col gap-10">
          <div>
            <p
              data-eyebrow
              className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              Contact us
            </p>
            <h1
              id="contact-title"
              data-title
              className="mt-5 text-[2.5rem] leading-[1.05] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-5xl lg:text-[64px]"
            >
              Let’s talk
              <br /> about your hair.
            </h1>
            <p
              data-sub
              className="mt-5 max-w-[36rem] text-base leading-[1.6] text-[#6B6C5A] md:text-lg"
            >
              Questions about a product, an order, your scalp — or stocking Ten-Q in your city? Our
              team of hair-care experts is here to help.
            </p>
          </div>

          <ul className="flex flex-col">
            {methods.map((m) => (
              <li key={m.title} className="relative">
                <span
                  data-rule
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-[#DDDCD0]"
                />
                <a
                  data-method
                  href={m.href}
                  target={m.href.startsWith('http') ? '_blank' : undefined}
                  rel={m.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group flex items-center gap-4 py-5 md:gap-5"
                >
                  <span className="text-olive flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                    >
                      {icons[m.icon]}
                    </svg>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[11px] font-semibold tracking-[0.15em] text-[#6B6C5A] uppercase">
                      {m.title}
                    </span>
                    <span className="truncate text-base font-medium text-[#24260F] md:text-lg">
                      {m.value}
                    </span>
                  </span>
                  <span className="text-olive hidden shrink-0 text-[11px] font-semibold tracking-[0.13em] uppercase sm:inline">
                    {m.action}{' '}
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div data-social className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#6B6C5A] uppercase">
              Follow
            </span>
            <a
              href={social[0].href}
              target="_blank"
              rel="noreferrer"
              aria-label="Ten-Q on Instagram"
              className="flex size-10 items-center justify-center rounded-full border border-[#DDDCD0] text-[#24260F] transition-colors hover:border-[#24260F]"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <span className="text-sm text-[#6B6C5A]">
              {social.map((s, i) => (
                <span key={s.label}>
                  {i > 0 && ' · '}
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#24260F]"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* Form */}
        <div
          id="message"
          data-form
          className="scroll-mt-[calc(var(--header-height)+1.5rem)] lg:self-start"
        >
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
