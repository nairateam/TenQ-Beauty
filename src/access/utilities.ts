export type Role = 'admin' | 'customer'

/** Minimal user shape so this works before `payload-types.ts` is generated. */
type UserWithRoles = { roles?: (string | null)[] | null } | null | undefined

/** Returns true if the user has at least one of the given roles. */
export const checkRole = (allowed: Role[], user?: UserWithRoles | object | null): boolean => {
  const roles = (user as UserWithRoles)?.roles
  if (!Array.isArray(roles)) return false
  return roles.some((role) => allowed.includes(role as Role))
}
