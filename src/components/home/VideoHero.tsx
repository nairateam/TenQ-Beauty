'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const media = {
  desktop: { video: '/videos/tenq-hero.webm', poster: '/images/hero_fallback.webp', width: 1920, height: 1080 },
  mobile: { video: '/videos/tenq-hero.webm', poster: '/images/hero_fallback.webp', width: 720, height: 960 },
}

const DESKTOP_QUERY = '(min-width: 768px)'


export function VideoHero() {
  const root = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  // Choose the right file, then autoplay while the hero is on screen
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (reduced || saveData) return // poster only

    const desktop = window.matchMedia(DESKTOP_QUERY)
    const load = () => {
      video.src = desktop.matches ? media.desktop.video : media.mobile.video
      video.load()
    }
    load()
    desktop.addEventListener('change', load)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {}) // autoplay can be blocked; poster stays
        else video.pause()
      },
      { threshold: 0.1 },
    )
    observer.observe(video)

    return () => {
      desktop.removeEventListener('change', load)
      observer.disconnect()
    }
  }, [])

  // Headline entrance + gentle parallax as you scroll past
  useGSAP(
    () => {
      const split = SplitText.create('[data-hero-title]', { type: 'words', mask: 'words' })

      gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 })
        .from(split.words, { yPercent: 110, duration: 0.7, stagger: 0.12 })
        .from('[data-hero-sub]', { opacity: 0, y: 24, duration: 1 }, '-=0.7')

      gsap.to('[data-hero-media]', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('[data-hero-copy]', {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '60% top', scrub: true },
      })

      // Tweens and ScrollTriggers are cleaned up automatically by useGSAP
      return () => split.revert()
    },
    { scope: root },
  )

  const { props: posterDesktop } = getImageProps({ src: media.desktop.poster, alt: '', width: media.desktop.width, height: media.desktop.height, sizes: '100vw', priority: true })
  const { props: posterMobile } = getImageProps({ src: media.mobile.poster, alt: '', width: media.mobile.width, height: media.mobile.height, sizes: '100vw', priority: true })

  return (
    <section ref={root} className="relative h-svh min-h-[36rem] overflow-hidden bg-neutral-900">
      {/* Media (poster underneath, video on top) */}
      <div data-hero-media aria-hidden className="absolute inset-0 will-change-transform">
        <picture>
          <source media={DESKTOP_QUERY} srcSet={posterDesktop.srcSet} />
          <source srcSet={posterMobile.srcSet} />
          <img {...posterDesktop} alt="" className="absolute inset-0 size-full object-cover object-top" />
        </picture>

        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-1000',
            playing ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      {/* Darken the lower part so white text reads on any frame */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Copy */}
      <div
        data-hero-copy
        className="relative flex h-full flex-col items-center justify-end px-5 pb-[12svh] text-center text-white"
      >
        <h1
          data-hero-title
          className="text-[2.75rem] leading-none font-semibold tracking-tight uppercase md:text-7xl lg:text-[5.5rem]"
        >
          Rooted in nature
        </h1>
        <p data-hero-sub className="mt-5 max-w-[22ch] text-lg leading-[1.15] md:text-3xl lg:text-4xl">
          made for every curl, coil and crown
        </p>
      </div>
    </section>
  )
}