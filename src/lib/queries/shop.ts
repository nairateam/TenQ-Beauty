import 'server-only'

import { cache } from 'react'

import { priceField } from '@/lib/currencies'
import { imageOf, isDoc } from '@/lib/media'
import { getPayload } from '@/lib/payload'
import { toNaira } from '@/lib/pricing'
import type {
  Product,
  ShippingMethod,
  ShopCollection as ShopCollectionDoc,
  StoreSetting,
  Variant,
  VariantOption,
} from '@/payload-types'
import type {
  FilterOption,
  ProductCardData,
  ProductDetail,
  ShopCollection,
  ShopProduct,
} from '@/types/product'

/*
 * Everything the shop, product, bag and checkout pages show, read from Payload.
 * Reads use overrideAccess: false, so drafts, unpublished sizes and hidden reviews stay out.
 */

/* ---------- Mapping helpers ---------- */

export { imageOf, isDoc }

const priceOf = (doc: Product | Variant) => {
  const value = (doc as unknown as Record<string, unknown>)[priceField]
  return typeof value === 'number' ? value : null
}

/** Published sizes with a price, cheapest first. */
function sizesOf(product: Product) {
  if (!product.enableVariants) return []
  return (product.variants?.docs ?? [])
    .filter(isDoc)
    .filter((v) => v._status !== 'draft' && priceOf(v) !== null)
    .map((v) => ({
      variantID: v.id,
      label:
        v.options
          ?.filter(isDoc)
          .map((o: VariantOption) => o.label)
          .join(' / ') ||
        v.title ||
        'Standard',
      price: toNaira(priceOf(v)),
      inStock: v.inventory !== 0,
    }))
    .sort((a, b) => a.price - b.price)
}

export function toProductCard(product: Product): ProductCardData {
  const sizes = sizesOf(product)
  // Cards add the cheapest size that's still in stock
  const cardSize = sizes.find((s) => s.inStock) ?? sizes[0]
  return {
    id: product.id,
    slug: product.slug ?? product.id,
    title: product.title,
    subtitle: product.subtitle ?? '',
    price: sizes[0]?.price ?? toNaira(priceOf(product)),
    fromPrice: sizes.length > 1,
    image: imageOf(product.image),
    badge: product.badge ?? undefined,
    variantID: cardSize?.variantID,
    // Empty stock means it isn't tracked; only 0 is sold out
    inStock: sizes.length ? sizes.some((s) => s.inStock) : product.inventory !== 0,
  }
}

const slugsOf = (refs: (string | { id: string; slug?: string | null })[] | null | undefined) =>
  (refs ?? []).filter(isDoc).flatMap((r) => (r.slug ? [r.slug] : []))

function toShopProduct(product: Product): ShopProduct {
  return {
    ...toProductCard(product),
    kind: product.kind,
    collections: slugsOf(product.shopCollections),
    concerns: slugsOf(product.concerns),
    hairTypes: slugsOf(product.hairTypes),
    added: new Date(product.releasedAt ?? product.createdAt).getTime(),
    popularity: product.popularity ?? 100,
  }
}

/* ---------- Queries ---------- */

/** Every published product plus the collections and filters the shop offers. */
export const getCatalog = cache(async () => {
  const payload = await getPayload()
  const [products, collectionDocs, concerns, hairTypes] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 2,
      pagination: false,
      sort: ['popularity', 'title'],
      overrideAccess: false,
    }),
    payload.find({
      collection: 'shop-collections',
      depth: 1,
      pagination: false,
      overrideAccess: false,
    }),
    payload.find({ collection: 'concerns', depth: 0, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'hair-types', depth: 0, pagination: false, overrideAccess: false }),
  ])

  const shopProducts = products.docs.map(toShopProduct)
  const toOption = (d: { slug?: string | null; label: string }): FilterOption[] =>
    d.slug ? [{ value: d.slug, label: d.label }] : []

  return {
    products: shopProducts,
    collections: collectionDocs.docs.flatMap((c) => toShopCollection(c, shopProducts)),
    concerns: concerns.docs.flatMap(toOption),
    hairTypes: hairTypes.docs.flatMap(toOption),
  }
})

