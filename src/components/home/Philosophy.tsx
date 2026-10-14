'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, type CSSProperties } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

import { bannerImage, SystemBanner } from './SystemBanner'

/*
 * Diagram is drawn in a fixed 1100 × 480 coordinate space (same as the design file)
 * and scales with the container. `pct` converts design pixels to percentages so the
 * HTML labels stay locked to the SVG lines at any width.
 */
const W = 1100
const H = 480
const pctX = (x: number) => `${(x / W) * 100}%`
const pctY = (y: number) => `${(y / H) * 100}%`

const RING = { cx: 550, cy: 220, r: 184 }
const CIRCLE = { x: 390, y: 60, size: 320 }

/**
 * The circle shows the System Banner photo, framed on the Bloom serum.
 * Coordinates are in the banner image's own pixels (1672 × 941).
 */
const FOCUS = { x: 746, y: 565, bottleHeight: 422 }
/** How much of the circle's diameter the serum bottle fills at the start */
const BOTTLE_FILL = 0.74

type Branch = {
  title: string
  text: string
  /** Line drawn from the ring outward (design coordinates) */
  path: string
  dot: { x: number; y: number }
  label: { x: number; y: number; align: 'left' | 'right' }
}

const branches: Branch[] = [
  {
    title: 'Nourish',
    text: 'the scalp, where every strand begins',
    path: 'M366 220 L250 220',
    dot: { x: 247, y: 220 },
    label: { x: 10, y: 206, align: 'right' },
  },
  {
    title: 'Strengthen',
    text: 'each strand against breakage and stress',
    path: 'M686 85 L726 48 L800 48',
    dot: { x: 801, y: 48 },
    label: { x: 816, y: 34, align: 'left' },
  },
  {
    title: 'Retain',
    text: 'length, moisture and shine over time',
    path: 'M690 350 L730 390 L800 390',
    dot: { x: 801, y: 390 },
    label: { x: 816, y: 376, align: 'left' },
  },
]

/** Phones/tablets: a square crop of the same photo, centred on the serum */
const mobilePhoto = { src: '/philosophy/bloom-circle.webp', alt: 'Bloom Hair Growth Serum with the Ten-Q range behind it' }

/** Position of `el` relative to `ancestor`, ignoring CSS transforms (stable while animating). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== ancestor) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Desktop pin length, in % of the viewport height:
 * ZOOM for the circle → banner morph, then HOLD with the full banner pinned
 * while the next section (pulled up by the same 100vh in page.tsx) slides over it.
 */
const ZOOM = 220
const HOLD = 100

