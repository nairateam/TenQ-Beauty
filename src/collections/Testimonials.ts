import type { CollectionConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'

/** Customer reviews shown in the homepage "In their words" carousel. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Content',
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'name', 'product'],
  },
  access: {
    read: publicAccess,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: { description: 'e.g. “My curls are thriving again”' },
    },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Reviewer, e.g. “Verified customer” or “Parent”' },
    },
    {
      name: 'meta',
      type: 'text',
      admin: { description: 'Context line under the tab, e.g. “Parent · Kids routine”' },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'avatarPosition',
      type: 'text',
      admin: { description: 'Optional CSS object-position for the crop, e.g. “50% 30%”' },
    },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
  ],
}
