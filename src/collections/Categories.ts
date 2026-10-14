import type { CollectionConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'
import { slugField } from '@/fields/slug'

/** Shared by products (shop filters) and posts (blog categories). */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: publicAccess,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order of the journal filter tabs — lower first.',
      },
    },
  ],
}
