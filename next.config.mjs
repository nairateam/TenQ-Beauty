import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Media served by Payload in development
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      // Uploads stored on Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
