import type { MetadataRoute } from 'next'

import { allowIndexing, siteConfig } from '@/config/site'

/** /robots.txt — everything is off limits until ALLOW_INDEXING=true; the admin and API always are. */
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/cart'] },
    host: siteConfig.url,
  }
}
