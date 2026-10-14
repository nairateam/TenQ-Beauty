/*
 * Cloudinary storage for Payload uploads, through Payload's cloud-storage plugin.
 *
 * Each file (the original and every resized version) is stored as its own Cloudinary image under
 * one folder, and the media URLs Payload hands out point straight at Cloudinary's CDN.
 *
 * Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_URL).
 */
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

export const cloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET),
  )

function configure() {
  // CLOUDINARY_URL is read by the SDK itself; the separate variables are applied here
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }
  cloudinary.config({ secure: true })
}

/**
 * Cloudinary ids leave off the extension, so it's folded into the name instead:
 * "p-dazzle.jpeg" → "tenq/media/p-dazzle_jpeg". That keeps "a.jpg" and "a.png" apart.
 */
export const publicIdFor = (folder: string, filename: string) =>
  `${folder}/${filename.replace(/\.([^.]+)$/, '_$1')}`

const formatOf = (filename: string) => filename.split('.').pop()?.toLowerCase()

export const cloudinaryURL = (folder: string, filename: string) => {
  configure()
  return cloudinary.url(publicIdFor(folder, filename), {
    secure: true,
    resource_type: 'image',
    type: 'upload',
    format: formatOf(filename),
  })
}

export function uploadToCloudinary(folder: string, filename: string, buffer: Buffer) {
  configure()
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicIdFor(folder, filename),
          resource_type: 'image',
          overwrite: true,
          invalidate: true,
        },
        (error, result) => (error || !result ? reject(error) : resolve(result)),
      )
      .end(buffer)
  })
}

export const cloudinaryAdapter =
  ({ folder }: { folder: string }): Adapter =>
  () => ({
    name: 'cloudinary',
    generateURL: ({ filename }) => cloudinaryURL(folder, filename),
    handleUpload: async ({ file }) => {
      await uploadToCloudinary(folder, file.filename, file.buffer)
    },
    handleDelete: async ({ filename }) => {
      configure()
      await cloudinary.uploader.destroy(publicIdFor(folder, filename), {
        resource_type: 'image',
        invalidate: true,
      })
    },
    // Old /api/media/file/… links still work: they forward to the Cloudinary copy
    staticHandler: (_req, { params }) =>
      Response.redirect(cloudinaryURL(folder, params.filename), 302),
  })
