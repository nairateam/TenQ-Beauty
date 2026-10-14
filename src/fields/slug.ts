import type { Field, FieldHook } from 'payload'

export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Fills the slug from another field (default: title) when left empty. */
const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.length > 0) return formatSlug(value)
    const source = data?.[fallback]
    if (typeof source === 'string') return formatSlug(source)
    return value
  }

export const slugField = (fieldToUse = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: `Auto-generated from "${fieldToUse}" if left empty.`,
  },
  hooks: {
    beforeValidate: [formatSlugHook(fieldToUse)],
  },
})
