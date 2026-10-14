import { amountField } from '@payloadcms/plugin-ecommerce'
import type { Access, CollectionConfig, Field } from 'payload'

import { adminOnly } from '@/access'
import { checkRole } from '@/access/utilities'
import { countries, nigerianStates } from '@/lib/countries'
import { currenciesConfig, NGN } from '@/lib/currencies'

const activeOrAdmin: Access = ({ req: { user } }) =>
  checkRole(['admin'], user) || { active: { equals: true } }

const priceField = (() => {
  const field = amountField({
    currenciesConfig,
    currency: NGN,
    overrides: { name: 'price', label: 'Price' },
  })
  return {
    ...field,
    admin: {
      ...field.admin,
      description:
        'Leave empty to quote after the order is placed — the customer then pays for the products only.',
    },
  } as Field
})()

/** Delivery options at checkout, with where each one ships to and what it costs. */
export const ShippingMethods: CollectionConfig = {
  slug: 'shipping-methods',
  labels: { singular: 'Shipping method', plural: 'Shipping methods' },
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'note', 'price', 'active'],
    description:
      'Checkout lists every active method, in sort order, and lets the customer pick one that ships to their address.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: activeOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'e.g. “Within Lagos”.' } },
    { name: 'note', type: 'text', admin: { description: 'e.g. “1–3 working days”.' } },
    priceField,
    {
      type: 'row',
      fields: [
        {
          name: 'countriesRule',
          type: 'radio',
          defaultValue: 'only',
          options: [
            { label: 'Only these countries', value: 'only' },
            { label: 'Everywhere except these', value: 'except' },
          ],
          admin: { width: '40%' },
        },
        {
          name: 'countries',
          type: 'select',
          hasMany: true,
          options: countries,
          admin: { width: '60%', description: 'Empty means every country.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'statesRule',
          type: 'radio',
          defaultValue: 'only',
          options: [
            { label: 'Only these states', value: 'only' },
            { label: 'Every state except these', value: 'except' },
          ],
          admin: { width: '40%' },
        },
        {
          name: 'states',
          type: 'select',
          hasMany: true,
          options: nigerianStates,
          admin: { width: '60%', description: 'Nigerian states. Empty means every state.' },
        },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers are listed first.' },
    },
  ],
}
