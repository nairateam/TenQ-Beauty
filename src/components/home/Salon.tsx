'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, type ReactNode } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'

/* ---------- Content (edit here) ---------- */

const image = {
  // Placeholder until the salon wash-basin shot is added to /public
  src: '/images/sec-a.png',
  alt: 'A client relaxing at the wash basin while her natural hair is shampooed at the Ten-Q salon',
}

const services: { title: string; text: string; href: string; icon: ReactNode }[] = [
  {
    title: 'Scalp detox treatment',
    text: 'For dandruff, itch and build-up',
    href: '/salon#scalp-detox',
    icon: <DropIcon />,
  },
  {
    title: 'Growth & edges therapy',
    text: 'Targeted care for thinning areas',
    href: '/salon#growth-therapy',
    icon: <SproutIcon />,
  },
  {
    title: 'Natural styling & loc care',
    text: 'Wash days, twists and retwists',
    href: '/salon#styling',
    icon: <ScissorsIcon />,
  },
]

const bookHref = '/salon#book'
const directionsHref = 'https://maps.google.com/?q=Ten-Q+Salon'

/* ---------- Section ---------- */

/** "Visit us" — full-bleed salon photo with a services card floating on the right. */
export function Salon() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('[data-title]', { type: 'lines', mask: 'lines' })

      // Curtain reveal: while the Testimonials band scrolls off the top, hold the content still
      // (counter-translate by the distance left to travel) so it looks like it was underneath all along
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(
          '[data-curtain]',
          { y: () => -window.innerHeight },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      // Slow drift on the photo while the section scrolls by
      gsap.fromTo(
        '[data-img]',
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 55%', once: true },
          defaults: { ease: 'power3.out' },
        })
        .from('[data-img-zoom]', { scale: 1.15, duration: 1.8 })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 }, 0.3)
        .from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.3')
        .from('[data-sub]', { opacity: 0, y: 12, duration: 0.7 }, '-=0.6')
        .from('[data-card]', { opacity: 0, y: 40, duration: 1 }, 0.4)
        .from('[data-card-part]', { opacity: 0, y: 14, duration: 0.6, stagger: 0.07 }, '-=0.6')

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    // overflow-hidden: the curtain starts a screen higher than the section, so it must only
    // show inside it — otherwise on tall screens it peeks out above Testimonials
    <section
      ref={root}
      aria-labelledby="salon-title"
      className="relative z-0 overflow-hidden bg-[#24260F]"
    >
      <div data-curtain className="relative lg:min-h-[max(47.5rem,100svh)]">
        {/* Photo — fills the section on desktop, a banner above the card on phones */}
        <div className="relative h-[34rem] overflow-hidden sm:h-[38rem] lg:absolute lg:inset-0 lg:h-auto">
          <div data-img className="absolute inset-x-0 -inset-y-[6%]">
            <div data-img-zoom className="absolute inset-0">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                className="object-cover object-[60%_center]"
              />
            </div>
          </div>

          {/* Shade under the headline */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#14150a]/85 via-[#14150a]/25 via-45% to-transparent lg:bg-gradient-to-tr lg:via-30%"
          />

          <div className="absolute inset-x-0 bottom-0 px-4 pb-10 text-white md:px-8 lg:px-14 lg:pb-14">
            <p
              data-eyebrow
              className="mb-4 flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-[#C9D27A] uppercase"
            >
              <span aria-hidden className="size-1 rounded-full bg-[#C9D27A]" />
              The Ten-Q salon
            </p>
            <p
              data-title
              className="font-heading max-w-[40rem] text-4xl leading-[1.05] tracking-[0.02em] uppercase md:text-6xl"
            >
              <span className="block">Healthy hair,</span>
              <span className="block">happier you.</span>
            </p>
            <p data-sub className="mt-5 text-[15px] text-white/85">
              Treatments, styling and loc care with Ten-Q formulas.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="relative px-4 py-10 md:px-8 lg:absolute lg:inset-y-0 lg:right-14 lg:flex lg:items-center lg:p-0">
          <div data-card className="bg-white px-6 py-9 md:px-9 lg:w-[22.5rem] xl:w-[25rem]">
            <p
              data-card-part
              className="text-olive flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase"
            >
              <span aria-hidden className="bg-olive size-1 rounded-full" />
              Visit us
            </p>
            <h2
              id="salon-title"
              data-card-part
              className="mt-4 text-2xl leading-[1.2] font-normal tracking-[0.02em] text-[#24260F] uppercase md:text-[28px]"
            >
              Experience Ten-Q in person
            </h2>
            <p data-card-part className="mt-4 text-[15px] leading-relaxed text-[#6B6C5A]">
              Professional natural hair care, treatment and styling in a clean, beautiful space —
              using the same formulas you love at home.
            </p>

            <ul className="mt-8 border-t border-[#E6E5DA]">
              {services.map((s) => (
                <li key={s.title} data-card-part className="border-b border-[#E6E5DA]">
                  <Link href={s.href} className="group flex items-center gap-4 py-4">
                    <span className="text-olive grid size-9 shrink-0 place-items-center rounded-full bg-[#F1F0E6]">
                      {s.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-[#24260F]">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-[#6B6C5A]">{s.text}</span>
                    </span>
                    <ChevronIcon />
                  </Link>
                </li>
              ))}
            </ul>

            <p
              data-card-part
              className="mt-8 flex items-start gap-3 bg-[#F4F3EA] px-4 py-3 text-[13px] leading-snug text-[#3A3C24]"
            >
              <PhoneIcon />
              Walk-ins welcome — we recommend calling ahead.
            </p>

            <div data-card-part>
              <Link
                href={bookHref}
                className="group hover:bg-olive mt-4 flex items-center justify-between bg-[#24260F] px-5 py-4 text-xs font-semibold tracking-[0.16em] text-white uppercase transition-colors"
              >
                Book a visit
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:text-olive mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#24260F] uppercase"
              >
                Get directions
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Icons ---------- */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function DropIcon() {
  return (
    <svg {...iconProps} className="size-4">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  )
}

function SproutIcon() {
  return (
    <svg {...iconProps} className="size-4">
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6Z" />
      <path d="M12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" />
    </svg>
  )
}

function ScissorsIcon() {
  return (
    <svg {...iconProps} className="size-4">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8 7.5 20 18M8 16.5 20 6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg {...iconProps} className="text-olive mt-0.5 size-4 shrink-0">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      {...iconProps}
      className="size-4 shrink-0 text-[#24260F]/60 transition-transform duration-300 group-hover:translate-x-0.5"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
