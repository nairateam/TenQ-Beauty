import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

const isEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

/** Newsletter sign-ups from the footer and the journal. Only admins can see the list. */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    group: 'Content',
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'createdAt'],
    description: 'People who signed up for hair notes and offers.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  endpoints: [
    {
      // POST /api/subscribers/subscribe  { email, source }
      // Signing up twice is fine: the existing entry is kept and it still reports success
      path: '/subscribe',
      method: 'post',
      handler: async (req) => {
        const body = (await req.json?.().catch(() => null)) as {
          email?: unknown
          source?: unknown
        } | null
        if (!isEmail(body?.email)) {
          return Response.json({ message: 'Enter a valid email address.' }, { status: 400 })
        }
        const email = body.email.trim().toLowerCase()
        const source = body.source === 'journal' ? 'journal' : 'footer'
        const existing = await req.payload.find({
          collection: 'subscribers',
          where: { email: { equals: email } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (!existing.docs.length) {
          await req.payload.create({
            collection: 'subscribers',
            data: { email, source },
            overrideAccess: true,
          })
        }
        return Response.json({ subscribed: true })
      },
    },
  ],
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'footer',
      options: [
        { label: 'Footer', value: 'footer' },
        { label: 'Journal', value: 'journal' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
