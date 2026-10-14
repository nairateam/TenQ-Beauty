import { getImageProps } from 'next/image'

import { cn } from '@/lib/utils'

// Exported so Philosophy can do the framing maths
export const bannerImage = {
  desktop: { src: '/banner/tenq-system.webp', width: 1672, height: 941 },
  mobile: { src: '/banner/tenq-system.webp', width: 706, height: 941 },
  alt: 'The Ten-Q natural hair care range arranged on stone plinths with fresh botanicals',
}

type SystemBannerProps = {
  /**
   * `overlay` — fills its parent (used inside the pinned Philosophy zoom on desktop).
   * `section` — a normal full-height section (used on phones/tablets).
   */
  variant?: 'overlay' | 'section'
  className?: string
}

/** "The Healthy Hair System" full-bleed banner. */
export function SystemBanner({ variant = 'section', className }: SystemBannerProps) {
  const common = { alt: bannerImage.alt, sizes: '100vw' }
  const { props: desktop } = getImageProps({ ...common, ...bannerImage.desktop })
  const { props: mobile } = getImageProps({ ...common, ...bannerImage.mobile })

  return (
    <div
      data-banner
      className={cn(
        'overflow-hidden bg-[#1c1e0a] text-white',
        variant === 'overlay' ? 'absolute inset-0' : 'relative h-svh min-h-[34rem]',
        className,
      )}
    >
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} />
        <source srcSet={mobile.srcSet} />
        <img data-banner-img {...desktop} alt={bannerImage.alt} className="absolute inset-0 size-full object-cover" />
      </picture>

      {/* Darken the bottom for the headline */}
      <div data-banner-shade aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-[#1c1e0a]/70" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-10 md:flex-row md:items-end md:justify-center md:px-16 md:pb-14">
        <h2 className="overflow-hidden text-[2.5rem] leading-[1.05] font-normal tracking-[-0.01em] uppercase md:text-6xl lg:text-[4.75rem]">
          <span data-banner-title className="block">
            The healthy hair system
          </span>
        </h2>
        {/* <p data-banner-note className="text-base leading-[1.4] text-white/90 md:text-right md:text-lg">
          Every formula, one routine —
          <br />
          built around African botanicals.
        </p> */}
      </div>
    </div>
  )
}