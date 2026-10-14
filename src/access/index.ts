/**
 * Reusable access-control functions.
 * Kept in one file so collections and the ecommerce plugin share the same rules.
 */
import type { Access, FieldAccess } from 'payload'

import { checkRole } from './utilities'

/** Anyone, including guests. */
export const publicAccess: Access = () => true

/** Signed-in users only. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Admins only (collection level). */
export const adminOnly: Access = ({ req: { user } }) => checkRole(['admin'], user)
export const isAdmin = adminOnly

/** Admins only (field level). */
export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) =>
  checkRole(['admin'], user)

/** Customers only (field level). */
export const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) =>
  checkRole(['customer'], user)

/** Admins see everything; everyone else only sees their own user document. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (checkRole(['admin'], user)) return true
  if (user?.id) return { id: { equals: user.id } }
  return false
}

/** Admins see drafts; the public only sees published documents. */
export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (checkRole(['admin'], user)) return true
  return { _status: { equals: 'published' } }
}

/** Admins see everything; customers only see documents they own (orders, carts, addresses). */
export const isDocumentOwner: Access = ({ req: { user } }) => {
  if (checkRole(['admin'], user)) return true
  if (user?.id) return { customer: { equals: user.id } }
  return false
}
