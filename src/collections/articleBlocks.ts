import type { Block, Field } from 'payload'

/*
 * The building blocks of a journal article's body. Steps are numbered in order; any block with a
 * "Contents label" is listed in the article's "In this article" contents.
 */

const tocLabel: Field = {
  name: 'tocLabel',
  label: 'Contents label',
  type: 'text',
  admin: {
    description: 'Short name in the “In this article” list. Leave empty to keep it out.',
  },
}

export const articleBlocks: Block[] = [
  {
    slug: 'text',
    labels: { singular: 'Text', plural: 'Text' },
    fields: [{ name: 'content', type: 'richText', required: true }],
  },
  {
    slug: 'step',
    labels: { singular: 'Step', plural: 'Steps' },
    admin: { disableBlockName: true },
    fields: [
      { name: 'title', type: 'text', required: true },
      tocLabel,
      { name: 'content', type: 'richText' },
      {
        name: 'products',
        type: 'array',
        admin: {
          description:
            'Products used in this step. They’re listed in “Shop this routine” beside the article.',
        },
        fields: [
          { name: 'product', type: 'relationship', relationTo: 'products', required: true },
          {
            name: 'note',
            type: 'textarea',
            admin: { description: 'Why it’s recommended — shown in the “We recommend” box.' },
          },
        ],
      },
      {
        name: 'showRecommendation',
        label: 'Show a “We recommend” box under this step',
        type: 'checkbox',
      },
    ],
  },
  {
    slug: 'quote',
    labels: { singular: 'Pull quote', plural: 'Pull quotes' },
    fields: [{ name: 'text', type: 'textarea', required: true }],
  },
  {
    slug: 'callout',
    labels: { singular: 'Callout', plural: 'Callouts' },
    admin: { disableBlockName: true },
    fields: [
      {
        name: 'eyebrow',
        type: 'text',
        admin: { description: 'e.g. “When should your next wash be?”' },
      },
      { name: 'text', type: 'textarea', required: true },
      {
        name: 'icon',
        type: 'select',
        defaultValue: 'calendar',
        options: [
          { label: 'Calendar', value: 'calendar' },
          { label: 'Clock', value: 'clock' },
          { label: 'Info', value: 'info' },
        ],
      },
      tocLabel,
    ],
  },
  {
    slug: 'advice',
    labels: { singular: 'Pro advice', plural: 'Pro advice' },
    admin: { disableBlockName: true },
    fields: [
      { name: 'eyebrow', type: 'text', defaultValue: 'Pro advice' },
      { name: 'text', type: 'textarea', required: true },
      tocLabel,
    ],
  },
]
