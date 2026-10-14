import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { adminOnly, adminOrPublishedStatus } from '@/access'
import { slugField } from '@/fields/slug'

import { articleBlocks } from './articleBlocks'

const WORDS_PER_MINUTE = 200

/** Every `text` and `title` string inside the article body: rich text, steps, quotes, callouts. */
function textOf(node: unknown): string {
  if (Array.isArray(node)) return node.map(textOf).join(' ')
  if (!node || typeof node !== 'object') return ''
  return Object.entries(node as Record<string, unknown>)
    .map(([key, value]) =>
      typeof value === 'string' ? (key === 'text' || key === 'title' ? value : '') : textOf(value),
    )
    .join(' ')
}

/** Fills in the reading time from the article's length unless an editor has set one. */
const estimateReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data.readingTime) return data
  const words = [
    textOf(data.body),
    data.standfirst ?? data.excerpt ?? '',
    ...((data.glossary ?? []) as { term?: string; definition?: string }[]).map(
      (g) => `${g.term ?? ''} ${g.definition ?? ''}`,
    ),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return { ...data, readingTime: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) }
}

/** Journal articles. Drafts are enabled so content can be prepared before publishing. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Journal' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'categories', 'publishedAt', 'featured', '_status'],
  },
  defaultSort: '-publishedAt',
  access: {
    read: adminOrPublishedStatus,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [estimateReadingTime],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: { description: 'One or two sentences for cards and the featured slot.' },
    },
    {
      name: 'standfirst',
      type: 'textarea',
      admin: {
        description: 'The line under the title on the article page. Defaults to the excerpt.',
      },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'coverCaption', type: 'text' },
    {
      name: 'body',
      type: 'blocks',
      blocks: articleBlocks,
      admin: {
        description:
          'Text, numbered steps (with the products they use), pull quotes, callouts and pro advice.',
      },
    },
    {
      name: 'glossary',
      label: 'A–Z glossary',
      type: 'array',
      admin: {
        description:
          'Optional. Terms listed A–Z at the end of the article; their letters become a jump index on the journal page.',
      },
      fields: [
        { name: 'term', type: 'text', required: true },
        { name: 'definition', type: 'textarea', required: true },
      ],
    },
    {
      name: 'relatedProducts',
      label: 'Products mentioned',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description:
          'Shown under the article, and in “From the page to your shelf” on the journal.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Shown at the end of the article, e.g. Wash day, Scalp care.' },
    },
    {
      name: 'author',
      type: 'group',
      admin: {
        description:
          'Leave empty to credit the journal team (set on the Journal page). Fill in for a guest or named author.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', admin: { width: '70%' } },
            { name: 'initials', type: 'text', maxLength: 3, admin: { width: '30%' } },
          ],
        },
        { name: 'bio', type: 'textarea' },
      ],
    },
    slugField(),
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar', description: 'The first is shown on cards.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'readingTime',
      label: 'Reading time (minutes)',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Worked out from the article’s length if left empty.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Lead the journal with this article. The newest featured one is used.',
      },
    },
    {
      name: 'featuredLabel',
      type: 'text',
      defaultValue: 'Featured',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.featured),
        description: 'The tag on the featured slot, e.g. “Featured guide”.',
      },
    },
  ],
}
