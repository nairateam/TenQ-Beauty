/**
 * Loads the store's starting content into Payload: images, collections, filters, products
 * (with sizes as variants), kits, reviews, testimonials, shipping methods, the launch promo
 * code, the Homepage global and Store settings. The content lives in ./data and is only
 * read here — the site itself reads everything from Payload.
 *
 * Safe to re-run: existing docs are matched by slug / code / title and updated, not duplicated.
 *
 *   pnpm seed
 */
import path from 'path'

import config from '@payload-config'
import { getPayload, type CollectionSlug, type Payload, type Where } from 'payload'

import { bestsellers } from './data/bestsellers'
import { collections, shopIntro } from './data/collections'
import { concerns, kits } from './data/concerns'
import { articleBodies, journalAuthor } from './data/articleBodies'
import { articles, journalCategories, journalPage } from './data/journal'
import { defaultFreeFrom, deliveryAndReturns, details } from './data/products'
import { concernOptions, hairTypeOptions, routinePromo, shopProducts } from './data/shop'
import { routine } from './data/routine'
import { rating, testimonials } from './data/testimonials'

const publicDir = path.resolve(process.cwd(), 'public')
const kobo = (naira: number) => Math.round(naira * 100)
const day = 24 * 60 * 60 * 1000

async function seed() {
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

  /* Media — one upload per public image, reused everywhere */
  const mediaIds = new Map<string, string>()
  async function media(src: string, alt: string) {
    if (mediaIds.has(src)) return mediaIds.get(src)!
    const filename = path.basename(src)
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    const id =
      existing.docs[0]?.id ??
      (
        await payload.create({
          collection: 'media',
          data: { alt },
          filePath: path.join(publicDir, src),
        })
      ).id
    mediaIds.set(src, id)
    return id
  }

  /* Collections, concerns and hair types */
  const collectionIds = new Map<string, string>()
  for (const [i, c] of collections.entries()) {
    const id = await upsert(
      payload,
      'shop-collections',
      { slug: { equals: c.slug } },
      {
        name: c.name,
        slug: c.slug,
        eyebrow: c.eyebrow,
        headline: c.headline,
        description: c.description,
        image: await media(c.image.src, c.image.alt),
        imagePosition: c.image.position ?? null,
        sortOrder: i,
      },
    )
    collectionIds.set(c.slug, id)
  }
  log(`${collections.length} collections`)

  const concernIds = new Map<string, string>()
  for (const [i, c] of concernOptions.entries()) {
    concernIds.set(
      c.value,
      await upsert(
        payload,
        'concerns',
        { slug: { equals: c.value } },
        {
          label: c.label,
          slug: c.value,
          sortOrder: i,
        },
      ),
    )
  }
  const hairTypeIds = new Map<string, string>()
  for (const [i, h] of hairTypeOptions.entries()) {
    hairTypeIds.set(
      h.value,
      await upsert(
        payload,
        'hair-types',
        { slug: { equals: h.value } },
        {
          label: h.label,
          slug: h.value,
          sortOrder: i,
        },
      ),
    )
  }
  log(`${concernOptions.length} concerns, ${hairTypeOptions.length} hair types`)

  /* Products — the shop catalogue, then the kits that only the homepage used to list */
  const subtitles = new Map(bestsellers.map((b) => [b.slug, b.subtitle]))
  const kitList = Object.values(kits)
  const productIds = new Map<string, string>()
  const releaseBase = Date.UTC(2025, 0, 1)

  type ProductSeed = {
    slug: string
    title: string
    kind: 'product' | 'kit'
    subtitle?: string
    price: number
    badge?: string
    image: { src: string; alt: string }
    collections: string[]
    concerns: string[]
    hairTypes: string[]
    popularity: number
    added: number
  }

  const allProducts: ProductSeed[] = [
    ...shopProducts.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      kind: (p.slug.endsWith('-kit') ? 'kit' : 'product') as ProductSeed['kind'],
      subtitle: subtitles.get(p.slug),
      price: p.price,
      badge: p.badge,
      image: p.image,
      collections: p.collections,
      concerns: p.concerns,
      hairTypes: p.hairTypes,
      popularity: i + 1,
      added: p.added,
    })),
    ...kitList
      .filter((k) => !shopProducts.some((p) => p.slug === k.slug))
      .map((k, i) => ({
        slug: k.slug,
        title: k.name,
        kind: 'kit' as const,
        subtitle: k.tagline,
        price: k.price,
        image: k.image,
        collections: ['combos'],
        concerns: [],
        hairTypes: hairTypeOptions.map((h) => h.value),
        popularity: shopProducts.length + i + 1,
        added: 0,
      })),
  ]

  for (const p of allProducts) {
    const detail = details[p.slug]
    const kit = kitList.find((k) => k.slug === p.slug)
    const data = {
      title: p.title,
      slug: p.slug,
      kind: p.kind,
      subtitle: p.subtitle ?? kit?.tagline ?? null,
      badge: p.badge ?? null,
      popularity: p.popularity,
      releasedAt: new Date(releaseBase + p.added * 7 * day).toISOString(),
      image: await media(p.image.src, p.image.alt),
      shopCollections: p.collections.map((slug) => collectionIds.get(slug)!).filter(Boolean),
      concerns: p.concerns.map((slug) => concernIds.get(slug)!).filter(Boolean),
      hairTypes: p.hairTypes.map((slug) => hairTypeIds.get(slug)!).filter(Boolean),
      priceInNGNEnabled: true,
      priceInNGN: kobo(p.price),
      inventory: null, // stock not tracked
      tagline:
        detail?.tagline ??
        kit?.tagline ??
        `${p.title}, made with natural African botanicals for kinks, coils and curls.`,
      description:
        detail?.description ??
        'Science-backed and made with natural African botanicals. Full product details are coming soon — message us on WhatsApp with any questions.',
      freeFrom: detail?.freeFrom ?? defaultFreeFrom,
      howToUse: (detail?.howToUse ?? ['Follow the directions on the pack.']).map((step) => ({
        step,
      })),
      ingredients: detail?.ingredients ?? 'Full ingredient list coming soon.',
      label: detail?.label ?? (p.badge && !p.badge.endsWith('★') ? p.badge : null),
      benefits: detail?.benefits ?? [],
      gallery: detail
        ? await Promise.all(
            detail.gallery.slice(1).map(async (g) => ({ image: await media(g.src, g.alt) })),
          )
        : [],
      inside: detail?.inside
        ? {
            title: detail.inside.title,
            note: detail.inside.note,
            key: detail.inside.key,
            also: detail.inside.also,
          }
        : {},
      routine: detail?.routine
        ? {
            title: detail.routine.title,
            image: await media(detail.routine.image.src, detail.routine.image.alt),
            steps: detail.routine.steps,
          }
        : {},
      _status: 'published' as const,
    }
    productIds.set(p.slug, await upsertProduct(payload, p.slug, data))
  }
  log(`${allProducts.length} products and kits`)

  /* Sizes (variants) and add-ons, now every product exists */
  const sizeType = await upsert(
    payload,
    'variantTypes',
    { name: { equals: 'size' } },
    {
      name: 'size',
      label: 'Size',
    },
  )
  const optionIds = new Map<string, string>()
  async function sizeOption(label: string) {
    if (!optionIds.has(label)) {
      optionIds.set(
        label,
        await upsert(
          payload,
          'variantOptions',
          {
            and: [
              { variantType: { equals: sizeType } },
              { value: { equals: label.toLowerCase() } },
            ],
          },
          { variantType: sizeType, label, value: label.toLowerCase() },
        ),
      )
    }
    return optionIds.get(label)!
  }

  for (const [slug, detail] of Object.entries(details)) {
    const productID = productIds.get(slug)
    if (!productID) continue
    const variantIds = new Map<string, string>()
    for (const size of detail.sizes) {
      const option = await sizeOption(size.label)
      variantIds.set(
        size.label,
        // Matched on product + size: the plugin rewrites variant titles on save
        await upsert(
          payload,
          'variants',
          { and: [{ product: { equals: productID } }, { options: { in: [option] } }] },
          {
            product: productID,
            options: [option],
            priceInNGNEnabled: true,
            priceInNGN: kobo(size.price),
            inventory: null,
            _status: 'published',
          },
        ),
      )
    }
    await payload.update({
      collection: 'products',
      id: productID,
      data: {
        ...(detail.sizes.length
          ? {
              enableVariants: true,
              variantTypes: [sizeType],
              priceInNGN: kobo(Math.min(...detail.sizes.map((s) => s.price))),
              defaultVariant: detail.defaultSize ? variantIds.get(detail.defaultSize) : undefined,
              bestValueVariant: detail.bestValue ? variantIds.get(detail.bestValue) : undefined,
            }
          : {}),
        ...(detail.addOn
          ? {
              addOn: {
                product: productIds.get(detail.addOn.slug),
                title: detail.addOn.title,
                note: detail.addOn.note,
              },
            }
          : {}),
        _status: 'published',
      },
      draft: false,
    })

    for (const r of detail.reviews) {
      await upsert(
        payload,
        'reviews',
        { and: [{ product: { equals: productID } }, { name: { equals: r.name } }] },
        {
          product: productID,
          name: r.name,
          rating: r.rating,
          text: r.text,
          date: r.date,
          status: 'approved',
        },
      )
    }
  }
  log('sizes, add-ons and reviews')

  /* Testimonials — linked to products by their /shop/<slug> href */
  const testimonialIds: string[] = []
  for (const t of testimonials) {
    const productSlug = t.product.href.split('/').pop()!
    const productId = productIds.get(productSlug)
    if (!productId)
      throw new Error(`Testimonial "${t.headline}" links to unknown product ${productSlug}`)
    testimonialIds.push(
      await upsert(
        payload,
        'testimonials',
        { headline: { equals: t.headline } },
        {
          headline: t.headline,
          quote: t.quote,
          name: t.name,
          meta: t.meta,
          avatar: await media(t.avatar.src, `${t.name} — customer photo`),
          avatarPosition: t.avatar.position ?? null,
          product: productId,
        },
      ),
    )
  }
  log(`${testimonialIds.length} testimonials`)

  /* Shipping and promo codes */
  const shipping = [
    {
      title: 'Within Lagos',
      note: '1–3 working days',
      price: kobo(3000),
      countriesRule: 'only',
      countries: ['NG'],
      statesRule: 'only',
      states: ['Lagos'],
    },
    {
      title: 'Other Nigerian states',
      note: '3–7 working days',
      price: kobo(5500),
      countriesRule: 'only',
      countries: ['NG'],
      statesRule: 'except',
      states: ['Lagos'],
    },
    {
      title: 'International',
      note: 'Rates calculated by country',
      price: null,
      countriesRule: 'except',
      countries: ['NG'],
      statesRule: 'only',
      states: [],
    },
  ]
  for (const [i, s] of shipping.entries()) {
    await upsert(
      payload,
      'shipping-methods',
      { title: { equals: s.title } },
      {
        ...s,
        active: true,
        sortOrder: i,
      },
    )
  }
  await upsert(
    payload,
    'promo-codes',
    { code: { equals: 'HAIRRESS' } },
    {
      code: 'HAIRRESS',
      label: '5% off first order',
      discountType: 'percent',
      percent: 5,
      active: true,
    },
  )
  log(`${shipping.length} shipping methods, 1 promo code`)

  /* Globals */
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      bestsellers: bestsellers.map((p) => productIds.get(p.slug)!),
      routine: routine.map((r) => ({
        step: r.step,
        product: productIds.get(r.slug)!,
        text: r.text,
      })),
      concerns: concerns.map((c) => ({
        label: c.label,
        kits: c.kits.map((key) => productIds.get(kits[key].slug)!),
      })),
      rating,
      testimonials: testimonialIds,
    },
  })

  await payload.updateGlobal({
    slug: 'store-settings',
    data: {
      shopTitle: shopIntro.title,
      shopDescription:
        'Science-backed formulas made with African botanicals — for kinks, coils, curls, TWAs and locs. {products} products across {collections} collections.',
      promoTile: {
        eyebrow: routinePromo.eyebrow,
        headline: routinePromo.headline,
        product: productIds.get(routinePromo.href.split('/').pop()!),
        image: await media(routinePromo.image.src, routinePromo.image.alt),
        ctaLabel: routinePromo.cta.label,
        ctaCollection: collectionIds.get(routinePromo.cta.collection),
      },
      deliveryAndReturns,
      assurances: [
        { icon: 'globe', text: 'Worldwide delivery' },
        { icon: 'badge', text: 'NAFDAC approved' },
        { icon: 'lock', text: 'Secure Paystack checkout' },
      ],
      bagPaymentNote: 'Pay securely with Paystack — card, transfer or USSD',
      drawerNote: 'First order? Use code HAIRRESS for 5% off at checkout.',
      whatsappGreeting: 'Hi Ten-Q, I’d like some help with',
      trustPoints: [
        { icon: 'globe', text: 'Worldwide delivery' },
        { icon: 'shield', text: 'NAFDAC-approved formulas' },
      ],
      checkoutPaymentNote:
        'After you click Pay, you’ll be taken to Paystack’s secure page to complete your payment, then returned here.',
    },
  })
  log('homepage and store settings')

  /* Journal */
  const categoryIds = new Map<string, string>()
  for (const [i, c] of journalCategories.entries()) {
    categoryIds.set(
      c.slug,
      await upsert(payload, 'categories', { slug: { equals: c.slug } }, { ...c, sortOrder: i }),
    )
  }
  for (const a of articles) {
    // A full body is written only to an article that has none yet, so admin edits are never lost
    const seedBody = articleBodies[a.slug]
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: a.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const bodyFields =
      seedBody && !existing.docs[0]?.body?.length
        ? {
            standfirst: seedBody.standfirst,
            coverCaption: seedBody.coverCaption,
            tags: seedBody.tags,
            body: seedBody.body.map((block) =>
              block.blockType === 'step'
                ? {
                    ...block,
                    products: (block.products ?? []).flatMap((p) =>
                      productIds.get(p.slug)
                        ? [{ product: productIds.get(p.slug)!, note: p.note }]
                        : [],
                    ),
                  }
                : block,
            ),
          }
        : {}
    await upsert(
      payload,
      'posts',
      { slug: { equals: a.slug } },
      {
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        // The body is left alone so re-seeding never overwrites an article written in the admin
        coverImage: await media(a.image.src, a.image.alt),
        categories: [categoryIds.get(a.category)!],
        publishedAt: new Date(`${a.date}T09:00:00Z`).toISOString(),
        readingTime: a.readingTime,
        featured: Boolean(a.featured),
        featuredLabel: a.featured ?? 'Featured',
        relatedProducts: (a.products ?? []).map((slug) => productIds.get(slug)!).filter(Boolean),
        ...bodyFields,
        _status: 'published',
      },
    )
  }
  await payload.updateGlobal({ slug: 'journal', data: { ...journalPage, ...journalAuthor } })
  log(`${journalCategories.length} journal categories, ${articles.length} articles`)
}

/** Create or update the first doc matching `where`, returning its id. */
async function upsert(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
): Promise<string> {
  const existing = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  const doc = existing.docs[0]
  const draft = '_status' in data ? { draft: false } : {}
  if (doc) {
    return String(
      (await payload.update({ collection, id: doc.id, data: data as never, ...draft })).id,
    )
  }
  return String((await payload.create({ collection, data: data as never, ...draft })).id)
}

const upsertProduct = (payload: Payload, slug: string, data: Record<string, unknown>) =>
  upsert(payload, 'products', { slug: { equals: slug } }, data)

// `payload run` exits once the module has loaded, so the work has to be awaited at the top level
try {
  await seed()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
