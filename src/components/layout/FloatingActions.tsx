'use client'

import { usePathname } from 'next/navigation'

import { BackToTop } from './BackToTop'

/** WhatsApp glyph (Simple Icons) */
const whatsappPath =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'

/** Bottom-right stack: back to top above, WhatsApp support below. */
export function FloatingActions({ whatsappHref }: { whatsappHref: string | null }) {
  const pathname = usePathname()

  // Checkout has its own pared-back layout (and its own WhatsApp help)
  if (pathname.startsWith('/checkout')) return null

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-center gap-3 md:right-8 md:bottom-8">
      <BackToTop />
      {whatsappHref && <WhatsAppButton href={whatsappHref} />}
    </div>
  )
}

function WhatsAppButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens WhatsApp)"
      className="group relative flex size-14 items-center justify-center rounded-full bg-[#24260F] text-white shadow-[0_10px_30px_rgba(36,38,15,0.28)] transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#1c1e0b]"
    >
      {/* A soft pulse when it first appears, then still */}
      <span
        aria-hidden
        style={{ animationIterationCount: 3, animationDuration: '2s', animationDelay: '1.5s' }}
        className="absolute inset-0 rounded-full border border-[#24260F]/40 motion-safe:animate-ping"
      />

      {/* Thin inner ring for a finished edge */}
      <span aria-hidden className="absolute inset-[3px] rounded-full border border-white/10" />

      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="relative size-6">
        <path d={whatsappPath} />
      </svg>

      {/* "Online" dot */}
      <span
        aria-hidden
        className="absolute top-0.5 right-0.5 size-3 rounded-full border-2 border-white bg-[#25D366]"
      />

      {/* Label slides out on hover / keyboard focus (pointer devices only) */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full mr-3 hidden translate-x-2 items-center gap-2 bg-white px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-[#24260F] uppercase opacity-0 shadow-[0_8px_24px_rgba(36,38,15,0.14)] transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:flex"
      >
        <span className="size-1.5 rounded-full bg-[#25D366]" />
        Chat with us
      </span>
    </a>
  )
}