function toShopCollection(doc: ShopCollectionDoc, products: ShopProduct[]): ShopCollection[] {
  if (!doc.slug) return []
  const inside = products.filter((p) => p.collections.includes(doc.slug!))
  return [
    {
      slug: doc.slug,
      name: doc.name,
      eyebrow: doc.eyebrow ?? `${doc.name} collection`,
      headline: doc.headline,
      description: doc.description ?? '',
      productCount: inside.length,
      fromPrice: inside.length ? Math.min(...inside.map((p) => p.price)) : 0,
      image: imageOf(doc.image, 'hero', doc.imagePosition),
    },
  ]
}

export const getStoreSettings = cache(async (): Promise<StoreSetting> => {
  const payload = await getPayload()
  return payload.findGlobal({ slug: 'store-settings', depth: 1, overrideAccess: false })
})

/** The shop page intro and the promo tile, with live counts filled in. */
export async function getShopPage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getStoreSettings()])
  const description = (settings.shopDescription ?? '')
    .replaceAll('{products}', String(catalog.products.length))
    .replaceAll('{collections}', String(catalog.collections.length))

  const tile = settings.promoTile
  const tileProduct = isDoc(tile?.product)
    ? catalog.products.find((p) => p.id === (tile.product as Product).id)
    : undefined
  const ctaCollection = isDoc(tile?.ctaCollection) ? tile.ctaCollection.slug : undefined

  return {
    ...catalog,
    title: settings.shopTitle,
    description,
    promo: tileProduct
      ? {
          eyebrow: tile?.eyebrow ?? '',
          headline: tile?.headline ?? '',
          name: tileProduct.title,
          price: tileProduct.price,
          fromPrice: tileProduct.fromPrice,
          href: `/shop/${tileProduct.slug}`,
          // Shown on "All" and on the collections the product belongs to
          collections: tileProduct.collections,
          cta: ctaCollection
            ? { label: tile?.ctaLabel || 'Shop now', collection: ctaCollection }
            : null,
          image: isDoc(tile?.image) ? imageOf(tile.image) : tileProduct.image,
        }
      : null,
  }
}

export type ShopPromo = NonNullable<Awaited<ReturnType<typeof getShopPage>>['promo']>

/** "Shop all" plus the first few collections, for the footer. */
export const getShopNav = cache(async () => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'shop-collections',
    depth: 0,
    limit: 4,
    select: { name: true, slug: true },
    overrideAccess: false,
  })
  return [
    { label: 'Shop all', href: '/shop' },
    ...docs.flatMap((c) =>
      c.slug ? [{ label: c.name, href: `/shop?collection=${c.slug}#products` }] : [],
    ),
  ]
})

/** Slugs of every published product, for static generation. */
export async function getProductSlugs() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    depth: 0,
    pagination: false,
    select: { slug: true },
    overrideAccess: false,
  })
  return docs.flatMap((d) => (d.slug ? [d.slug] : []))
}

