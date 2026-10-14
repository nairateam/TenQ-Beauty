import { cn } from '@/lib/utils'

/** Five olive stars, filled up to the rounded rating. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className={cn('text-olive flex gap-0.5', className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          aria-hidden
          viewBox="0 0 24 24"
          className="size-[1em]"
          fill={n <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z" />
        </svg>
      ))}
    </span>
  )
}
