import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BrandPromises } from '@/components/home/BrandPromises'
import { ProductView } from '@/components/product/ProductView'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { Reviews } from '@/components/product/Reviews'
import { Routine } from '@/components/product/Routine'
import { WhatsInside } from '@/components/product/WhatsInside'
import { getCatalog, getProductDetail, getProductSlugs } from '@/lib/queries/shop'

type Props = { params: Promise<{ slug: string }> }

// Re-read Payload content at most once a minute; new products are rendered on first visit
export const revalidate = 60

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getProductDetail((await params).slug)
  if (!detail) return {}
  return {
    title: detail.product.title,
    description: detail.tagline,
    openGraph: { images: detail.gallery[0] ? [detail.gallery[0].src] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  const [detail, catalog] = await Promise.all([
    getProductDetail((await params).slug),
    getCatalog(),
  ])
  if (!detail) notFound()

  return (
    <>
      <ProductView detail={detail} />
      {detail.inside && <WhatsInside inside={detail.inside} />}
      {detail.routine && <Routine routine={detail.routine} />}
      <Reviews reviews={detail.reviews} />
      <RelatedProducts
        product={detail.product}
        products={catalog.products}
        collections={catalog.collections}
      />
      <BrandPromises />
    </>
  )
}
