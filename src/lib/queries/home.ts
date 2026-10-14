import 'server-only'

import { getPayload } from '@/lib/payload'
import type { Product, Testimonial as TestimonialDoc } from '@/payload-types'
import type {
  ConcernWithKits,
  Kit,
  ProductCardData,
  RoutineStep,
  Testimonial,
} from '@/types/product'

import { imageOf, isDoc, toProductCard } from './shop'

export type HomeData = {
  bestsellers: ProductCardData[]
  routine: RoutineStep[]
  concerns: ConcernWithKits[]
  rating: string
  testimonials: Testimonial[]
}

/** Homepage content from the Payload "Homepage" global, mapped to the shapes the sections render. */
export async function getHomeData(): Promise<HomeData> {
  const payload = await getPayload()
  // overrideAccess: false so unpublished products/reviews are left out like they are for visitors.
  // Depth 3 reaches each product's sizes (product → variants → options).
  const home = await payload.findGlobal({ slug: 'homepage', depth: 3, overrideAccess: false })

  return {
    bestsellers: (home.bestsellers ?? []).filter(isDoc).map(toProductCard),
    routine: (home.routine ?? []).flatMap((r) =>
      isDoc(r.product)
        ? [
            {
              step: r.step,
              product: r.product.title,
              href: `/shop/${r.product.slug ?? r.product.id}`,
              text: r.text,
              image: imageOf(r.product.image, 'hero').src,
            },
          ]
        : [],
    ),
    concerns: (home.concerns ?? [])
      .map((c, i) => ({
        id: c.id ?? `concern-${i}`,
        label: c.label,
        kits: c.kits.filter(isDoc).map(toKit),
      }))
      .filter((c) => c.kits.length > 0),
    rating: home.rating ?? '',
    testimonials: (home.testimonials ?? []).filter(isDoc).flatMap(toTestimonial),
  }
}

function toKit(product: Product): Kit {
  const card = toProductCard(product)
  return {
    slug: card.slug,
    name: card.title,
    tagline: product.subtitle ?? product.tagline ?? '',
    price: card.price,
    fromPrice: card.fromPrice,
    image: imageOf(product.image, 'hero'),
  }
}

function toTestimonial(doc: TestimonialDoc): Testimonial[] {
  if (!isDoc(doc.product)) return [] // linked product is unpublished
  const product = toProductCard(doc.product)
  return [
    {
      headline: doc.headline,
      quote: doc.quote,
      name: doc.name,
      meta: doc.meta ?? '',
      avatar: {
        src: imageOf(doc.avatar, 'thumbnail').src,
        position: doc.avatarPosition ?? undefined,
      },
      product: {
        name: product.title,
        price: product.price,
        fromPrice: product.fromPrice,
        href: `/shop/${product.slug}`,
        image: imageOf(doc.product.image, 'thumbnail').src,
      },
    },
  ]
}
