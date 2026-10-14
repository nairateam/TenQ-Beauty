import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { formatPrice } from '@/lib/format'
import type { ArticleBlock } from '@/lib/queries/journal'
import { cn } from '@/lib/utils'

import { AddText } from './ArticleClient'

/** Body copy styles for rich text inside the article */
export const prose =
  'text-[15px] leading-[1.8] text-[#3A3C25] md:text-base [&_a]:text-olive [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-[#24260F] [&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-[#24260F] [&_li]:mt-2 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-5 [&_strong]:font-semibold [&_strong]:text-[#24260F] [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6 [&>*:first-child]:mt-0'

const scrollMargin = 'scroll-mt-[calc(var(--header-height)+1.5rem)]'

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
    >
      {children}
    </svg>
  )
}

const calloutIcons = {
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
}

/** The article's blocks, in order. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-10">
      {blocks.map((block) => {
        switch (block.kind) {
          case 'text':
            return (
              <RichText
                key={block.id}
                data={block.content}
                className={cn(prose, 'md:text-[17px]')}
              />
            )
          case 'step':
            return <Step key={block.id} step={block} />
          case 'quote':
            return (
              <blockquote
                key={block.id}
                className="border-y border-[#DDDCD0] py-8 font-serif text-[26px] leading-[1.3] text-[#4f5a17] italic md:text-[30px]"
              >
                “{block.text.replace(/^[“"]|[”"]$/g, '')}”
              </blockquote>
            )
          case 'callout':
            return (
              <aside
                key={block.id}
                id={block.anchor}
                className={cn('flex gap-4 bg-[#24260F] p-6 text-white md:p-7', scrollMargin)}
              >
                <Icon className="mt-5 text-[#C9D27A]">{calloutIcons[block.icon]}</Icon>
                <div>
                  {block.eyebrow && (
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C9D27A] uppercase">
                      {block.eyebrow}
                    </p>
                  )}
                  <p className="mt-2 text-[17px] leading-snug md:text-lg">{block.text}</p>
                </div>
              </aside>
            )
          case 'advice':
            return (
              <aside
                key={block.id}
                id={block.anchor}
                className={cn('border-olive border-l-2 pl-5', scrollMargin)}
              >
                <p className="text-olive text-[10px] font-semibold tracking-[0.18em] uppercase">
                  {block.eyebrow}
                </p>
                <p className="mt-2 text-[15px] leading-[1.75] text-[#3A3C25] md:text-base">
                  {block.text}
                </p>
              </aside>
            )
        }
      })}
    </div>
  )
}

function Step({ step }: { step: Extract<ArticleBlock, { kind: 'step' }> }) {
  const number = String(step.number).padStart(2, '0')
  return (
    <section id={step.anchor} aria-labelledby={`${step.anchor}-title`} className={scrollMargin}>
      <h2
        id={`${step.anchor}-title`}
        className="flex items-center gap-3 font-sans text-xl font-medium text-[#24260F] md:text-[22px]"
      >
        <span
          aria-hidden
          className="bg-olive flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white tabular-nums"
        >
          {number}
        </span>
        <span>
          <span className="sr-only">Step {step.number}: </span>
          {step.title}
        </span>
      </h2>
      {step.content && <RichText data={step.content} className={cn(prose, 'mt-5')} />}

      {step.showRecommendation && step.products.length > 0 && (
        <div className="mt-8 bg-[#F6F5EF] p-5 md:p-6">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6B6C5A] uppercase">
            We recommend for step {number}
          </p>
          <ul className="mt-2">
            {step.products.map(({ product, note }) => (
              <li
                key={product.id}
                className="flex items-start gap-4 border-t border-[#E7E6DC] py-4 first:border-t-0"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative size-14 shrink-0 overflow-hidden bg-white"
                >
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="hover:text-olive text-sm font-medium text-[#24260F]"
                  >
                    {product.title}
                  </Link>
                  {note && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B6C5A]">{note}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-[13px] text-[#24260F] tabular-nums">
                    {product.fromPrice && 'From '}
                    {formatPrice(product.price)}
                  </p>
                  <AddText product={product} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
