import { amountField } from '@payloadcms/plugin-ecommerce'
import type { CollectionConfig, Field, Payload } from 'payload'

import { adminOnly } from '@/access'
import { currenciesConfig, NGN } from '@/lib/currencies'
import type { PromoRule } from '@/lib/pricing'

/** A naira amount with the plugin's currency input (stored in kobo). */
const naira = (name: string, label: string, admin: Record<string, unknown>): Field => {
  const field = amountField({ currenciesConfig, currency: NGN, overrides: { name, label } })
  return { ...field, admin: { ...field.admin, ...admin } } as Field
}

export const normalise = (code: string) => code.trim().toUpperCase()

/** Discount codes customers enter in the bag or at checkout. Only admins can list them. */
export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',
  labels: { singular: 'Promo code', plural: 'Promo codes' },
  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: ['code', 'label', 'discountType', 'active', 'uses'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? normalise(value) : value)],
      },
      admin: { description: 'What customers type, e.g. HAIRRESS. Not case-sensitive.' },
    },
    {
      name: 'label',
      type: 'text',
      admin: { description: 'Shown once applied, e.g. “5% off first order”.' },
    },
    {
      name: 'discountType',
      type: 'radio',
      required: true,
      defaultValue: 'percent',
      options: [
        { label: 'Percentage off', value: 'percent' },
        { label: 'Fixed amount off', value: 'fixed' },
      ],
    },
    {
      name: 'percent',
      type: 'number',
      min: 1,
      max: 100,
      admin: { condition: (data) => data?.discountType === 'percent' },
    },
    naira('amount', 'Amount off', {
      condition: (data: Record<string, unknown>) => data?.discountType === 'fixed',
    }),
    naira('minimumSubtotal', 'Minimum subtotal', {
      description: 'Optional. The code only works when the bag is worth at least this.',
    }),
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'startsAt', type: 'date', admin: { position: 'sidebar', description: 'Optional.' } },
    { name: 'expiresAt', type: 'date', admin: { position: 'sidebar', description: 'Optional.' } },
    {
      name: 'maxUses',
      type: 'number',
      min: 1,
      admin: { position: 'sidebar', description: 'Optional. Paid orders allowed in total.' },
    },
    {
      name: 'uses',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Paid orders that used it.' },
    },
  ],
}

/** The rule for a code if it can be used right now, otherwise null. */
export async function findPromo(payload: Payload, code?: string | null): Promise<PromoRule | null> {
  if (!code) return null
  const { docs } = await payload.find({
    collection: 'promo-codes',
    where: { code: { equals: normalise(code) }, active: { equals: true } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const promo = docs[0]
  if (!promo) return null

  const now = Date.now()
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return null
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < now) return null
  if (promo.maxUses && (promo.uses ?? 0) >= promo.maxUses) return null

  const value = promo.discountType === 'percent' ? (promo.percent ?? 0) : (promo.amount ?? 0)
  if (!value) return null
  return {
    code: promo.code,
    label: promo.label,
    discountType: promo.discountType,
    value,
    minimumSubtotal: promo.minimumSubtotal,
  }
}
