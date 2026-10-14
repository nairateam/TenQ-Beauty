import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

import { slugField } from '@/fields/slug'

/* ---------- Sidebar: listing and filters ---------- */

const sidebarFields: Field[] = [
  slugField(),
  {
    name: 'kind',
    type: 'select',
    defaultValue: 'product',
    required: true,
    options: [
      { label: 'Single product', value: 'product' },
      { label: 'Kit / bundle', value: 'kit' },
    ],
    admin: { position: 'sidebar' },
  },
  {
    name: 'badge',
    type: 'text',
    admin: {
      position: 'sidebar',
      description: 'Optional tag on product cards, e.g. “Bestseller”, “New” or “5.0 ★”.',
    },
  },
  {
    name: 'popularity',
    type: 'number',
    defaultValue: 100,
    admin: {
      position: 'sidebar',
      description: 'Sort position under “Popularity” — lower numbers show first.',
    },
  },
  {
    name: 'releasedAt',
    type: 'date',
    defaultValue: () => new Date().toISOString(),
    admin: {
      position: 'sidebar',
      description: 'Used for the “Newest” sort.',
      date: { pickerAppearance: 'dayOnly' },
    },
  },
  {
    name: 'shopCollections',
    label: 'Collections',
    type: 'relationship',
    relationTo: 'shop-collections',
    hasMany: true,
    admin: {
      position: 'sidebar',
      description: 'The first is shown under the product name.',
    },
  },
  {
    name: 'concerns',
    type: 'relationship',
    relationTo: 'concerns',
    hasMany: true,
    admin: { position: 'sidebar' },
  },
  {
    name: 'hairTypes',
    type: 'relationship',
    relationTo: 'hair-types',
    hasMany: true,
    admin: { position: 'sidebar' },
  },
]

/* ---------- Tabs ---------- */

const detailsTab: Field[] = [
  { name: 'title', type: 'text', required: true },
  {
    name: 'subtitle',
    type: 'text',
    admin: {
      description: 'One short line on product cards, e.g. key ingredients or what a kit fixes.',
    },
  },
  {
    name: 'tagline',
    type: 'textarea',
    admin: { description: 'Short pitch under the name on the product page.' },
  },
  { name: 'image', type: 'upload', relationTo: 'media', required: true },
  {
    name: 'gallery',
    type: 'array',
    admin: { description: 'Extra product page images, shown after the main image.' },
    fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
  },
  {
    name: 'label',
    type: 'text',
    admin: { description: 'Optional tag on the product page image, e.g. “Bestseller”.' },
  },
  { name: 'description', type: 'textarea' },
]

const productPageTab: Field[] = [
  {
    name: 'benefits',
    type: 'array',
    maxRows: 4,
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'icon',
            type: 'select',
            required: true,
            defaultValue: 'sparkles',
            options: [
              { label: 'Sprout', value: 'sprout' },
              { label: 'Droplet', value: 'droplet' },
              { label: 'Sparkles', value: 'sparkles' },
            ],
            admin: { width: '30%' },
          },
          { name: 'text', type: 'text', required: true, admin: { width: '70%' } },
        ],
      },
    ],
  },
  {
    name: 'freeFrom',
    type: 'text',
    hasMany: true,
    admin: { description: 'e.g. Silicone, Parabens, Mineral oil.' },
  },
  {
    name: 'howToUse',
    type: 'array',
    labels: { singular: 'Step', plural: 'Steps' },
    fields: [{ name: 'step', type: 'text', required: true }],
  },
  { name: 'ingredients', type: 'textarea', admin: { description: 'The full INCI list.' } },
  {
    name: 'inside',
    label: 'What’s inside',
    type: 'group',
    admin: { description: 'The ingredients band. Hidden when it has no key ingredients.' },
    fields: [
      { name: 'title', type: 'text' },
      { name: 'note', type: 'text', hasMany: true, admin: { description: 'Short lines.' } },
      {
        name: 'key',
        label: 'Key ingredients',
        type: 'array',
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'name', type: 'text', required: true },
              { name: 'latin', type: 'text' },
            ],
          },
          { name: 'text', type: 'textarea', required: true },
        ],
      },
      { name: 'also', label: 'Also inside', type: 'text', hasMany: true },
    ],
  },
  {
    name: 'routine',
    label: 'How to use (photo section)',
    type: 'group',
    admin: { description: 'The photo-and-steps band. Hidden when it has no steps.' },
    fields: [
      { name: 'title', type: 'text' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      {
        name: 'steps',
        type: 'array',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'text', type: 'text', required: true },
        ],
      },
    ],
  },
  {
    name: 'addOn',
    label: 'Add-on',
    type: 'group',
    admin: { description: 'An optional extra offered beside “Add to bag”.' },
    fields: [
      { name: 'product', type: 'relationship', relationTo: 'products' },
      { name: 'title', type: 'text', admin: { description: 'e.g. “Add a scalp massage brush”.' } },
      { name: 'note', type: 'text' },
    ],
  },
]

/** Which size is picked on load and which is flagged "Best value". */
const sizeFields: Field[] = [
  {
    type: 'row',
    admin: { condition: (data) => Boolean(data?.enableVariants) },
    fields: [
      {
        name: 'defaultVariant',
        label: 'Selected on load',
        type: 'relationship',
        relationTo: 'variants',
        filterOptions: ({ id }) => ({ product: { equals: id } }),
        admin: { description: 'Defaults to the cheapest.' },
      },
      {
        name: 'bestValueVariant',
        label: 'Best value',
        type: 'relationship',
        relationTo: 'variants',
        filterOptions: ({ id }) => ({ product: { equals: id } }),
      },
    ],
  },
]

/**
 * The plugin's stock field starts at 0, which reads as sold out. Here an empty field means stock
 * isn't tracked; a number is the units left and goes down as orders are paid.
 */
export const untrackedInventory = (fields: Field[]): Field[] =>
  fields.map((field) =>
    'name' in field && field.name === 'inventory'
      ? ({
          ...field,
          defaultValue: undefined,
          admin: {
            ...field.admin,
            description:
              'Units in stock. Leave empty if you don’t track stock for this item; 0 shows it as sold out.',
          },
        } as Field)
      : field,
  )

/** Storefront fields around the ecommerce plugin's prices, inventory and variants. */
export const productsOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'prices', '_status'],
  },
  defaultSort: 'popularity',
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Details', fields: detailsTab },
        {
          label: 'Pricing & stock',
          fields: [...untrackedInventory(defaultCollection.fields), ...sizeFields],
        },
        { label: 'Product page', fields: productPageTab },
      ],
    },
    ...sidebarFields,
  ],
})

export const variantsOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: { ...defaultCollection.admin, group: 'Shop' },
  fields: untrackedInventory(defaultCollection.fields),
})
