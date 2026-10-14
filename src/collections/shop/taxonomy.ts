import type { CollectionConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'
import { slugField } from '@/fields/slug'

/** A simple list products are tagged with and the shop filters by, e.g. concerns or hair types. */
const taxonomy = (
  slug: 'concerns' | 'hair-types',
  labels: { singular: string; plural: string },
  description: string,
): CollectionConfig => ({
  slug,
  labels,
  admin: {
    group: 'Shop',
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'sortOrder'],
    description,
  },
  defaultSort: 'sortOrder',
  access: {
    read: publicAccess,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    slugField('label'),
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers are listed first.' },
    },
  ],
})

export const Concerns = taxonomy(
  'concerns',
  { singular: 'Concern', plural: 'Concerns' },
  'Hair and scalp concerns customers can filter the shop by.',
)

export const HairTypes = taxonomy(
  'hair-types',
  { singular: 'Hair type', plural: 'Hair types' },
  'Hair types customers can filter the shop by.',
)
