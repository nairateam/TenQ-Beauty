import type { GlobalConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'

/** Which products, kits and reviews the homepage sections show, and in what order. */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: { group: 'Content' },
  access: {
    read: publicAccess,
    update: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Bestsellers',
          fields: [
            {
              name: 'bestsellers',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              filterOptions: { kind: { equals: 'product' } },
              admin: { description: 'Shown in this order. Drag to reorder.' },
            },
          ],
        },
        {
          label: 'Essential steps',
          fields: [
            {
              name: 'routine',
              label: 'Steps',
              type: 'array',
              maxRows: 4,
              admin: {
                description:
                  'The “4 Essential Steps” section. Each step shows its product’s name and image.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'step',
                      type: 'text',
                      required: true,
                      admin: { width: '30%', description: 'e.g. Cleanse' },
                    },
                    {
                      name: 'product',
                      type: 'relationship',
                      relationTo: 'products',
                      required: true,
                      admin: { width: '70%' },
                    },
                  ],
                },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Shop by concern',
          fields: [
            {
              name: 'concerns',
              type: 'array',
              admin: {
                description:
                  'Each concern is a pill; its three kits show when selected (the first gets the wide card).',
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'kits',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  minRows: 3,
                  maxRows: 3,
                  required: true,
                  filterOptions: { kind: { equals: 'kit' } },
                },
              ],
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [
            {
              name: 'rating',
              type: 'text',
              defaultValue: '5.0 on our bestsellers · 5,000+ clients',
            },
            {
              name: 'testimonials',
              type: 'relationship',
              relationTo: 'testimonials',
              hasMany: true,
            },
          ],
        },
      ],
    },
  ],
}
