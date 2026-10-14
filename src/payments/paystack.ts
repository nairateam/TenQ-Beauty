/*
 * Paystack for the Payload ecommerce plugin, using Paystack's hosted payment page:
 *
 *   1. initiatePayment  (POST /api/payments/paystack/initiate)
 *      Prices the cart on the server, opens a Paystack transaction and records a pending
 *      transaction. The browser is sent to the returned authorizationUrl.
 *   2. Paystack sends the customer back to /checkout/confirm?reference=…
 *   3. confirmOrder     (POST /api/payments/paystack/confirm-order)
 *      Verifies the payment with Paystack and creates the order.
 *   4. The webhook      (POST /api/payments/paystack/webhooks)
 *      Does the same as 3 for charge.success, so the order is created even if the customer
 *      closes the tab before returning. Point Paystack's webhook URL here.
 *
 * Steps 3 and 4 share `fulfil`, which only ever creates one order per payment.
 */
import crypto from 'crypto'

import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { Payload, PayloadRequest } from 'payload'

import type { Transaction } from '@/payload-types'

import { checkoutTotals, type CheckoutTotals, type ShippingAddress } from './checkoutTotals'

const API = 'https://api.paystack.co'

type PaystackResponse<T> = { status: boolean; message: string; data: T }

async function paystack<T>(secretKey: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const body = (await res.json().catch(() => null)) as PaystackResponse<T> | null
  if (!res.ok || !body?.status) {
    throw new Error(`Paystack: ${body?.message ?? res.statusText}`)
  }
  return body.data
}

/** What initiatePayment stores on the transaction, for creating the order later. */
type CheckoutSnapshot = {
  shippingAddress: ShippingAddress
  phone: string
  giftNote: string | null
  marketingOptIn: boolean
  totals: Omit<CheckoutTotals, 'lines'>
}

