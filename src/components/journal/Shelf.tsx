import Link from 'next/link'

import { ProductCard } from '@/components/products/ProductCard'
import type { ShelfItem } from '@/lib/queries/journal'

/** "From the page to your shelf" — products the articles mention, each linking back to its article. */
export function Shelf({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string
  title: string
  items: ShelfItem[]
}) {
  if (!items.length) return null

  return (
    <section aria-labelledby="shelf-title" className="bg-[#F6F5EF] py-20 md:py-24 lg:py-[110px]">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            {eyebrow && (
              <p className="text-olive flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase md:text-xs">
                <span aria-hidden className="bg-olive size-1 rounded-full" />
                {eyebrow}
              </p>
            )}
            <h2
              id="shelf-title"
              className="mt-4 text-3xl leading-[1.15] font-normal tracking-[0.01em] text-[#24260F] uppercase md:text-4xl lg:text-[40px]"
            >
              {title}
            </h2>
          </div>
          <Link
            href="/shop"
            className="group text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-[#24260F] uppercase"
          >
            Shop all products{' '}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-5 lg:mt-12 lg:grid-cols-4">
          {items.map(({ product, readTitle, readHref }) => (
            <li key={product.id}>
              <ProductCard
                product={{ ...product, subtitle: `Read: ${readTitle}` }}
                subtitleHref={readHref}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
