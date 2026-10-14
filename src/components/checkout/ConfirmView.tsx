'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/layout/header/Logo'
import { bag } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { toNaira } from '@/lib/pricing'
import { cn } from '@/lib/utils'

import { CHECKOUT_EMAIL_KEY } from './CheckoutView'

type Result =
  | { state: 'checking' }
  | { state: 'paid'; orderID: string; total: number; email: string }
  | { state: 'failed' }

const smallCaps = 'text-[11px] font-semibold tracking-[0.14em] uppercase'

/**
 * Where Paystack sends the shopper back to. Verifies the payment and creates the order
 * (Paystack's webhook does the same, so whichever arrives first wins and the other finds it).
 */
export function ConfirmView({ whatsappHref }: { whatsappHref: string | null }) {
  const params = useSearchParams()
  const reference = params.get('reference') ?? params.get('trxref') ?? ''
  const [result, setResult] = useState<Result>({ state: 'checking' })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let email = ''
    try {
      email = window.sessionStorage.getItem(CHECKOUT_EMAIL_KEY) ?? ''
    } catch {
      // Storage blocked: the server still matches the payment by its reference
    }
    if (!reference) return setResult({ state: 'failed' })
    bag
      .confirmPayment(reference, email)
      .then((order) => {
        try {
          window.sessionStorage.removeItem(CHECKOUT_EMAIL_KEY)
        } catch {}
        setResult({ state: 'paid', ...order })
      })
      .catch(() => setResult({ state: 'failed' }))
  }, [reference])

  return (
    <div className="flex min-h-dvh flex-col bg-white text-[#24260F]">
      <header className="flex h-16 items-center justify-center border-b border-[#DDDCD0] md:h-20">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div aria-live="polite" className="flex max-w-lg flex-col items-center gap-5 text-center">
          {result.state === 'checking' && (
            <>
              <span className="border-olive size-10 animate-spin rounded-full border-2 border-t-transparent" />
              <h1 className="text-2xl font-normal uppercase md:text-3xl">
                Confirming your payment
              </h1>
              <p className="text-[15px] text-[#6B6C5A]">
                This only takes a moment — please keep this page open.
              </p>
            </>
          )}

          {result.state === 'paid' && (
            <>
              <span className="bg-olive flex size-14 items-center justify-center rounded-full text-white">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <p className={cn(smallCaps, 'text-olive')}>
                Order #{result.orderID.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-3xl font-normal uppercase md:text-4xl">
                Thank you for your order
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6B6C5A]">
                We’ve received your payment of{' '}
                <span className="text-[#24260F]">{formatPrice(toNaira(result.total))}</span>. We’ll
                be in touch
                {result.email && (
                  <>
                    {' '}
                    at <span className="text-[#24260F]">{result.email}</span>
                  </>
                )}{' '}
                when it ships.
              </p>
              <Link
                href="/shop"
                className={cn(
                  smallCaps,
                  'hover:bg-olive mt-2 bg-[#24260F] px-8 py-4 text-white transition-colors',
                )}
              >
                Continue shopping
              </Link>
            </>
          )}

          {result.state === 'failed' && (
            <>
              <h1 className="text-2xl font-normal uppercase md:text-3xl">
                We couldn’t confirm your payment
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6B6C5A]">
                If you completed the payment, don’t pay again — your order is recorded as soon as
                Paystack confirms it. Otherwise, your bag is saved and you can try again.
                {reference && (
                  <>
                    {' '}
                    Payment reference: <span className="text-[#24260F]">{reference}</span>
                  </>
                )}
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/checkout"
                  className={cn(
                    smallCaps,
                    'hover:bg-olive bg-[#24260F] px-8 py-4 text-white transition-colors',
                  )}
                >
                  Back to checkout
                </Link>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      smallCaps,
                      'border border-[#24260F] px-8 py-4 transition-colors hover:bg-[#24260F] hover:text-white',
                    )}
                  >
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
