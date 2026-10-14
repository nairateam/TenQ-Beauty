import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleBody } from '@/components/journal/article/ArticleBody'
import {
  Contents,
  ReadingProgress,
  ShareActions,
  ShopRoutine,
} from '@/components/journal/article/ArticleClient'
import { metaLine, StoryCard } from '@/components/journal/StoryCard'
import { getPost, getPostSlugs } from '@/lib/queries/journal'

type Props = { params: Promise<{ slug: string }> }

// Re-read Payload content at most once a minute; new articles render on first visit
export const revalidate = 60

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.standfirst || post.excerpt,
    openGraph: { images: post.image.src ? [post.image.src] : [] },
  }
}

const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))

const eyebrow =
  'text-olive flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase md:text-[11px]'

export default async function ArticlePage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  // Glossary grouped by first letter, for the A–Z jump links on the journal page
  const byLetter = Object.entries(
    post.glossary.reduce<Record<string, typeof post.glossary>>((groups, entry) => {
      const letter = entry.term.trim().charAt(0).toUpperCase()
      ;(groups[letter] ??= []).push(entry)
      return groups
    }, {}),
  )
  const hasSidebar = post.routine.length > 0
  const hasContents = post.toc.length > 0

  return (
    <>
      <ReadingProgress />

      <article className="bg-white">
        {/* Header */}
        <header className="mx-auto max-w-[56rem] px-4 pt-[calc(var(--header-height)+2.5rem)] text-center md:px-8 md:pt-[calc(var(--header-height)+3.5rem)]">
          <nav aria-label="Breadcrumb" className="text-[11px] text-[#6B6C5A]">
            <ol className="flex items-center justify-center gap-2">
              <li>
                <Link href="/blog" className="hover:text-[#24260F]">
                  Journal
                </Link>
              </li>
              {post.category && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link
                      href={`/blog?category=${post.category.slug}`}
                      className="text-[#24260F] hover:underline"
                    >
                      {post.category.title}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <p className={`${eyebrow} mt-5 justify-center`}>{metaLine(post)}</p>
          <h1 className="mt-4 text-4xl leading-[1.08] font-normal tracking-[0.01em] text-balance text-[#24260F] uppercase md:text-5xl lg:text-[56px]">
            {post.title}
          </h1>
          {post.standfirst && (
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#6B6C5A] md:text-[17px]">
              {post.standfirst}
            </p>
          )}

          {/* Byline + share */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
            <div className="flex items-center gap-3 text-left">
              <span
                aria-hidden
                className="bg-olive flex size-9 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              >
                {post.author.initials}
              </span>
              <div>
                <p className="text-[13px] font-medium text-[#24260F]">By {post.author.byline}</p>
                <time dateTime={post.date} className="text-[11px] text-[#6B6C5A]">
                  {longDate(post.date)}
                </time>
              </div>
            </div>
            <span aria-hidden className="hidden h-8 w-px bg-[#DDDCD0] sm:block" />
            <ShareActions title={post.title} slug={post.slug} variant="top" />
          </div>
        </header>

        {/* Cover */}
        {post.image.src && (
          <figure className="mx-auto mt-10 max-w-[90rem] px-4 md:mt-12 md:px-8 lg:px-16">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#ECEBE4] md:aspect-[2.2/1]">
              <Image
                src={post.image.src}
                alt={post.image.alt}
                fill
                priority
                sizes="(min-width: 1440px) 1312px, 100vw"
                className="object-cover"
              />
            </div>
            {post.caption && (
              <figcaption className="mt-3 text-xs text-[#6B6C5A]">{post.caption}</figcaption>
            )}
          </figure>
        )}

        {/* Contents · body · shop the routine */}
        <div
          data-article-body
          className="mx-auto grid max-w-[90rem] grid-cols-1 gap-12 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[200px_minmax(0,1fr)_280px] lg:gap-10 lg:px-16 xl:gap-16"
        >
          <div className="hidden lg:block">
            {hasContents && (
              <div className="sticky top-[calc(var(--header-height)+2rem)]">
                <Contents entries={post.toc} />
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-[38rem]">
            {post.blocks.length > 0 ? (
              <ArticleBody blocks={post.blocks} />
            ) : (
              <p className="text-[17px] leading-[1.8] text-[#3A3C25]">{post.excerpt}</p>
            )}

            {byLetter.length > 0 && (
              <section
                aria-labelledby="glossary-title"
                className="mt-14 border-t border-[#DDDCD0] pt-10"
              >
                <h2 id="glossary-title" className="text-2xl text-[#24260F] uppercase">
                  A–Z
                </h2>
                <dl className="mt-6">
                  {byLetter.map(([letter, entries]) => (
                    <div
                      key={letter}
                      id={`glossary-${letter.toLowerCase()}`}
                      className="grid scroll-mt-[calc(var(--header-height)+1.5rem)] grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[#DDDCD0] py-6"
                    >
                      <span className="text-olive text-2xl leading-none" aria-hidden>
                        {letter}
                      </span>
                      <div className="flex flex-col gap-4">
                        {entries.map((g) => (
                          <div key={g.term}>
                            <dt className="font-sans font-semibold text-[#24260F]">{g.term}</dt>
                            <dd className="mt-1 text-[15px] leading-relaxed text-[#6B6C5A]">
                              {g.definition}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Tags + share */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#DDDCD0] pt-6">
              {post.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[#DDDCD0] px-3 py-1 text-[11px] text-[#24260F]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <span />
              )}
              <ShareActions title={post.title} slug={post.slug} variant="bottom" />
            </div>

            {/* Author */}
            {post.author.name && (
              <div className="mt-8 flex items-start gap-4 bg-[#F6F5EF] p-6">
                <span
                  aria-hidden
                  className="bg-olive flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                >
                  {post.author.initials}
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#24260F] uppercase">
                    {post.author.name}
                  </p>
                  {post.author.bio && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B6C5A]">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* On small screens the products follow the article */}
            {hasSidebar && (
              <div className="mt-12 lg:hidden">
                <ShopRoutine
                  title={post.routineTitle}
                  note={post.routineNote}
                  items={post.routine}
                />
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            {hasSidebar && (
              <div className="sticky top-[calc(var(--header-height)+2rem)]">
                <ShopRoutine
                  title={post.routineTitle}
                  note={post.routineNote}
                  items={post.routine}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* More from the journal */}
      {post.more.length > 0 && (
        <section aria-labelledby="more-title" className="bg-[#F6F5EF] py-20 md:py-24">
          <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>
                  <span aria-hidden className="bg-olive size-1 rounded-full" />
                  Keep reading
                </p>
                <h2
                  id="more-title"
                  className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl"
                >
                  More from the journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="group text-[11px] font-semibold tracking-[0.14em] text-[#24260F] uppercase"
              >
                All stories{' '}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8">
              {post.more.map((p) => (
                <li key={p.id}>
                  <StoryCard post={p} compact />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
