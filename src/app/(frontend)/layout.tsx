import type { Metadata } from 'next'
import { Bodoni_Moda, Instrument_Serif, Inter, Righteous } from 'next/font/google'
import type { ReactNode } from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer, Header } from '@/components/layout'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { Providers } from '@/components/providers'
import { allowIndexing, siteConfig } from '@/config/site'
import { getCatalog, getCheckoutSettings, getShopNav, getStoreSettings } from '@/lib/queries/shop'
import { cn } from '@/lib/utils'

import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-inter' })
const display = Bodoni_Moda({ subsets: ['latin'], weight: ['700'], variable: '--font-bodoni' })
// Closest Google match to the Ten-Q wordmark lettering; used for every heading/title
const heading = Righteous({ subsets: ['latin'], weight: '400', variable: '--font-righteous' })
// Italic serif for pull quotes and signatures
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Kept out of search engines until ALLOW_INDEXING=true (e.g. while it's a preview)
  robots: allowIndexing ? undefined : { index: false, follow: false },
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [shopLinks, catalog, checkout, settings] = await Promise.all([
    getShopNav(),
    getCatalog(),
    getCheckoutSettings(),
    getStoreSettings(),
  ])
  const announcements = (settings.announcements ?? []).filter(Boolean)

  return (
    <html
      lang="en"
      className={cn(
        sans.variable,
        display.variable,
        heading.variable,
        serif.variable,
        // Makes room for the announcement bar in --header-height
        announcements.length > 0 && 'has-announcement',
      )}
    >
      <body>
        <Providers>
          <Header announcements={announcements} />
          {/* No top padding: the header overlays full-bleed heroes. */}
          <main className="min-h-dvh">{children}</main>
          <Footer shopLinks={shopLinks} />
          <FloatingActions whatsappHref={checkout.whatsappChatHref} />
          {/* Outside the header: its slide-away transform would trap a fixed panel */}
          <CartDrawer products={catalog.products} settings={checkout} />
        </Providers>
      </body>
    </html>
  )
}
