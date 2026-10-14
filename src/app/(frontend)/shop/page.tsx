import type { Metadata } from 'next'
import { Suspense } from 'react'

import { BrandPromises } from '@/components/home/BrandPromises'
import { CollectionsHero } from '@/components/shop/CollectionsHero'
import { ProductListing } from '@/components/shop/ProductListing'
import { getShopPage } from '@/lib/queries/shop'

export const metadata: Metadata = { title: 'Shop' }

// Re-read Payload content at most once a minute
export const revalidate = 60

export default async function ShopPage() {
  const { title, description, collections, products, concerns, hairTypes, promo } =
    await getShopPage()

  return (
    <>
      <CollectionsHero title={title} description={description} collections={collections} />
      {/* Reads ?collection= and ?sort= from the URL */}
      <Suspense>
        <ProductListing
          products={products}
          collections={collections}
          concerns={concerns}
          hairTypes={hairTypes}
          promo={promo}
        />
      </Suspense>
      <BrandPromises />
    </>
  )
}
