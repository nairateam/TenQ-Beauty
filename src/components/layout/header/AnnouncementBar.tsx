import { Fragment } from 'react'

/** How many times the messages repeat in each half of the track, so it's wider than any screen */
const REPEAT = 4

/**
 * The olive strip above the header. Its messages (from Store settings) scroll right to left in a
 * seamless loop: the track holds two identical halves and slides by exactly one half.
 * It stops on hover, and stays still for anyone who prefers reduced motion.
 */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  if (!messages.length) return null

  const half = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: REPEAT }, (_, r) =>
        messages.map((text, i) => (
          <Fragment key={`${r}-${i}`}>
            <span className="px-6 whitespace-nowrap">{text}</span>
            <span aria-hidden className="size-1 shrink-0 rounded-full bg-white/70" />
          </Fragment>
        )),
      )}
    </div>
  )

  return (
    <div className="bg-olive group relative flex h-(--announce-height) items-center overflow-hidden text-[10px] font-semibold tracking-[0.18em] text-white uppercase md:text-[11px]">
      {/* Screen readers get each message once, without the scrolling copies */}
      <p className="sr-only">{messages.join(' · ')}</p>
      <div
        aria-hidden
        className="animate-marquee flex w-max group-hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {half}
        {half}
      </div>
    </div>
  )
}
