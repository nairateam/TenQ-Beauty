/*
 * Pricing rules shared by the server (which charges) and the storefront (which shows totals).
 * All amounts are in kobo, as Payload stores them; convert with toNaira for display.
 */

export const toNaira = (kobo?: number | null) => Math.round((kobo ?? 0) / 100)

export type PromoRule = {
  code: string
  label?: string | null
  discountType: 'percent' | 'fixed'
  /** Percent off (e.g. 5), or a fixed amount in kobo */
  value: number
  /** Smallest subtotal (kobo) the code applies to */
  minimumSubtotal?: number | null
}

/** What a promo code takes off a subtotal, never more than the subtotal itself. */
export function discountFor(promo: PromoRule | null | undefined, subtotal: number) {
  if (!promo || subtotal <= 0) return 0
  if (promo.minimumSubtotal && subtotal < promo.minimumSubtotal) return 0
  const off =
    promo.discountType === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value
  return Math.min(off, subtotal)
}

export type ShippingRule = {
  countries?: string[] | null
  countriesRule?: 'only' | 'except' | null
  states?: string[] | null
  statesRule?: 'only' | 'except' | null
}

const matches = (
  list: string[] | null | undefined,
  rule: string | null | undefined,
  value: string,
) => {
  if (!list?.length) return true
  const listed = list.some((v) => v.toLowerCase() === value.toLowerCase())
  return rule === 'except' ? !listed : listed
}

/** Whether a shipping method delivers to an address. Empty lists mean "anywhere". */
export const shipsTo = (method: ShippingRule, address: { country: string; state?: string }) =>
  matches(method.countries, method.countriesRule, address.country) &&
  matches(method.states, method.statesRule, address.state ?? '')
