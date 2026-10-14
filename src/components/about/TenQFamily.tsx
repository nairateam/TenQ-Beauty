'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

/** Set each `image.src` once the photo is in /public; until then a placeholder shows. */
const homes: {
  tag: string
  title: string
  description: string
  cta: { label: string; href: string }
  image: { src?: string; alt: string }
}[] = [
  {
    tag: 'The products',
    title: 'Ten-Q Beauty',
    description: '107 scalp-first formulas for women, men and kids — made with African botanicals.',
    cta: { label: 'Shop the collection', href: '/shop' },
    image: { src: '/images/tenq2.png', alt: 'The Ten-Q Beauty haircare range among fresh botanicals' },
  },
  {
    tag: 'Ibadan',
    title: 'Onidiri Natural Hair Salon',
    description: 'Professional natural hair care, treatment and styling, focused on textured hair.',
    cta: { label: 'Book a visit', href: '/contact' },
    image: { alt: 'A client relaxing during a wash at Onidiri Natural Hair Salon' },
  },
  {
    tag: 'Education',
    title: 'Ten-Q Formulation School',
    description: 'Training and mentorship for aspiring formulators and beauty entrepreneurs.',
    cta: { label: 'Learn more', href: '/contact' },
    image: { alt: 'Shelves of labelled botanical ingredients at the Ten-Q Formulation School' },
  },
]

/* ---------- Section ---------- */

/** "The Ten-Q family" — products, salon and school as three image cards. */
export function TenQFamily() {
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
        .from('[data-intro]', { opacity: 0, y: 16, duration: 0.8 }, '-=0.6')
        // Each card's photo wipes up while drifting back to scale, then its copy follows
        .fromTo(
          '[data-card-img]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: 0.15, ease: 'power3.inOut' },
          '-=0.5',
        )
        .from('[data-card-zoom]', { scale: 1.15, duration: 1.6, stagger: 0.15 }, '<')
        .from('[data-card-tag]', { opacity: 0, y: -8, duration: 0.5, stagger: 0.15 }, '-=0.9')
        .from('[data-card-body]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.15 }, '<0.1')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="family-title" className="bg-white py-20 md:py-28 lg:py-[110px]">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              data-eyebrow
              className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-olive uppercase md:text-xs"
            >
              <span aria-hidden className="size-1 rounded-full bg-olive" />
              The Ten-Q family
            </p>
            <h2
              id="family-title"
              data-title
              className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px] lg:whitespace-nowrap"
            >
              One philosophy, three homes
            </h2>
          </div>
          <p data-intro className="max-w-[24rem] text-base leading-relaxed md:shrink-0 text-[#6B6C5A] md:text-right">
            Products, professional care and education — all built on scalp-first, intentional haircare.
          </p>
        </div>

        {/* Cards */}
        <ul className="mt-12 grid gap-12 md:grid-cols-3 md:gap-5 lg:mt-14">
          {homes.map((h) => (
            <li key={h.title} className="group">
              <div data-card-img className="relative aspect-[4/3] overflow-hidden bg-[#ECEBE4] md:aspect-[24/25]">
                <div
                  data-card-zoom
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                >
                  {h.image.src ? (
                    <Image
                      src={h.image.src}
                      alt={h.image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-[11px] font-semibold tracking-[0.16em] text-[#6B6C5A] uppercase">
                      {h.title} photo
                    </div>
                  )}
                </div>
                <span
                  data-card-tag
                  className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#24260F] uppercase"
                >
                  {h.tag}
                </span>
              </div>

              <div data-card-body className="mt-5">
                <h3 className="text-base font-semibold tracking-[0.08em] text-[#24260F] uppercase">{h.title}</h3>
                <p className="mt-4 max-w-[26rem] text-[15px] leading-[1.6] text-[#6B6C5A]">{h.description}</p>
                <Link
                  href={h.cta.href}
                  className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-olive uppercase"
                >
                  {h.cta.label}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
