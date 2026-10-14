/**
 * The site's public address: NEXT_PUBLIC_SERVER_URL when set, otherwise the production domain
 * Vercel provides, otherwise local development.
 */
export function serverURL() {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  return vercel ? `https://${vercel}` : 'http://localhost:3000'
}

/** Search engines may list the site only when ALLOW_INDEXING=true — off for previews. */
export const allowIndexing = process.env.ALLOW_INDEXING === 'true'

/** Site-wide settings and navigation. Edit here, not inside components. */
export const siteConfig = {
  name: 'Ten-Q Beauty',
  tagline: 'Beauty',
  description:
    'Science-backed hair care made with natural African botanicals — for kinks, coils, curls, TWAs and locs.',
  url: serverURL(),
}

export type NavItem = {
  label: string
  href: string
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
]

export const accountNav: NavItem[] = [{ label: 'Account', href: '/account' }]
