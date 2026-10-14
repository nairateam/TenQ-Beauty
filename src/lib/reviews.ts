import type { Review } from '@/types/product'

/** Average rating (one decimal) and how many reviews at each star level, 5 first. */
export function reviewSummary(reviews: Review[]) {
  const count = reviews.length
  const average = count
    ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / count) * 10) / 10
    : 0
  const byStars = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }))
  return { count, average, byStars }
}
