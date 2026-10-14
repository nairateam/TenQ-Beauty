import Image from 'next/image'
import Link from 'next/link'

import type { JournalPost } from '@/lib/queries/journal'
import { cn } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "8 Sep 2023" (Intl's en-GB would say "Sept") */
export const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "Ingredients · 2 min read" */
export const metaLine = (post: JournalPost) =>
  [post.category?.title, `${post.readingTime} min read`].filter(Boolean).join(' · ')

/** A journal card: image, category and reading time, title, excerpt, date and "Read". */
export function StoryCard({
  post,
  className,
  compact = false,
}: {
  post: JournalPost
  className?: string
  /** Image, meta and title only */
  compact?: boolean
}) {
  const href = `/blog/${post.slug}`
  return (
    <article className={cn('group flex h-full flex-col', className)}>
      <Link href={href} className="relative block aspect-[7/5] overflow-hidden bg-[#ECEBE4]">
        {post.image.src && (
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        )}
      </Link>

      <p className="text-olive mt-5 text-[10px] font-semibold tracking-[0.16em] uppercase">
        {metaLine(post)}
      </p>
      <h3 className="mt-2.5 font-sans text-lg leading-snug font-medium text-[#24260F]">
        <Link href={href} className="hover:text-olive">
          {post.title}
        </Link>
      </h3>
      {!compact && post.excerpt && (
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#6B6C5A]">{post.excerpt}</p>
      )}

      {/* Pinned to the bottom so cards in a row line up */}
      {!compact && (
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-[#DDDCD0] pt-3.5 text-xs">
            <time dateTime={post.date} className="text-[#6B6C5A]">
              {formatDate(post.date)}
            </time>
            <Link
              href={href}
              aria-label={`Read ${post.title}`}
              className="text-[10px] font-semibold tracking-[0.16em] text-[#24260F] uppercase"
            >
              Read{' '}
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
