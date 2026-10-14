import type { Payload } from 'payload'

import { findPromo } from '@/collections/shop/PromoCodes'
import { priceField } from '@/lib/currencies'
import { discountFor, shipsTo } from '@/lib/pricing'

type Ref = string | { id: string } | null | undefined
const idOf = (ref: Ref) => (ref && typeof ref === 'object' ? ref.id : ref) || undefined

export type CartLine = { product?: Ref; variant?: Ref; quantity: number }

export type ShippingAddress = {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  country: string
  phone?: string
}

/**
 * The amount to charge for a cart, worked out from current published prices, the cart's promo
 * code and the chosen shipping method. Never trusts amounts sent by the browser.
 */
export async function checkoutTotals(
  payload: Payload,
  args: {
    items: CartLine[]
    promoCode?: string | null
    shippingMethodID?: string
    address: Pick<ShippingAddress, 'country' | 'state'>
  },
) {
  let subtotal = 0
  const lines: { product: string; variant?: string; quantity: number; unitPrice: number }[] = []

  for (const item of args.items) {
    const productID = idOf(item.product)
    const variantID = idOf(item.variant)
    if (!productID) throw new Error('A cart item has no product.')

    // overrideAccess: false — only published products and variants can be bought
    const source: unknown = variantID
      ? await payload.findByID({
          collection: 'variants',
          id: variantID,
          depth: 0,
          overrideAccess: false,
        })
      : await payload.findByID({
          collection: 'products',
          id: productID,
          depth: 0,
          overrideAccess: false,
        })
    const unitPrice = (source as Record<string, unknown>)[priceField]
    if (typeof unitPrice !== 'number' || unitPrice <= 0) {
      throw new Error(`An item in the bag is no longer for sale (${productID}).`)
    }
    const quantity = Math.max(1, Math.floor(item.quantity || 1))
    subtotal += unitPrice * quantity
    lines.push({
      product: productID,
      ...(variantID ? { variant: variantID } : {}),
      quantity,
      unitPrice,
    })
  }

  const promo = await findPromo(payload, args.promoCode)
  const discount = discountFor(promo, subtotal)

  if (!args.shippingMethodID) throw new Error('Choose a delivery method.')
  const method = await payload.findByID({
    collection: 'shipping-methods',
    id: args.shippingMethodID,
    depth: 0,
    overrideAccess: false,
  })
  if (!method || !shipsTo(method, args.address)) {
    throw new Error('That delivery method isn’t available for this address.')
  }
  const shippingQuote = typeof method.price !== 'number'
  const shipping = shippingQuote ? 0 : (method.price as number)

  return {
    lines,
    subtotal,
    promoCode: promo && discount > 0 ? promo.code : null,
    discount,
    shipping,
    shippingQuote,
    shippingMethod: { id: method.id, title: method.title },
    total: subtotal - discount + shipping,
  }
}

export type CheckoutTotals = Awaited<ReturnType<typeof checkoutTotals>>
