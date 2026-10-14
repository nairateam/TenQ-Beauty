import type { Metadata } from 'next'

import { CartView } from '@/components/cart/CartView'
import { PairsWell } from '@/components/cart/PairsWell'
import { getCatalog, getCheckoutSettings } from '@/lib/queries/shop'

export const metadata: Metadata = { title: 'Your Bag' }

export const revalidate = 60

export default async function CartPage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getCheckoutSettings()])

  return (
    <>
      <CartView settings={settings} />
      <PairsWell products={catalog.products} collections={catalog.collections} />
    </>
  )
}
