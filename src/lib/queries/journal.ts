import 'server-only'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cache } from 'react'

import { imageOf, isDoc } from '@/lib/media'
import { getPayload } from '@/lib/payload'
import type { Category, Post } from '@/payload-types'
import type { ImageData, ShopProduct } from '@/types/product'

import { getCatalog } from './shop'

/*
 * The journal (/blog), read from Payload's posts, categories and the Journal global.
 * overrideAccess: false keeps drafts out, as for visitors.
 */

export type JournalCategory = { slug: string; title: string }

export type JournalPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  image: ImageData
  category?: JournalCategory
  /** ISO date */
  date: string
  readingTime: number
  featuredLabel: string
  /** First letters of the glossary terms, A–Z */
  glossaryLetters: string[]
}

export type ShelfItem = { product: ShopProduct; readTitle: string; readHref: string }

const firstCategory = (post: Post): JournalCategory | undefined => {
  const c = (post.categories ?? []).find(isDoc) as Category | undefined
  return c?.slug ? { slug: c.slug, title: c.title } : undefined
}

const lettersOf = (post: Post) =>
  [...new Set((post.glossary ?? []).map((g) => g.term.trim().charAt(0).toUpperCase()))].sort()

function toJournalPost(post: Post): JournalPost {
  return {
    id: post.id,
    slug: post.slug ?? post.id,
    title: post.title,
    excerpt: post.excerpt ?? '',
    image: imageOf(post.coverImage, 'hero'),
    category: firstCategory(post),
    date: post.publishedAt,
    readingTime: post.readingTime ?? 1,
    featuredLabel: post.featuredLabel || 'Featured',
    glossaryLetters: lettersOf(post),
  }
}

const publishedPosts = cache(async () => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    pagination: false,
    sort: '-publishedAt',
    overrideAccess: false,
  })
  return docs
})

/** Everything the journal page shows. */
export async function getJournal() {
  const payload = await getPayload()
  const [docs, settings, categoryDocs, catalog] = await Promise.all([
    publishedPosts(),
    payload.findGlobal({ slug: 'journal', overrideAccess: false }),
    payload.find({ collection: 'categories', depth: 0, pagination: false, overrideAccess: false }),
    getCatalog(),
  ])

  const posts = docs.map(toJournalPost)
  // The newest featured article leads; failing that, the newest article
  const featuredDoc = docs.find((p) => p.featured) ?? docs[0]
  const featured = featuredDoc ? posts.find((p) => p.id === featuredDoc.id) : undefined

  // Only offer tabs for categories that have something in them
  const used = new Set(posts.flatMap((p) => (p.category ? [p.category.slug] : [])))
  const categories = categoryDocs.docs.flatMap((c) =>
    c.slug && used.has(c.slug) ? [{ slug: c.slug, title: c.title }] : [],
  )

  // Products the newest articles mention, each once, with the article that mentions it
  const shelf: ShelfItem[] = []
  for (const doc of docs) {
    for (const ref of doc.relatedProducts ?? []) {
      const id = isDoc(ref) ? ref.id : ref
      const product = catalog.products.find((p) => p.id === id)
      if (product && !shelf.some((s) => s.product.id === id)) {
        shelf.push({ product, readTitle: doc.title, readHref: `/blog/${doc.slug ?? doc.id}` })
      }
    }
  }

  return {
    eyebrow: settings.eyebrow ?? '',
    title: settings.title,
    intro: settings.intro ?? '',
    storiesHeading: settings.storiesHeading ?? 'Latest stories',
    newsletter: {
      eyebrow: settings.newsletterEyebrow ?? '',
      title: settings.newsletterTitle ?? '',
    },
    shelfEyebrow: settings.shelfEyebrow ?? '',
    shelfTitle: settings.shelfTitle ?? '',
    categories,
    posts,
    featured,
    shelf: shelf.slice(0, 4),
  }
}

export type Journal = Awaited<ReturnType<typeof getJournal>>

export async function getPostSlugs() {
  return (await publishedPosts()).flatMap((p) => (p.slug ? [p.slug] : []))
}

/* ---------- Article ---------- */

type RichTextValue = SerializedEditorState

export type ArticleBlock =
  | { kind: 'text'; id: string; content: RichTextValue }
  | {
      kind: 'step'
      id: string
      anchor: string
      number: number
      title: string
      content: RichTextValue | null
      products: { product: ShopProduct; note: string }[]
      showRecommendation: boolean
    }
  | { kind: 'quote'; id: string; text: string }
  | {
      kind: 'callout'
      id: string
      anchor?: string
      eyebrow: string
      text: string
      icon: 'calendar' | 'clock' | 'info'
    }
  | { kind: 'advice'; id: string; anchor?: string; eyebrow: string; text: string }

