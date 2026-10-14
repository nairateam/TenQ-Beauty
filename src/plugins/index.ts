import type { Plugin } from 'payload'

import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import {
  adminOnlyFieldAccess,
  adminOrPublishedStatus,
  authenticated,
  customerOnlyFieldAccess,
  isAdmin,
  isDocumentOwner,
  publicAccess,
} from '@/access'
import {
  cartsOverride,
  ordersOverride,
  productsOverride,
  transactionsOverride,
  variantsOverride,
} from '@/collections'
import { countries } from '@/lib/countries'
import { currenciesConfig } from '@/lib/currencies'
import { paystackAdapter } from '@/payments/paystack'
import { cloudinaryAdapter, cloudinaryConfigured } from '@/storage/cloudinary'

export const plugins: Plugin[] = [
  // Uploads go to Cloudinary when its credentials are set (Vercel's filesystem doesn't keep
  // files); without them, e.g. in local development, they're stored in /media
  ...(cloudinaryConfigured()
    ? [
        cloudStoragePlugin({
          collections: {
            media: {
              adapter: cloudinaryAdapter({ folder: process.env.CLOUDINARY_FOLDER || 'tenq/media' }),
              disableLocalStorage: true,
              // Media URLs point straight at Cloudinary's CDN rather than through Payload
              disablePayloadAccessControl: true,
            },
          },
        }),
      ]
    : []),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isAuthenticated: authenticated,
      isDocumentOwner,
      publicAccess,
    },
    customers: {
      slug: 'users',
    },
    addresses: {
      supportedCountries: countries,
    },
    carts: {
      // Shoppers can fill a bag and check out without an account
      allowGuestCarts: true,
      cartsCollectionOverride: cartsOverride,
    },
    orders: {
      ordersCollectionOverride: ordersOverride,
    },
    transactions: {
      transactionsCollectionOverride: transactionsOverride,
    },
    products: {
      productsCollectionOverride: productsOverride,
      variants: {
        variantsCollectionOverride: variantsOverride,
      },
    },
    currencies: currenciesConfig,
    payments: {
      // Registered even without a key so orders keep their payment method;
      // payments fail with a clear server log until PAYSTACK_SECRET_KEY is set
      paymentMethods: [paystackAdapter({ secretKey: process.env.PAYSTACK_SECRET_KEY })],
    },
  }),
]