const required = (value: unknown, label: string) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`)
  return value.trim()
}

function readAddress(data: Record<string, unknown> | undefined): ShippingAddress {
  const a = (data ?? {}) as Record<string, unknown>
  const optional = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  return {
    firstName: required(a.firstName, 'First name'),
    lastName: required(a.lastName, 'Last name'),
    addressLine1: required(a.addressLine1, 'Street address'),
    addressLine2: optional(a.addressLine2),
    city: required(a.city, 'City'),
    state: optional(a.state),
    country: required(a.country, 'Country'),
    phone: optional(a.phone),
  }
}

/* ---------- Fulfilment ---------- */

// One fulfilment per reference at a time in this process, so the redirect and the webhook
// arriving together can't both create an order
const inFlight = new Map<string, Promise<{ orderID: string; total: number; email: string }>>()

export function fulfil(
  payload: Payload,
  secretKey: string,
  reference: string,
  req?: PayloadRequest,
) {
  const running = inFlight.get(reference)
  if (running) return running
  const job = fulfilOnce(payload, secretKey, reference, req).finally(() =>
    inFlight.delete(reference),
  )
  inFlight.set(reference, job)
  return job
}

async function fulfilOnce(
  payload: Payload,
  secretKey: string,
  reference: string,
  req?: PayloadRequest,
) {
  const { docs } = await payload.find({
    collection: 'transactions',
    where: { 'paystack.reference': { equals: reference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const transaction = docs[0] as Transaction | undefined
  if (!transaction) throw new Error(`No transaction for Paystack reference ${reference}.`)

  const email = transaction.customerEmail ?? ''
  const existingOrder = transaction.order
  if (existingOrder) {
    return {
      orderID: typeof existingOrder === 'object' ? existingOrder.id : existingOrder,
      total: transaction.amount ?? 0,
      email,
    }
  }

  const verified = await paystack<{
    status: string
    amount: number
    currency: string
    channel?: string
  }>(secretKey, `/transaction/verify/${encodeURIComponent(reference)}`)
  if (verified.status !== 'success') {
    if (['failed', 'abandoned', 'reversed'].includes(verified.status)) {
      await payload.update({
        collection: 'transactions',
        id: transaction.id,
        data: { status: verified.status === 'abandoned' ? 'cancelled' : 'failed' },
        overrideAccess: true,
      })
    }
    throw new Error(`Payment not completed (${verified.status}).`)
  }
  if (verified.amount !== transaction.amount || verified.currency !== transaction.currency) {
    throw new Error('The amount paid does not match the order.')
  }

  const snapshot = transaction.checkout as CheckoutSnapshot
  const { totals } = snapshot
  const cartID = typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart
  const customerID =
    typeof transaction.customer === 'object' ? transaction.customer?.id : transaction.customer

  const order = await payload.create({
    collection: 'orders',
    data: {
      amount: transaction.amount,
      currency: transaction.currency,
      ...(customerID ? { customer: customerID } : {}),
      customerEmail: email,
      items: transaction.items,
      shippingAddress: snapshot.shippingAddress,
      status: 'processing',
      transactions: [transaction.id],
      phone: snapshot.phone,
      giftNote: snapshot.giftNote,
      promoCode: totals.promoCode,
      marketingOptIn: snapshot.marketingOptIn,
      paystackReference: reference,
      breakdown: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        shippingMethod: totals.shippingMethod.id,
        shippingTitle: totals.shippingMethod.title,
        shippingQuote: totals.shippingQuote,
      },
    },
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  await payload.update({
    collection: 'transactions',
    id: transaction.id,
    data: { order: order.id, status: 'succeeded' },
    overrideAccess: true,
  })

  if (cartID) {
    await payload.update({
      collection: 'carts',
      id: cartID,
      data: { purchasedAt: new Date().toISOString() },
      overrideAccess: true,
    })
  }

  if (totals.promoCode) {
    const { docs: promos } = await payload.find({
      collection: 'promo-codes',
      where: { code: { equals: totals.promoCode } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (promos[0]) {
      await payload.update({
        collection: 'promo-codes',
        id: promos[0].id,
        data: { uses: (promos[0].uses ?? 0) + 1 },
        overrideAccess: true,
      })
    }
  }

  // Only stock that is tracked (a number) goes down; empty inventory means unlimited
  for (const item of transaction.items ?? []) {
    const variantID = typeof item.variant === 'object' ? item.variant?.id : item.variant
    const productID = typeof item.product === 'object' ? item.product?.id : item.product
    const collection = variantID ? 'variants' : 'products'
    const id = variantID ?? productID
    if (!id) continue
    const doc = await payload.findByID({ collection, id, depth: 0, overrideAccess: true })
    if (typeof doc?.inventory === 'number') {
      await payload.update({
        collection,
        id,
        data: { inventory: Math.max(0, doc.inventory - item.quantity) },
        overrideAccess: true,
      })
    }
  }

  return { orderID: order.id, total: transaction.amount ?? 0, email }
}

/* ---------- Adapter ---------- */

export const paystackAdapter = ({ secretKey }: { secretKey?: string }): PaymentAdapter => {
  const key = () => {
    if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not set.')
    return secretKey
  }

  return {
    name: 'paystack',
    label: 'Paystack',
    group: {
      name: 'paystack',
      type: 'group',
      admin: { condition: (data) => data?.paymentMethod === 'paystack' },
      fields: [
        { name: 'reference', type: 'text', label: 'Paystack reference', index: true },
        { name: 'accessCode', type: 'text', label: 'Access code' },
      ],
    },

    initiatePayment: async ({ data, req, transactionsSlug }) => {
      const { cart, currency, customerEmail } = data
      const extra = (req.data ?? {}) as Record<string, unknown>
      const shippingAddress = readAddress(
        data.shippingAddress as unknown as Record<string, unknown>,
      )
      const phone = required(extra.phone ?? shippingAddress.phone, 'Phone')

      // Promo code and gift note live on the cart, which the plugin fetched without them
      const cartDoc = await req.payload.findByID({
        collection: 'carts',
        id: cart.id,
        depth: 0,
        overrideAccess: true,
      })
      const totals = await checkoutTotals(req.payload, {
        items: cartDoc.items ?? [],
        promoCode: cartDoc.promoCode,
        shippingMethodID:
          typeof extra.shippingMethod === 'string' ? extra.shippingMethod : undefined,
        address: shippingAddress,
      })
      if (totals.total <= 0) throw new Error('Nothing to pay.')

      const reference = `tenq_${crypto.randomUUID().replace(/-/g, '')}`
      const serverURL = req.payload.config.serverURL || process.env.NEXT_PUBLIC_SERVER_URL || ''
      const started = await paystack<{ authorization_url: string; access_code: string }>(
        key(),
        '/transaction/initialize',
        {
          method: 'POST',
          body: JSON.stringify({
            email: customerEmail,
            amount: totals.total,
            currency,
            reference,
            callback_url: `${serverURL}/checkout/confirm`,
            metadata: { cartID: cart.id },
          }),
        },
      )

      const snapshot: CheckoutSnapshot = {
        shippingAddress: { ...shippingAddress, phone },
        phone,
        giftNote: cartDoc.giftNote ?? null,
        marketingOptIn: extra.marketingOptIn === true,
        totals: {
          subtotal: totals.subtotal,
          promoCode: totals.promoCode,
          discount: totals.discount,
          shipping: totals.shipping,
          shippingQuote: totals.shippingQuote,
          shippingMethod: totals.shippingMethod,
          total: totals.total,
        },
      }

      await req.payload.create({
        collection: transactionsSlug as 'transactions',
        data: {
          ...(req.user ? { customer: req.user.id } : {}),
          customerEmail,
          amount: totals.total,
          currency: currency as Transaction['currency'],
          billingAddress: snapshot.shippingAddress,
          cart: cart.id,
          items: totals.lines.map(({ unitPrice: _unitPrice, ...line }) => line),
          paymentMethod: 'paystack',
          status: 'pending',
          paystack: { reference, accessCode: started.access_code },
          checkout: snapshot,
        },
        overrideAccess: true,
        req,
      })

      return {
        message: 'Payment initiated',
        authorizationUrl: started.authorization_url,
        reference,
      }
    },

    confirmOrder: async ({ data, req }) => {
      const reference = typeof data.reference === 'string' ? data.reference : ''
      if (!reference) throw new Error('A Paystack reference is required.')
      const result = await fulfil(req.payload, key(), reference, req)
      // No transactionID on purpose: the plugin would then lower stock a second time
      return { message: 'Order confirmed', ...result } as unknown as Awaited<
        ReturnType<PaymentAdapter['confirmOrder']>
      >
    },

    endpoints: [
      {
        path: '/webhooks',
        method: 'post',
        handler: async (req) => {
          if (!secretKey) return Response.json({ received: false }, { status: 503 })
          const raw = req.text ? await req.text() : ''
          const signature = req.headers.get('x-paystack-signature') ?? ''
          const expected = crypto.createHmac('sha512', secretKey).update(raw).digest('hex')
          const valid =
            signature.length === expected.length &&
            crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
          if (!valid) return Response.json({ received: false }, { status: 401 })

          const event = JSON.parse(raw) as { event: string; data?: { reference?: string } }
          if (event.event === 'charge.success' && event.data?.reference) {
            try {
              await fulfil(req.payload, secretKey, event.data.reference)
            } catch (err) {
              req.payload.logger.error({ err, msg: 'Paystack webhook: could not fulfil order' })
            }
          }
          return Response.json({ received: true })
        },
      },
    ],
  }
}