/** Everything a product page shows, or null when no published product has this slug. */
export const getProductDetail = cache(async (slug: string): Promise<ProductDetail | null> => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  const doc = docs[0]
  if (!doc) return null

  const [reviews, catalog, settings] = await Promise.all([
    payload.find({
      collection: 'reviews',
      where: { product: { equals: doc.id } },
      sort: 'date',
      depth: 0,
      pagination: false,
      overrideAccess: false,
    }),
    getCatalog(),
    getStoreSettings(),
  ])

  const product = catalog.products.find((p) => p.id === doc.id) ?? toShopProduct(doc)
  const collection = catalog.collections.find((c) => c.slug === product.collections[0])
  const sizes = sizesOf(doc)
  const sizeLabel = (ref: Product['defaultVariant']) =>
    sizes.find((s) => s.variantID === (isDoc(ref) ? ref.id : ref))?.label

  const insideKey = doc.inside?.key ?? []
  const routineSteps = doc.routine?.steps ?? []
  const addOnRef = doc.addOn?.product
  const addOnProduct = addOnRef
    ? catalog.products.find((p) => p.id === (isDoc(addOnRef) ? addOnRef.id : addOnRef))
    : undefined

  return {
    product,
    collection: collection && {
      slug: collection.slug,
      name: collection.name,
      eyebrow: collection.eyebrow,
    },
    label: doc.label ?? undefined,
    tagline: doc.tagline ?? '',
    reviews: reviews.docs.map((r) => ({
      name: r.name,
      date: r.date.slice(0, 10),
      rating: r.rating,
      text: r.text,
    })),
    inside: insideKey.length
      ? {
          title: doc.inside?.title ?? '',
          note: doc.inside?.note ?? [],
          key: insideKey.map((k) => ({ name: k.name, latin: k.latin ?? '', text: k.text })),
          also: doc.inside?.also ?? [],
        }
      : undefined,
    routine: routineSteps.length
      ? {
          title: doc.routine?.title ?? '',
          image: isDoc(doc.routine?.image)
            ? imageOf(doc.routine.image, 'hero')
            : imageOf(doc.image, 'hero'),
          steps: routineSteps.map((s) => ({ title: s.title, text: s.text })),
        }
      : undefined,
    gallery: [
      imageOf(doc.image, 'original'),
      ...(doc.gallery ?? []).map((g) => imageOf(g.image, 'original')),
    ].filter((img) => img.src),
    sizes,
    defaultSize: sizeLabel(doc.defaultVariant) ?? sizes[0]?.label,
    bestValue: sizeLabel(doc.bestValueVariant),
    benefits: (doc.benefits ?? []).map((b) => ({ icon: b.icon, text: b.text })),
    freeFrom: doc.freeFrom ?? [],
    description: doc.description ?? '',
    howToUse: (doc.howToUse ?? []).map((s) => s.step),
    ingredients: doc.ingredients ?? '',
    addOn:
      addOnProduct && addOnProduct.id !== doc.id
        ? {
            product: addOnProduct,
            title: doc.addOn?.title ?? `Add ${addOnProduct.title}`,
            note: doc.addOn?.note ?? '',
          }
        : undefined,
    deliveryAndReturns: settings.deliveryAndReturns ?? [],
    assurances: (settings.assurances ?? []).map((a) => ({ icon: a.icon, text: a.text })),
  }
})

/* ---------- Checkout ---------- */

export type ShippingOption = Pick<
  ShippingMethod,
  'id' | 'title' | 'countries' | 'countriesRule' | 'states' | 'statesRule'
> & { note: string; price: number | null }

/** Active shipping methods in sort order; `price` is naira, or null when quoted later. */
export async function getShippingOptions(): Promise<ShippingOption[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'shipping-methods',
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs.map((m) => ({
    id: m.id,
    title: m.title,
    note: m.note ?? '',
    price: typeof m.price === 'number' ? toNaira(m.price) : null,
    countries: m.countries ?? [],
    countriesRule: m.countriesRule ?? 'only',
    states: m.states ?? [],
    statesRule: m.statesRule ?? 'only',
  }))
}

/** Copy and links the bag and checkout show, from Store settings. */
export async function getCheckoutSettings() {
  const settings = await getStoreSettings()
  const number = (settings.whatsappNumber ?? '').replace(/\D/g, '')
  const greeting = settings.whatsappGreeting?.trim()
  return {
    whatsappHref: number ? `https://wa.me/${number}` : null,
    /** The floating support button opens the chat with the greeting already typed */
    whatsappChatHref: number
      ? `https://wa.me/${number}${greeting ? `?text=${encodeURIComponent(greeting)}` : ''}`
      : null,
    bagPaymentNote: settings.bagPaymentNote ?? '',
    drawerNote: settings.drawerNote ?? '',
    checkoutPaymentNote: settings.checkoutPaymentNote ?? '',
    trustPoints: (settings.trustPoints ?? []).map((t) => ({ icon: t.icon, text: t.text })),
  }
}

export type CheckoutSettings = Awaited<ReturnType<typeof getCheckoutSettings>>
