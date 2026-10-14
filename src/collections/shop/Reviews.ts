import type { Access, CollectionConfig } from 'payload'

import { adminOnly } from '@/access'
import { checkRole } from '@/access/utilities'

/** Visitors only see approved reviews. */
const approvedOrAdmin: Access = ({ req: { user } }) =>
  checkRole(['admin'], user) || { status: { equals: 'approved' } }

/** Product reviews — the rating summary and list on each product page. */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'product', 'rating', 'date', 'status'],
  },
  defaultSort: 'date',
  access: {
    read: approvedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5, admin: { step: 1 } },
    { name: 'text', type: 'textarea', required: true },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'approved',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
