import type { CollectionConfig, FieldHook } from 'payload'

import { adminOnly, adminOnlyFieldAccess, adminOrSelf, publicAccess } from '@/access'
import { checkRole } from '@/access/utilities'

/** The very first account created becomes an admin automatically. */
const ensureFirstUserIsAdmin: FieldHook = async ({ operation, req, value }) => {
  if (operation === 'create') {
    // A one-document lookup rather than count(): an unfiltered count is MongoDB's estimated
    // count, which isn't allowed inside the transaction user creation runs in (e.g. on Atlas)
    const { docs } = await req.payload.find({
      collection: 'users',
      limit: 1,
      pagination: false,
      depth: 0,
      select: {},
      req,
    })
    if (docs.length === 0) return ['admin']
  }
  return value
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14, // 14 days
  },
  admin: {
    group: 'Users',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles'],
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess, // customers can register on the storefront
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
    unlock: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['customer'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
    },
  ],
}
