import type { Metadata } from 'next'
import { Bodoni_Moda, Instrument_Serif, Inter, Righteous } from 'next/font/google'
import type { ReactNode } from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer, Header } from '@/components/layout'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { Providers } from '@/components/providers'
import { siteConfig } from '@/config/site'
import { getCatalog, getCheckoutSettings, getShopNav } from '@/lib/queries/shop'
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
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [shopLinks, catalog, checkout] = await Promise.all([
    getShopNav(),
    getCatalog(),
    getCheckoutSettings(),
  ])

  return (
    <html
      lang="en"
      className={cn(sans.variable, display.variable, heading.variable, serif.variable)}
    >
      <body>
        <Providers>
          <Header />
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
