'use client'

import Image from 'next/image'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

/**
 * Each `href` is a `#topic-…` hash: it scrolls up to the message form and pre-selects that topic
 * (see `topicHashes` in ContactForm). Set `image.src` once a photo is in /public; until then a placeholder shows.
 */
const routes: {
  title: string
  description: string
  cta: { label: string; href: string }
  image: { src?: string; alt: string }
}[] = [
  {
    title: 'Hair consultation',
    description:
      'Not sure what your scalp needs? Share photos and get a routine from our scalp and hair health experts.',
    cta: { label: 'Book a consultation', href: '#topic-consultation' },
    image: {
      src: '/images/tenq1.png',
      alt: 'A woman with long natural curls holding a bottle of Ten-Q Bloom Hair Growth Serum',
    },
  },
  {
    title: 'Onidiri Salon, Ibadan',
    description:
      'Professional treatment and styling for textured hair. Walk-ins welcome — calling ahead is recommended.',
    cta: { label: 'Book a visit', href: '#topic-salon' },
    image: { alt: 'A client relaxing during a wash at Onidiri Natural Hair Salon' },
  },
  {
    title: 'Wholesale & distribution',
    description:
      'Stock Ten-Q in your city or salon. Join our network of distributors in Nigeria and abroad.',
    cta: { label: 'Become a distributor', href: '#topic-wholesale' },
    image: {
      src: '/images/tenq2.png',
      alt: 'The Ten-Q Beauty haircare range among fresh botanicals',
    },
  },
]

/* ---------- Section ---------- */

/** "Choose your route" — consultation, salon and wholesale as three image cards. */
export function ContactRoutes() {
  const root = useRef<HTMLElement>(null)

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
        // Each card's photo wipes up while drifting back to scale, then its copy follows
        .fromTo(
          '[data-card-img]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: 0.15, ease: 'power3.inOut' },
          '-=0.5',
        )
        .from('[data-card-zoom]', { scale: 1.15, duration: 1.6, stagger: 0.15 }, '<')
        .from('[data-card-body]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.15 }, '-=0.9')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="routes-title"
      className="bg-white py-20 md:py-28 lg:py-[110px]"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        <p
          data-eyebrow
          className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs"
        >
          <span aria-hidden className="bg-olive size-1 rounded-full" />
          How we can help
        </p>
        <h2
          id="routes-title"
          data-title
          className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px]"
        >
          Choose your route
        </h2>

        <ul className="mt-12 grid gap-12 md:grid-cols-3 md:gap-5 lg:mt-14">
          {routes.map((r) => (
            <li key={r.title} className="group">
              <a href={r.cta.href} className="block">
                <div data-card-img className="relative aspect-[7/5] overflow-hidden bg-[#ECEBE4]">
                  <div
                    data-card-zoom
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  >
                    {r.image.src ? (
                      <Image
                        src={r.image.src}
                        alt={r.image.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-[11px] font-semibold tracking-[0.16em] text-[#6B6C5A] uppercase">
                        {r.title} photo
                      </div>
                    )}
                  </div>
                </div>

                <div data-card-body className="mt-5">
                  <h3 className="text-base font-semibold tracking-[0.08em] text-[#24260F] uppercase">
                    {r.title}
                  </h3>
                  <p className="mt-3 max-w-[26rem] text-[15px] leading-[1.6] text-[#6B6C5A]">
                    {r.description}
                  </p>
                  <span className="text-olive mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
                    {r.cta.label}
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
