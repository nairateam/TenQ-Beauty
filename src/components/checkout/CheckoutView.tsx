'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from 'react'

import { Logo } from '@/components/layout/header/Logo'
import { PaymentError, useBag, type Bag } from '@/lib/cart'
import { countries, nigerianStates } from '@/lib/countries'
import { formatPrice } from '@/lib/format'
import { gsap, useGSAP } from '@/lib/gsap'
import { shipsTo } from '@/lib/pricing'
import type { CheckoutSettings, ShippingOption } from '@/lib/queries/shop'
import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

const steps = ['Bag', 'Details', 'Delivery', 'Payment']
/** Index of the step this page covers */
const currentStep = 1

/** Remembered across the Paystack redirect so the confirm page can finish the order */
export const CHECKOUT_EMAIL_KEY = 'tenq-checkout-email'

const countryOptions = countries.map((c) => ({ label: c.label, value: c.value }))

const footerLinks = [
  { label: 'Return Policy', href: '/returns' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

/* ---------- Icons (Lucide) ---------- */

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
    >
      {children}
    </svg>
  )
}

const icons = {
  arrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  card: (
    <>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  landmark: (
    <>
      <path d="M10 18v-7" />
      <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
      <path d="M14 18v-7" />
      <path d="M18 18v-7" />
      <path d="M3 22h18" />
      <path d="M6 18v-7" />
    </>
  ),
  phone: (
    <>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </>
  ),
  external: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
}

const smallCaps = 'text-[11px] font-semibold tracking-[0.14em] uppercase'
const inputClass =
  'h-[52px] w-full border border-[#DDDCD0] bg-white px-4 text-[15px] text-[#24260F] outline-none transition-colors placeholder:text-[#9A9B8A] focus:border-[#24260F] focus:shadow-[inset_0_0_0_0.5px_#24260F]'

/* ---------- Page ---------- */

type Details = {
  email: string
  phone: string
  marketing: boolean
  firstName: string
  lastName: string
  street: string
  apartment: string
  city: string
  state: string
  country: string
}

const blankDetails: Details = {
  email: '',
  phone: '',
  marketing: false,
  firstName: '',
  lastName: '',
  street: '',
  apartment: '',
  city: '',
  state: 'Lagos',
  country: 'NG',
}

/** Contact, address, delivery and payment beside the order summary. */
export function CheckoutView({
  shippingOptions,
  settings,
}: {
  shippingOptions: ShippingOption[]
  settings: CheckoutSettings
}) {
  const root = useRef<HTMLDivElement>(null)
  const bag = useBag()
  const { ready } = bag
  const [details, setDetails] = useState(blankDetails)
  const [chosen, setChosen] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Methods that deliver to the address; the shopper's pick holds while it still applies
  const address = { country: details.country, state: details.state }
  const available = shippingOptions.filter((m) => shipsTo(m, address))
  const delivery = available.find((m) => m.id === chosen) ?? available[0]
  const total = bag.total + (delivery?.price ?? 0)

  const update = <K extends keyof Details>(key: K, value: Details[K]) => {
    setError(null)
    setDetails((d) => ({ ...d, [key]: value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!delivery)
      return setError('We don’t deliver to this address yet — chat with us on WhatsApp.')
    setPaying(true)
    setError(null)
    try {
      // The server prices the bag again and opens a Paystack payment for the exact amount
      const paymentPage = await bag.startPayment({
        customerEmail: details.email.trim(),
        phone: details.phone.trim(),
        marketingOptIn: details.marketing,
        shippingMethod: delivery.id,
        shippingAddress: {
          firstName: details.firstName,
          lastName: details.lastName,
          addressLine1: details.street,
          addressLine2: details.apartment,
          city: details.city,
          state: details.state,
          country: details.country,
          phone: details.phone,
        },
      })
      try {
        window.sessionStorage.setItem(CHECKOUT_EMAIL_KEY, details.email.trim())
      } catch {
        // Storage blocked: the confirm page can't finish the order, but Paystack's webhook still does
      }
      window.location.assign(paymentPage)
    } catch (err) {
      setPaying(false)
      const reason = err instanceof PaymentError ? err.reason : 'failed'
      setError(
        reason === 'out-of-stock'
          ? 'Something in your bag has just sold out. Go back to your bag to update it.'
          : reason === 'unavailable'
            ? 'Something in your bag is no longer for sale. Go back to your bag to update it.'
            : 'We couldn’t start the payment. Please check your details and try again.',
      )
    }
  }

  useGSAP(
    () => {
      if (!ready) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        .from('[data-reveal]', { opacity: 0, y: 16, duration: 0.8, stagger: 0.07 })
        .from('[data-summary]', { opacity: 0, duration: 0.8 }, 0)
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <div ref={root} className="flex min-h-dvh flex-col bg-white text-[#24260F]">
      {/* Header */}
      <header className="grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-[#DDDCD0] px-4 md:h-20 md:px-8 lg:px-16">
        <Link
          href="/cart"
          className={cn(smallCaps, 'group flex items-center gap-2 justify-self-start')}
        >
          <Icon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5">
            {icons.arrowLeft}
          </Icon>
          <span className="hidden sm:inline">Back to bag</span>
          <span className="sm:hidden">Bag</span>
        </Link>
        <Logo />
        <p className={cn(smallCaps, 'flex items-center gap-2 justify-self-end text-[#6B6C5A]')}>
          <Icon className="text-olive size-3.5">{icons.lock}</Icon>
          <span className="hidden sm:inline">Secure checkout</span>
          <span className="sr-only sm:hidden">Secure checkout</span>
        </p>
      </header>

      <main className="flex-1">
        {!ready ? (
          <div className="min-h-[60vh]" />
        ) : bag.items.length === 0 ? (
          <EmptyBag />
        ) : (
          <div className="mx-auto grid max-w-[90rem] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]">
            <OrderSummary
              bag={bag}
              delivery={delivery}
              total={total}
              whatsappHref={settings.whatsappHref}
            />

            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-11 px-4 pt-10 pb-20 md:px-8 md:pt-12 lg:px-10 lg:pb-24 xl:pr-[72px] xl:pl-16"
            >
              <h1 className="sr-only">Checkout</h1>
              <Steps />

              {/* 01 Contact */}
              <Section
                no="01"
                title="Contact"
                aside={
                  <p className="text-sm text-[#6B6C5A]">
                    Have an account?{' '}
                    <Link
                      href="/account"
                      className="text-[#24260F] underline underline-offset-4 hover:no-underline"
                    >
                      Log in
                    </Link>
                  </p>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={details.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+234"
                    required
                    value={details.phone}
                    onChange={(e) => update('phone', e.target.value)}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={details.marketing}
                    onChange={(e) => update('marketing', e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="peer-checked:bg-olive peer-checked:border-olive flex size-[18px] shrink-0 items-center justify-center border border-[#DDDCD0] bg-white text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#24260F]"
                  >
                    {details.marketing && (
                      <Icon className="size-3 stroke-[2.5]">{icons.check}</Icon>
                    )}
                  </span>
                  Email me hair tips, new launches and offers
                </label>
              </Section>

              {/* 02 Address */}
              <Section no="02" title="Delivery address">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="First name"
                    autoComplete="given-name"
                    required
                    value={details.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                  />
                  <Field
                    label="Last name"
                    autoComplete="family-name"
                    required
                    value={details.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                  />
                </div>
                <Field
                  label="Street address"
                  autoComplete="address-line1"
                  required
                  value={details.street}
                  onChange={(e) => update('street', e.target.value)}
                />
                <Field
                  label="Apartment, suite, landmark (optional)"
                  autoComplete="address-line2"
                  placeholder="e.g. Near Lekki Phase 1 roundabout"
                  value={details.apartment}
                  onChange={(e) => update('apartment', e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label="City"
                    autoComplete="address-level2"
                    required
                    value={details.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                  {details.country === 'NG' ? (
                    <Select
                      label="State"
                      autoComplete="address-level1"
                      options={nigerianStates}
                      value={details.state}
                      onChange={(e) => update('state', e.target.value)}
                    />
                  ) : (
                    <Field
                      label="State / region"
                      autoComplete="address-level1"
                      value={details.state}
                      onChange={(e) => update('state', e.target.value)}
                    />
                  )}
                  <Select
                    label="Country"
                    autoComplete="country-name"
                    options={countryOptions}
                    value={details.country}
                    onChange={(e) => {
                      const country = e.target.value
                      // Swap between the Nigerian state list and a free-text region
                      setError(null)
                      setDetails((d) => ({ ...d, country, state: country === 'NG' ? 'Lagos' : '' }))
                    }}
                  />
                </div>
              </Section>

              {/* 03 Delivery method */}
              <Section no="03" title="Delivery method">
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">Delivery method</legend>
                  {shippingOptions.map((m) => {
                    const ships = available.includes(m)
                    return (
                      <Option
                        key={m.id}
                        name="delivery"
                        checked={m.id === delivery?.id}
                        disabled={!ships}
                        onChange={() => {
                          setChosen(m.id)
                          setError(null)
                        }}
                        title={m.title}
                        note={ships ? m.note : 'Not available for this address'}
                        end={
                          <span className="text-[15px] font-semibold">
                            {m.price === null ? 'Quote' : formatPrice(m.price)}
                          </span>
                        }
                      />
                    )
                  })}
                </fieldset>
              </Section>

              {/* 04 Payment */}
              <Section no="04" title="Payment">
                <div className="border-[1.5px] border-[#24260F]">
                  <Option
                    name="payment"
                    checked
                    onChange={() => {}}
                    title="Pay with Paystack"
                    note="Card, bank transfer or USSD"
                    bare
                    end={
                      <span className="hidden gap-1.5 sm:flex">
                        {(
                          [
                            ['Card', icons.card],
                            ['Transfer', icons.landmark],
                            ['USSD', icons.phone],
                          ] as const
                        ).map(([label, icon]) => (
                          <span
                            key={label}
                            className="flex items-center gap-1.5 border border-[#DDDCD0] bg-white px-2.5 py-1.5 text-xs"
                          >
                            <Icon className="size-3.5">{icon}</Icon>
                            {label}
                          </span>
                        ))}
                      </span>
                    }
                  />
                  <p className="flex items-center gap-3.5 border-t border-[#DDDCD0] px-5 py-[18px] text-sm leading-[1.5] text-[#6B6C5A]">
                    <Icon className="text-olive size-[18px]">{icons.external}</Icon>
                    {settings.checkoutPaymentNote}
                  </p>
                </div>
              </Section>

              <div data-reveal className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={paying || bag.isLoading || !delivery}
                  className="group flex w-full items-center justify-between bg-[#24260F] px-7 py-[22px] text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.1em] uppercase">
                    <Icon>{icons.lock}</Icon>
                    {paying ? 'Opening Paystack…' : `Pay ${formatPrice(total)}`}
                  </span>
                  <Icon className="size-[18px] transition-transform duration-300 group-hover:translate-x-1">
                    {icons.arrowRight}
                  </Icon>
                </button>
                {error && (
                  <p
                    role="alert"
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-[#9B3B2A] bg-[#FBF3F1] px-5 py-4 text-sm leading-[1.5] text-[#9B3B2A]"
                  >
                    <Icon className="size-[18px]">{icons.alert}</Icon>
                    {error}
                    {settings.whatsappHref && (
                      <a
                        href={settings.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline underline-offset-4"
                      >
                        Chat on WhatsApp
                      </a>
                    )}
                  </p>
                )}
                {delivery?.price === null && (
                  <p className="text-[13px] text-[#6B6C5A]">
                    Delivery isn’t included above — we’ll email you a quote before your order ships.
                  </p>
                )}
                <p className="text-[13px] text-[#6B6C5A]">
                  By placing your order you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-[#24260F]">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/returns"
                    className="underline underline-offset-4 hover:text-[#24260F]"
                  >
                    Return Policy
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-3 border-t border-[#DDDCD0] px-4 py-6 text-[13px] text-[#6B6C5A] sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-16">
        <p>© {new Date().getFullYear()} Ten-Q Beauty</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-[#24260F]">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  )
}

/* ---------- Pieces ---------- */

function Steps() {
  return (
    <ol data-reveal className="flex flex-wrap items-center gap-3">
      {steps.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <li key={step} className="flex items-center gap-3">
            {i > 0 && (
              <span
                aria-hidden
                className={cn('h-px w-6 xl:w-10', i <= currentStep ? 'bg-olive' : 'bg-[#DDDCD0]')}
              />
            )}
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                smallCaps,
                'flex items-center gap-2 tracking-[0.11em]',
                !done && !active && 'text-[#6B6C5A]',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums',
                  done || active ? 'bg-olive text-white' : 'border border-[#DDDCD0]',
                )}
              >
                {done ? <Icon className="size-3.5 stroke-[2.5]">{icons.check}</Icon> : i + 1}
              </span>
              <span className={cn(i !== currentStep && 'max-sm:sr-only')}>{step}</span>
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Section({
  no,
  title,
  aside,
  children,
}: {
  no: string
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  return (
    <section data-reveal aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 id={id} className="flex items-center gap-3">
          <span className="text-olive text-[13px] font-medium tabular-nums">{no}</span>
          <span className="text-lg font-semibold tracking-[0.05em] uppercase md:text-xl">
            {title}
          </span>
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Field({ label, className, ...props }: { label: string } & ComponentProps<'input'>) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn(smallCaps, 'tracking-[0.12em] text-[#6B6C5A]')}>
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  )
}

function Select({
  label,
  options,
  ...props
}: {
  label: string
  options: (string | { label: string; value: string })[]
} & ComponentProps<'select'>) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={cn(smallCaps, 'tracking-[0.12em] text-[#6B6C5A]')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={cn(inputClass, 'cursor-pointer appearance-none pr-10')}
          {...props}
        >
          {options.map((o) =>
            typeof o === 'string' ? (
              <option key={o}>{o}</option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
        <Icon className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#6B6C5A]">
          {icons.chevronDown}
        </Icon>
      </div>
    </div>
  )
}

/** A radio drawn as a selectable row. `bare` drops the row's own border, for use inside a box. */
function Option({
  name,
  checked,
  onChange,
  title,
  note,
  end,
  bare,
  disabled,
}: {
  name: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  title: string
  note: string
  end: ReactNode
  bare?: boolean
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 px-5 py-[18px] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#24260F]',
        checked ? 'bg-[#F6F5EF]' : 'bg-white hover:bg-[#FBFAF6]',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-white',
        !bare && (checked ? 'border-[1.5px] border-[#24260F]' : 'border border-[#DDDCD0]'),
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'size-5 shrink-0 rounded-full transition-[border] duration-200',
          checked ? 'border-olive border-[6px] bg-white' : 'border-[1.5px] border-[#DDDCD0]',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-semibold">{title}</span>
        <span className="text-sm text-[#6B6C5A]">{note}</span>
      </span>
      {end}
    </label>
  )
}

function OrderSummary({
  bag,
  delivery,
  total,
  whatsappHref,
}: {
  bag: Bag
  delivery?: ShippingOption
  total: number
  whatsappHref: string | null
}) {
  // Folded away on small screens so the form comes first; always open on desktop
  const [open, setOpen] = useState(false)
  const { items, count, subtotal, promo, discount } = bag

  return (
    <aside
      data-summary
      aria-label="Order summary"
      className="border-b border-[#DDDCD0] bg-[#F6F5EF] lg:order-last lg:border-b-0 lg:border-l"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="order-summary"
        className="flex w-full items-center justify-between gap-4 px-4 py-4 md:px-8 lg:hidden"
      >
        <span className={cn(smallCaps, 'flex items-center gap-2')}>
          <Icon className="text-olive">{icons.bag}</Icon>
          {open ? 'Hide' : 'Show'} order summary
          <Icon className={cn('size-3.5 transition-transform', open && 'rotate-180')}>
            {icons.chevronDown}
          </Icon>
        </span>
        <span className="text-base font-medium">{formatPrice(total)}</span>
      </button>

      <div
        id="order-summary"
        className={cn(
          'flex-col gap-6 px-4 pt-2 pb-8 md:px-8 lg:sticky lg:top-0 lg:flex lg:px-10 lg:pt-14 lg:pb-14 xl:pr-16 xl:pl-12',
          open ? 'flex' : 'hidden',
        )}
      >
        <h2 className="text-sm font-semibold tracking-[0.09em] uppercase">
          Order summary · {count} item{count === 1 ? '' : 's'}
        </h2>

        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-4">
              <div className="relative size-[72px] shrink-0 bg-[#EEEDE5]">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#24260F] text-xs font-semibold text-white tabular-nums">
                  <span className="sr-only">Quantity </span>
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/shop/${item.slug}`}
                  className="truncate text-[15px] font-medium hover:underline"
                >
                  {item.title}
                </Link>
                {item.size && <span className="text-[13px] text-[#6B6C5A]">Size: {item.size}</span>}
              </div>
              <span className="text-[15px] font-medium tabular-nums">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-y border-[#DDDCD0] py-5">
          <PromoCode bag={bag} />
        </div>

        <dl className="flex flex-col gap-3 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B6C5A]">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {promo && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#6B6C5A]">
                Discount · {promo.code}
                {promo.label && ` · ${promo.label}`}
              </dt>
              <dd className="text-olive font-medium tabular-nums">−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B6C5A]">Delivery{delivery && ` · ${delivery.title}`}</dt>
            <dd className="font-medium tabular-nums">
              {!delivery ? '—' : delivery.price === null ? 'Quoted' : formatPrice(delivery.price)}
            </dd>
          </div>
        </dl>

        <div className="flex items-end justify-between gap-4 border-t border-[#DDDCD0] pt-5">
          <span className="text-sm font-semibold tracking-[0.1em] uppercase">Total</span>
          <span className="flex items-end gap-2">
            <span className="pb-1.5 text-[13px] text-[#6B6C5A]">NGN</span>
            <span className="text-[28px] leading-none font-medium tabular-nums md:text-[32px]">
              {formatPrice(total)}
            </span>
          </span>
        </div>

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 bg-white p-5"
          >
            <Icon className="text-olive size-5">{icons.chat}</Icon>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold group-hover:underline">
                Need help with your order?
              </span>
              <span className="text-[13px] text-[#6B6C5A]">Chat with our team on WhatsApp</span>
            </span>
          </a>
        )}
      </div>
    </aside>
  )
}

function PromoCode({ bag }: { bag: Bag }) {
  const { promo, discount } = bag
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  if (promo) {
    return (
      <div className="flex gap-2.5">
        <p className="flex h-12 min-w-0 flex-1 items-center gap-2 border border-[#DDDCD0] bg-white px-3.5">
          <Icon className="text-olive size-3.5">{icons.tag}</Icon>
          <span className="text-xs font-semibold tracking-[0.11em] uppercase">{promo.code}</span>
          <span className="text-olive truncate text-[13px]">
            {discount > 0 || !promo.minimumSubtotal
              ? 'applied'
              : `applies from ${formatPrice(promo.minimumSubtotal)}`}
          </span>
        </p>
        <button
          type="button"
          onClick={() => void bag.removePromo()}
          aria-label={`Remove code ${promo.code}`}
          className={cn(
            smallCaps,
            'h-12 border border-[#24260F] px-5 transition-colors hover:bg-[#24260F] hover:text-white',
          )}
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const ok = await bag.applyPromo(code)
        setBusy(false)
        setError(!ok)
        if (ok) setCode('')
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2.5">
        <label className="sr-only" htmlFor="checkout-promo">
          Discount code
        </label>
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 border border-[#DDDCD0] bg-white px-3.5 focus-within:border-[#24260F]">
          <Icon className="text-olive size-3.5">{icons.tag}</Icon>
          <input
            id="checkout-promo"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(false)
            }}
            placeholder="Discount code"
            autoComplete="off"
            aria-invalid={error}
            aria-describedby={error ? 'checkout-promo-error' : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-xs font-semibold tracking-[0.11em] uppercase outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9A9B8A] placeholder:normal-case"
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim() || busy}
          className={cn(
            smallCaps,
            'h-12 border border-[#24260F] px-5 transition-colors hover:bg-[#24260F] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#24260F]',
          )}
        >
          Apply
        </button>
      </div>
      {error && (
        <p id="checkout-promo-error" role="alert" className="text-xs text-[#9B3B2A]">
          That code isn’t valid.
        </p>
      )}
    </form>
  )
}

function EmptyBag() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <Icon className="text-olive size-8">{icons.bag}</Icon>
      <h1 className="text-2xl font-normal uppercase md:text-3xl">Your bag is empty</h1>
      <p className="max-w-sm text-[15px] text-[#6B6C5A]">
        Add something you love, then come back here to check out.
      </p>
      <Link
        href="/shop"
        className={cn(
          smallCaps,
          'mt-2 bg-[#24260F] px-8 py-4 text-white transition-colors hover:bg-black',
        )}
      >
        Shop the range
      </Link>
    </div>
  )
}
