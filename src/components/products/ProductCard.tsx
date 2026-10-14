import Image from 'next/image'
import Link from 'next/link'

import { AddToBagButton } from '@/components/cart/AddToBagButton'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/types/product'

type ProductCardProps = {
  product: ProductCardData
  className?: string
  /** Load eagerly when the card is likely above the fold */
  priority?: boolean
  /** Turns the subtitle into a link, e.g. to the article a product appears in */
  subtitleHref?: string
}

export function ProductCard({
  product,
  className,
  priority = false,
  subtitleHref,
}: ProductCardProps) {
  const { id, slug, title, subtitle, price, fromPrice, image, badge, variantID, inStock } = product
  const href = `/shop/${slug}`

  return (
    <article className={cn('group flex flex-col', className)}>
      {/* Image */}
      <Link href={href} className="relative block aspect-[6/7] overflow-hidden bg-[#ececea]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-white px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase">
            {badge}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-[13px] font-semibold tracking-[0.08em] uppercase">
          <Link href={href} className="hover:text-olive">
            {title}
          </Link>
        </h3>
        {subtitleHref ? (
          <Link
            href={subtitleHref}
            className="text-olive mt-1.5 text-[13px] underline-offset-4 hover:underline"
          >
            {subtitle}
          </Link>
        ) : (
          <p className="text-foreground/55 mt-1.5 text-[13px]">{subtitle}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-sm">
            {fromPrice && 'From '}
            <span className="tabular-nums">{formatPrice(price)}</span>
          </p>
          <AddToBagButton productID={id} variantID={variantID} title={title} inStock={inStock} />
        </div>
      </div>
    </article>
  )
}
