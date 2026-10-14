import path from 'path'
import { fileURLToPath } from 'url'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import {
  Categories,
  Concerns,
  HairTypes,
  Media,
  Posts,
  PromoCodes,
  Reviews,
  ShippingMethods,
  ShopCollections,
  Subscribers,
  Testimonials,
  Users,
} from '@/collections'
import { serverURL } from '@/config/site'
import { Homepage, Journal, StoreSettings } from '@/globals'
import { plugins } from '@/plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Posts,
    Testimonials,
    ShopCollections,
    Concerns,
    HairTypes,
    Reviews,
    PromoCodes,
    ShippingMethods,
    Subscribers,
  ],
  globals: [Homepage, StoreSettings, Journal],
  plugins,
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: serverURL(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