export function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section) return

      const split = SplitText.create('[data-statement]', { type: 'words', mask: 'words' })
      const mm = gsap.matchMedia()

      // Entrance (time-based): eyebrow + statement
      const intro = gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        })
        .from('[data-eyebrow]', { opacity: 0, y: 12, duration: 0.6 })
        .from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.04 }, '-=0.3')

      /* ---------------- Desktop: entrance + pinned circle → banner morph ---------------- */
      mm.add('(min-width: 1024px)', () => {
        const diagram = section.querySelector<HTMLElement>('[data-desktop]')!
        const slot = diagram.querySelector<HTMLElement>('[data-circle-slot]')!
        const morph = section.querySelector<HTMLElement>('[data-morph]')!
        const img = morph.querySelector<HTMLElement>('[data-banner-img]')!

        /**
         * All geometry in section pixels, measured without transforms.
         * Recomputed on resize thanks to invalidateOnRefresh.
         */
        const geo = () => {
          const w = section.offsetWidth
          const h = section.offsetHeight
          const pos = offsetWithin(slot, section)
          const r = slot.offsetWidth / 2
          const cx = pos.x + r
          const cy = pos.y + r

          // Where the serum sits when the banner is shown full-screen (object-cover maths)
          const cover = Math.max(w / bannerImage.desktop.width, h / bannerImage.desktop.height)
          const px = (w - bannerImage.desktop.width * cover) / 2 + FOCUS.x * cover
          const py = (h - bannerImage.desktop.height * cover) / 2 + FOCUS.y * cover

          // Start: serum fills the circle
          const s0 = (BOTTLE_FILL * 2 * r) / (FOCUS.bottleHeight * cover)

          return { w, h, cx, cy, r, px, py, s0 }
        }

        /** Image transform (origin top-left) that puts the serum at (x, y) with scale s */
        const imgAt = (s: number, x: number, y: number, g: ReturnType<typeof geo>) => ({
          scale: s,
          x: x - s * g.px,
          y: y - s * g.py,
        })

        const inset = (t: number, r: number, b: number, l: number, round: number) =>
          `inset(${t}px ${r}px ${b}px ${l}px round ${round}px)`

        // Frame 0 — the circle
        const startClip = () => {
          const g = geo()
          return inset(g.cy - g.r, g.w - (g.cx + g.r), g.h - (g.cy + g.r), g.cx - g.r, g.r)
        }
        // Frame ~35% — wider, softer rectangle, neighbours come into view
        const midClip = () => {
          const g = geo()
          const mw = g.w * 0.5
          const mh = g.h * 0.62
          const mx = lerp(g.cx, g.w / 2, 0.5)
          const my = lerp(g.cy, g.h / 2, 0.5)
          return inset(my - mh / 2, g.w - (mx + mw / 2), g.h - (my + mh / 2), mx - mw / 2, 48)
        }
        // Frame 100% — exactly the System Banner
        const endClip = () => inset(0, 0, 0, 0, 0)

        const zoom = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${ZOOM + HOLD}%`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onEnter: () => intro.progress(1), // finish the entrance if the user scrolled in fast
          },
        })

        zoom
          // Callouts, ring, heading and button step aside
          .to('[data-fade]', { opacity: 0, y: -24, duration: 0.25 }, 0)
          // 0 → 35%: circle widens and softens; photo starts pulling back
          .fromTo(morph, { clipPath: startClip }, { clipPath: midClip, duration: 0.35, ease: 'power1.inOut' }, 0)
          .fromTo(
            img,
            {
              transformOrigin: '0 0',
              scale: () => geo().s0,
              x: () => { const g = geo(); return imgAt(g.s0, g.cx, g.cy, g).x },
              y: () => { const g = geo(); return imgAt(g.s0, g.cx, g.cy, g).y },
            },
            {
              scale: () => lerp(geo().s0, 1, 0.45),
              x: () => { const g = geo(); const s = lerp(g.s0, 1, 0.45); return imgAt(s, lerp(g.cx, g.px, 0.45), lerp(g.cy, g.py, 0.45), g).x },
              y: () => { const g = geo(); const s = lerp(g.s0, 1, 0.45); return imgAt(s, lerp(g.cx, g.px, 0.45), lerp(g.cy, g.py, 0.45), g).y },
              duration: 0.35,
              ease: 'power1.inOut',
            },
            0,
          )
          // 35% → 100%: opens to full-screen, photo settles into the banner framing
          .to(morph, { clipPath: endClip, duration: 0.65, ease: 'power2.inOut' }, 0.35)
          .to(img, { scale: 1, x: 0, y: 0, duration: 0.65, ease: 'power2.inOut' }, 0.35)
          // Banner shading + copy land at the end
          .fromTo('[data-morph] [data-banner-shade]', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.7)
          .from('[data-morph] [data-banner-title]', { yPercent: 110, duration: 0.15, ease: 'power3.out' }, 0.85)
          .from('[data-morph] [data-banner-note]', { opacity: 0, y: 16, duration: 0.15, ease: 'power3.out' }, 0.9)

        // Hold: banner stays pinned at 100% while the next section covers it.
        // It drifts up a little and dims, so it reads as sinking behind.
        const hold = zoom.duration() * (HOLD / ZOOM)
        zoom
          .to(morph, { yPercent: -12, duration: hold }, '>')
          .to('[data-cover-dim]', { opacity: 0.55, duration: hold }, '<')

        // Entrance: ring draws 360°, photo appears inside it, then each branch one by one
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro.add(tl, '-=0.2')

        tl.fromTo('[data-desktop] [data-ring]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
          .fromTo(morph, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, '<0.4')

        gsap.utils.toArray<HTMLElement>('[data-branch]').forEach((branch, i) => {
          const fromX = branches[i].label.align === 'right' ? 16 : -16
          tl.fromTo(
            branch.querySelector('[data-line]'),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' },
            i === 0 ? '-=0.2' : '-=0.1',
          )
            .from(branch.querySelector('[data-dot]'), { scale: 0, duration: 0.35, ease: 'back.out(3)', svgOrigin: `${branches[i].dot.x} ${branches[i].dot.y}` }, '-=0.05')
            .from(`[data-label="${i}"]`, { opacity: 0, x: fromX, duration: 0.6 }, '<')
        })

        tl.from('[data-cta]', { opacity: 0, y: 16, duration: 0.6 })
      })

      /* ---------------- Mobile / tablet: entrance only (banner follows as its own section) ---------------- */
      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro.add(tl, '-=0.2')

        tl.fromTo('[data-mobile] [data-ring]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
          .from('[data-mobile] [data-photo]', { scale: 0.85, opacity: 0, duration: 1.2 }, '<0.4')
          .from('[data-mobile-item]', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15 }, '-=0.4')
          .from('[data-cta]', { opacity: 0, y: 16, duration: 0.6 })
      })

      return () => {
        mm.revert()
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <>
      <section
        ref={root}
        aria-labelledby="philosophy-title"
        className="relative overflow-hidden bg-cream px-5 py-24 md:py-32 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:py-10"
      >
        {/* Heading */}
        <div data-fade className="flex flex-col items-center gap-6 text-center">
          <p data-eyebrow className="flex items-center gap-2 text-xs font-semibold tracking-[0.17em] text-olive uppercase">
            <span aria-hidden className="size-1 rounded-full bg-olive" />
            Our philosophy
          </p>
          <h2
            id="philosophy-title"
            data-statement
            className="max-w-[24ch] text-[1.75rem] leading-[1.25] font-medium tracking-[0.01em] uppercase md:text-[2.5rem]"
          >
            Our formulas are designed as daily rituals for healthy hair
          </h2>
        </div>

        {/* Desktop diagram — sized to fit the viewport so the whole section can pin */}
        <div
          data-desktop
          className="@container relative mx-auto mt-10 hidden lg:block"
          style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, ${W}px, calc((100svh - 22rem) * ${W / H}))` }}
        >
          {/* Invisible slot: marks where the circle sits. The photo itself is the morphing banner below. */}
          <div
            data-circle-slot
            aria-hidden
            className="absolute aspect-square"
            style={{ left: pctX(CIRCLE.x), top: pctY(CIRCLE.y), width: pctX(CIRCLE.size) }}
          />

          <div data-fade className="absolute inset-0">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <Ring />
              {branches.map((b) => (
                <g key={b.title} data-branch>
                  <path
                    data-line
                    d={b.path}
                    pathLength={1}
                    strokeDasharray={1}
                    fill="none"
                    className="stroke-olive/70"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle data-dot cx={b.dot.x} cy={b.dot.y} r={3} className="fill-olive" />
                </g>
              ))}
            </svg>

            {branches.map((b, i) => (
              <div
                key={b.title}
                data-label={i}
                className={cn(
                  'absolute flex w-[20%] flex-col gap-[0.7cqw]',
                  b.label.align === 'right' ? 'items-end text-right' : 'items-start text-left',
                )}
                style={{ left: pctX(b.label.x), top: pctY(b.label.y) }}
              >
                {/* cqw = % of diagram width, so text scales with the diagram (2cqw = 22px at full size) */}
                <h3 className="text-[length:2cqw] font-semibold tracking-[0.05em] uppercase">{b.title}</h3>
                <p className="text-[length:1.455cqw] leading-[1.4] text-foreground/60">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / tablet layout */}
        <div data-mobile className="mx-auto mt-12 max-w-md lg:hidden">
          <div className="relative mx-auto aspect-square w-[78%]">
            <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <circle
                data-ring
                cx={200}
                cy={200}
                r={199}
                pathLength={1}
                strokeDasharray={1}
                fill="none"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="stroke-olive/70"
                transform="rotate(-90 200 200)"
              />
            </svg>
            <Photo className="absolute top-[6.5%] left-[6.5%] w-[87%]" />
          </div>

          <ul className="mt-12 flex flex-col gap-8 text-center">
            {branches.map((b) => (
              <li key={b.title} data-mobile-item className="flex flex-col items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-olive" />
                <h3 className="text-lg font-semibold tracking-[0.05em] uppercase">{b.title}</h3>
                <p className="max-w-[26ch] text-[15px] leading-[1.4] text-foreground/60">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div data-fade className="mt-16 flex justify-center lg:mt-10">
          <Link
            data-cta
            href="/about#ingredients"
            className="inline-block border border-foreground px-10 py-[18px] text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300 hover:bg-foreground hover:text-cream"
          >
            Explore our ingredients
          </Link>
        </div>

        {/* Desktop: ONE element that starts as the circle and becomes the System Banner */}
        <div data-morph className="invisible absolute inset-0 z-10 hidden lg:block">
          <SystemBanner variant="overlay" />
        </div>
        <div data-cover-dim aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden bg-black opacity-0 lg:block" />
      </section>

      {/* Phones/tablets: the banner is its own section and sticks while the next one scrolls over it */}
      <SystemBanner className="sticky top-0 lg:hidden" />
    </>
  )
}

/** Outer ring, drawn as a full circle starting at 12 o'clock. */
function Ring() {
  return (
    <circle
      data-ring
      cx={RING.cx}
      cy={RING.cy}
      r={RING.r}
      pathLength={1}
      strokeDasharray={1}
      fill="none"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      className="stroke-olive/70"
      transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
    />
  )
}

function Photo({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div data-photo className={cn('aspect-square overflow-hidden rounded-full', className)} style={style}>
      <Image src={mobilePhoto.src} alt={mobilePhoto.alt} fill sizes="70vw" className="object-cover" />
    </div>
  )
}