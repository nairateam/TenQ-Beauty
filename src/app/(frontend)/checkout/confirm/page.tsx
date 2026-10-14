import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConfirmView } from '@/components/checkout/ConfirmView'
import { getCheckoutSettings } from '@/lib/queries/shop'

export const metadata: Metadata = {
  title: 'Order confirmation',
  robots: { index: false },
}

export default async function ConfirmPage() {
  const { whatsappHref } = await getCheckoutSettings()
  return (
    // Reads ?reference= from the URL Paystack returns to
    <Suspense>
      <ConfirmView whatsappHref={whatsappHref} />
    </Suspense>
  )
}
