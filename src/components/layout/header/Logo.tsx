import Image from 'next/image'
import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

/** The Ten-Q Beauty wordmark, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${siteConfig.name} — home`} className={cn('block', className)}>
      <Image
        src="/brand/tenq-wordmark.png"
        alt=""
        width={1536}
        height={280}
        priority
        sizes="(min-width: 768px) 220px, 140px"
        className="h-6 w-auto md:h-9"
      />
    </Link>
  )
}
