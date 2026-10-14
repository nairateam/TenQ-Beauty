import type { Media } from '@/payload-types'
import type { ImageData } from '@/types/product'

/** True when a Payload relationship came back populated rather than as an id. */
export const isDoc = <T extends { id: string }>(value: string | T | null | undefined): value is T =>
  typeof value === 'object' && value !== null

/**
 * Payload-served media URLs come back absolute (serverURL); those are made same-origin so next/image
 * treats them as local. Files on Cloudinary keep their full CDN address.
 */
export function imageOf(
  media: string | Media | null | undefined,
  size: 'card' | 'thumbnail' | 'hero' | 'original' = 'card',
  position?: string | null,
): ImageData {
  if (!isDoc(media)) return { src: '', alt: '' }
  const url = (size !== 'original' && media.sizes?.[size]?.url) || media.url || ''
  return {
    src: url.includes('/api/media/file/') ? url.replace(/^https?:\/\/[^/]+/, '') : url,
    alt: media.alt,
    ...(position ? { position } : {}),
  }
}
