import type { Metadata } from 'next'

import { CheckoutView } from '@/components/checkout/CheckoutView'
import { getCheckoutSettings, getShippingOptions } from '@/lib/queries/shop'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
}

export const revalidate = 60

export default async function CheckoutPage() {
  const [shippingOptions, settings] = await Promise.all([
    getShippingOptions(),
    getCheckoutSettings(),
  ])
  return <CheckoutView shippingOptions={shippingOptions} settings={settings} />
}
