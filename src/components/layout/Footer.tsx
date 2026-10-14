'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'

import { Container } from '@/components/ui'
import { gsap, useGSAP } from '@/lib/gsap'
import { subscribe } from '@/lib/subscribe'

/* ---------- Content (edit here) ---------- */

// Social URLs are placeholders until the real handles are supplied
const columns: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] =
  [
    {
      heading: 'About',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Our Science', href: '/about#science' },
        { label: 'The Salon', href: '/salon' },
        { label: 'Journal', href: '/blog' },
      ],
    },
    {
      heading: 'Help',
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Shipping', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Become a Distributor', href: '/distributors' },
      ],
    },
    {
      heading: 'Follow',
      links: [
        { label: 'Instagram', href: '#', external: true },
        { label: 'TikTok', href: '#', external: true },
        { label: 'WhatsApp', href: '#', external: true },
      ],
    },
  ]

const policies = [
  { label: 'Return Policy', href: '/returns' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

/* ---------- Footer ---------- */

type FooterLink = { label: string; href: string; external?: boolean }

/** `shopLinks` are the collections from Payload, shown first under "Shop". */
export function Footer({ shopLinks }: { shopLinks: FooterLink[] }) {
  const root = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // The wordmark wipes in left to right as the footer comes into view
  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-col]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 })
        .fromTo(
          '[data-wordmark]',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut' },
          '-=0.4',
        )
    },
    { scope: root },
  )

  // Checkout has its own pared-back footer
  if (pathname.startsWith('/checkout')) return null

  return (
    <footer ref={root} className="bg-white pt-16 pb-10 text-[#24260F] md:pt-24">
      <Container>
        {/* Newsletter + link columns */}
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-24">
          <div data-col className="w-full lg:max-w-[32.5rem] lg:shrink-0">
            <h2 className="text-xl font-medium tracking-[0.04em] uppercase md:text-2xl">
              Join the Ten-Q circle
            </h2>
            <p className="mt-4 text-[15px] text-[#6B6C5A] md:text-base">
              Hair-care tips, new launches and 5% off your first order.
            </p>
            <Newsletter />
          </div>

          <nav
            aria-label="Footer"
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {[{ heading: 'Shop', links: shopLinks }, ...columns].map((col) => (
              <div key={col.heading} data-col>
                <h3 className="text-olive text-xs font-semibold tracking-[0.13em] uppercase">
                  {col.heading}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                        className="hover:text-olive text-[15px] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Wordmark */}
        <div data-wordmark className="mt-14 md:mt-[72px]">
          <Image
            src="/brand/tenq-wordmark.png"
            alt="Ten-Q Beauty"
            width={1536}
            height={280}
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="h-auto w-full opacity-90"
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-5 border-t border-[#DDDCD0] pt-6 text-[13px] text-[#6B6C5A] md:mt-[72px] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Ten-Q Beauty. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {policies.map((p) => (
              <li key={p.label}>
                <Link href={p.href} className="transition-colors hover:text-[#24260F]">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs font-semibold tracking-[0.1em] text-[#24260F] uppercase">
            Shop in: NGN ₦
          </p>
        </div>
      </Container>
    </footer>
  )
}

/** Email field with an inline "Subscribe →". Not wired to a mailing list yet — it just confirms locally. */
function Newsletter() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  // Saved to Payload's Subscribers collection
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    const ok = await subscribe(String(email ?? ''), 'footer')
    setDone(ok)
    setError(!ok)
  }

  if (done) {
    return (
      <p role="status" className="mt-6 border-b border-[#24260F] py-4 text-[15px]">
        Thanks — you’re on the list. Check your inbox for your 5% code.
      </p>
    )
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        onChange={() => setError(false)}
        className="mt-6 flex items-center gap-4 border-b border-[#24260F] py-4"
      >
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#6B6C5A]"
        />
        <button
          type="submit"
          className="group text-olive shrink-0 text-xs font-semibold tracking-[0.12em] uppercase transition-colors hover:text-[#24260F]"
        >
          Subscribe{' '}
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#9B3B2A]">
          That didn’t go through — check the address and try again.
        </p>
      )}
    </>
  )
}