export type TocEntry = { anchor: string; label: string; number?: number }

const anchorFor = (label: string) =>
  `section-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

/** One article: its blocks, contents list, the products it uses, author and more to read. */
export const getPost = cache(async (slug: string) => {
  const payload = await getPayload()
  const [docs, catalog, settings] = await Promise.all([
    publishedPosts(),
    getCatalog(),
    payload.findGlobal({ slug: 'journal', overrideAccess: false }),
  ])
  const doc = docs.find((p) => p.slug === slug)
  if (!doc) return null

  const productOf = (ref: unknown) => {
    const id = isDoc(ref as { id: string }) ? (ref as { id: string }).id : (ref as string)
    return catalog.products.find((p) => p.id === id)
  }

  // Number the steps and collect the contents list as we go
  const toc: TocEntry[] = []
  let stepNumber = 0
  const blocks: ArticleBlock[] = (doc.body ?? []).flatMap((block, i): ArticleBlock[] => {
    const id = block.id ?? `block-${i}`
    switch (block.blockType) {
      case 'text':
        return [{ kind: 'text', id, content: block.content as RichTextValue }]
      case 'step': {
        stepNumber += 1
        const anchor = `step-${String(stepNumber).padStart(2, '0')}`
        toc.push({ anchor, label: block.tocLabel || block.title, number: stepNumber })
        return [
          {
            kind: 'step',
            id,
            anchor,
            number: stepNumber,
            title: block.title,
            content: (block.content ?? null) as RichTextValue | null,
            products: (block.products ?? []).flatMap((p) => {
              const product = productOf(p.product)
              return product ? [{ product, note: p.note ?? '' }] : []
            }),
            showRecommendation: Boolean(block.showRecommendation),
          },
        ]
      }
      case 'quote':
        return [{ kind: 'quote', id, text: block.text }]
      case 'callout':
      case 'advice': {
        const anchor = block.tocLabel ? anchorFor(block.tocLabel) : undefined
        if (anchor) toc.push({ anchor, label: block.tocLabel! })
        return block.blockType === 'callout'
          ? [
              {
                kind: 'callout',
                id,
                anchor,
                eyebrow: block.eyebrow ?? '',
                text: block.text,
                icon: block.icon ?? 'calendar',
              },
            ]
          : [
              {
                kind: 'advice',
                id,
                anchor,
                eyebrow: block.eyebrow || 'Pro advice',
                text: block.text,
              },
            ]
      }
      default:
        return []
    }
  })

  // "Shop this routine": each product once, with the step it's first used in; failing steps,
  // the products the article mentions
  const routine: { step?: number; product: ShopProduct }[] = []
  for (const block of blocks) {
    if (block.kind !== 'step') continue
    for (const { product } of block.products) {
      if (!routine.some((r) => r.product.id === product.id)) {
        routine.push({ step: block.number, product })
      }
    }
  }
  if (!routine.length) {
    for (const ref of doc.relatedProducts ?? []) {
      const product = productOf(ref)
      if (product) routine.push({ product })
    }
  }

  const author = doc.author?.name
    ? {
        name: doc.author.name,
        byline: doc.author.name,
        initials: doc.author.initials || initialsOf(doc.author.name),
        bio: doc.author.bio ?? '',
      }
    : {
        name: settings.authorName ?? '',
        byline: settings.authorByline || settings.authorName || '',
        initials: settings.authorInitials || initialsOf(settings.authorName ?? ''),
        bio: settings.authorBio ?? '',
      }

  return {
    ...toJournalPost(doc),
    standfirst: doc.standfirst || doc.excerpt || '',
    caption: doc.coverCaption ?? '',
    blocks,
    toc,
    routine,
    routineTitle: settings.routineTitle ?? '',
    routineNote: settings.routineNote ?? '',
    tags: doc.tags ?? [],
    author,
    glossary: [...(doc.glossary ?? [])]
      .map((g) => ({ term: g.term, definition: g.definition }))
      .sort((a, b) => a.term.localeCompare(b.term)),
    more: docs
      .filter((p) => p.id !== doc.id)
      .slice(0, 3)
      .map(toJournalPost),
  }
})

const initialsOf = (name: string) =>
  name
    .replace(/^the\s+/i, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

export type JournalArticle = NonNullable<Awaited<ReturnType<typeof getPost>>>
