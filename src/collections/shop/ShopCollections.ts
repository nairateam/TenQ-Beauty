import type { CollectionConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'
import { slugField } from '@/fields/slug'

/**
 * Product ranges such as Hairress or Afro Kids — the shop page carousel and filter tabs.
 * Product counts and "from" prices are worked out from the products in each one.
 */
export const ShopCollections: CollectionConfig = {
  slug: 'shop-collections',
  labels: { singular: 'Collection', plural: 'Collections' },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'headline', 'sortOrder'],
  },
  defaultSort: 'sortOrder',
  access: {
    read: publicAccess,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Short name for tabs and product cards, e.g. “Afro Kids”.' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small line above the headline, e.g. “Afro Kids collection”.' },
    },
    { name: 'headline', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imagePosition',
      type: 'text',
      admin: { description: 'Optional CSS object-position for the crop, e.g. “50% 30%”.' },
    },
    slugField('name'),
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers are listed first.' },
    },
  ],
}
