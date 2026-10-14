/*
 * Additions to the ecommerce plugin's carts, orders and transactions:
 * promo codes, gift notes and saved-for-later on the cart, and the delivery and discount
 * breakdown on orders.
 */
import { amountField } from '@payloadcms/plugin-ecommerce'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

import { currenciesConfig, NGN } from '@/lib/currencies'
import { discountFor } from '@/lib/pricing'

import { findPromo, normalise } from './PromoCodes'

const naira = (name: string, label: string): Field =>
  amountField({ currenciesConfig, currency: NGN, overrides: { name, label } }) as Field

/* ---------- Carts ---------- */

const cartFields: Field[] = [
  {
    name: 'promoCode',
    type: 'text',
    hooks: {
      beforeValidate: [
        ({ value }) => (typeof value === 'string' && value ? normalise(value) : null),
      ],
    },
    validate: async (
      value: unknown,
      { req }: { req: { payload: Parameters<typeof findPromo>[0] } },
    ) => {
      if (!value || typeof value !== 'string') return true
      return (await findPromo(req.payload, value)) ? true : 'That code isn’t valid.'
    },
    admin: { position: 'sidebar' },
  } as Field,
  {
    name: 'promo',
    type: 'json',
    virtual: true,
    admin: { hidden: true },
    hooks: {
      // What the code takes off, worked out on every read so it tracks the subtotal and the code's rules
      afterRead: [
        async ({ siblingData, req }) => {
          const rule = await findPromo(req.payload, siblingData?.promoCode)
          if (!rule) return null
          return {
            code: rule.code,
            label: rule.label ?? null,
            minimumSubtotal: rule.minimumSubtotal ?? null,
            discount: discountFor(rule, siblingData?.subtotal ?? 0),
          }
        },
      ],
    },
  },
  { name: 'giftNote', type: 'textarea', maxLength: 240, admin: { position: 'sidebar' } },
  {
    name: 'savedItems',
    label: 'Saved for later',
    type: 'array',
    admin: { initCollapsed: true },
    fields: [
      { name: 'product', type: 'relationship', relationTo: 'products', required: true },
      { name: 'variant', type: 'relationship', relationTo: 'variants' },
    ],
  },
]

export const cartsOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: { ...defaultCollection.admin, group: 'Orders' },
  fields: [...defaultCollection.fields, ...cartFields],
})

/* ---------- Orders ---------- */

const orderFields: Field[] = [
  {
    type: 'collapsible',
    label: 'Checkout details',
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'phone', type: 'text' },
          { name: 'promoCode', type: 'text' },
          { name: 'paystackReference', type: 'text', admin: { readOnly: true } },
        ],
      },
      { name: 'giftNote', type: 'textarea' },
      {
        name: 'marketingOptIn',
        label: 'Opted in to marketing emails',
        type: 'checkbox',
      },
      {
        name: 'breakdown',
        type: 'group',
        fields: [
          {
            type: 'row',
            fields: [
              naira('subtotal', 'Subtotal'),
              naira('discount', 'Discount'),
              naira('shipping', 'Delivery'),
            ],
          },
          {
            type: 'row',
            fields: [
              { name: 'shippingMethod', type: 'relationship', relationTo: 'shipping-methods' },
              { name: 'shippingTitle', label: 'Delivery', type: 'text' },
              {
                name: 'shippingQuote',
                label: 'Delivery to be quoted',
                type: 'checkbox',
                admin: { description: 'Delivery was not charged at checkout.' },
              },
            ],
          },
        ],
      },
    ],
  },
]

export const ordersOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: { ...defaultCollection.admin, group: 'Orders' },
  fields: [...defaultCollection.fields, ...orderFields],
})

/* ---------- Transactions ---------- */

export const transactionsOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: { ...defaultCollection.admin, group: 'Orders' },
  fields: [
    ...defaultCollection.fields,
    {
      name: 'checkout',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'What the customer entered at checkout and how the amount was worked out.',
      },
    },
  ],
})
