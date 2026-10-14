/**
 * Copies every file in /media (originals and resized versions) to Cloudinary, under the names the
 * Cloudinary storage adapter expects. Run once before switching uploads to Cloudinary, so images
 * already in the database keep working. Safe to re-run: files are overwritten, not duplicated.
 *
 *   pnpm media:cloudinary
 */
import fs from 'fs/promises'
import path from 'path'

import { cloudinaryConfigured, cloudinaryURL, uploadToCloudinary } from '@/storage/cloudinary'

const folder = process.env.CLOUDINARY_FOLDER || 'tenq/media'
const mediaDir = path.resolve(process.cwd(), 'media')

if (!cloudinaryConfigured()) {
  console.error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET first.')
  process.exit(1)
}

const files = (await fs.readdir(mediaDir)).filter((f) => !f.startsWith('.'))
let done = 0
const failed: string[] = []

// A few at a time, to stay friendly with Cloudinary's rate limits
for (let i = 0; i < files.length; i += 4) {
  await Promise.all(
    files.slice(i, i + 4).map(async (file) => {
      try {
        await uploadToCloudinary(folder, file, await fs.readFile(path.join(mediaDir, file)))
        done += 1
      } catch (err) {
        failed.push(`${file}: ${(err as Error).message}`)
      }
    }),
  )
  console.log(`[media] ${done}/${files.length}`)
}

console.log(`[media] uploaded ${done} of ${files.length} to ${folder}`)
if (files[0]) console.log(`[media] e.g. ${cloudinaryURL(folder, files[0])}`)
if (failed.length) {
  console.error(`[media] ${failed.length} failed:\n${failed.join('\n')}`)
  process.exit(1)
}
process.exit(0)
