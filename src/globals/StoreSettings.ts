import type { GlobalConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'

/** Shop-wide copy and settings: the shop intro and promo tile, delivery notes, bag and checkout. */
export const StoreSettings: GlobalConfig = {
  slug: 'store-settings',
  label: 'Store settings',
  admin: { group: 'Shop' },
  access: {
    read: publicAccess,
    update: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Announcement bar',
          fields: [
            {
              name: 'announcements',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Short messages scrolling in the olive bar above the header, e.g. “Worldwide delivery”. Leave empty to hide the bar.',
              },
            },
          ],
        },
        {
          label: 'Shop page',
          fields: [
            { name: 'shopTitle', type: 'text', required: true, defaultValue: 'Shop all' },
            {
              name: 'shopDescription',
              type: 'textarea',
              admin: {
                description:
                  'Write {products} and {collections} to show the live counts, e.g. “{products} products across {collections} collections.”',
              },
            },
            {
              name: 'promoTile',
              type: 'group',
              admin: { description: 'The dark tile slotted into the product grid.' },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'headline', type: 'text' },
                { name: 'product', type: 'relationship', relationTo: 'products' },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  type: 'row',
                  fields: [
                    { name: 'ctaLabel', type: 'text', defaultValue: 'Shop now' },
                    {
                      name: 'ctaCollection',
                      type: 'relationship',
                      relationTo: 'shop-collections',
                      admin: { description: 'The collection the button filters to.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Product pages',
          fields: [
            {
              name: 'deliveryAndReturns',
              type: 'text',
              hasMany: true,
              admin: { description: 'Lines in the “Delivery & returns” panel.' },
            },
            {
              name: 'assurances',
              type: 'array',
              maxRows: 3,
              admin: { description: 'The strip of reassurances under the product details.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      required: true,
                      defaultValue: 'badge',
                      options: [
                        { label: 'Globe', value: 'globe' },
                        { label: 'Badge', value: 'badge' },
                        { label: 'Lock', value: 'lock' },
                      ],
                      admin: { width: '30%' },
                    },
                    { name: 'text', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Bag & checkout',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              admin: {
                description:
                  'For the “Chat with us on WhatsApp” links, with the country code and no spaces, e.g. 2348030000000.',
              },
            },
            {
              name: 'whatsappGreeting',
              type: 'text',
              defaultValue: 'Hi Ten-Q, I’d like some help with',
              admin: {
                description:
                  'Pre-filled message when someone opens the floating WhatsApp button. Leave empty for a blank chat.',
              },
            },
            {
              name: 'bagPaymentNote',
              type: 'text',
              defaultValue: 'Pay securely with Paystack — card, transfer or USSD',
            },
            {
              name: 'drawerNote',
              type: 'text',
              admin: {
                description:
                  'Optional tip in the slide-out bag, e.g. “First order? Use code HAIRRESS for 5% off at checkout.”',
              },
            },
            {
              name: 'trustPoints',
              type: 'array',
              admin: { description: 'Short reassurances under the bag summary.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      required: true,
                      defaultValue: 'shield',
                      options: [
                        { label: 'Globe', value: 'globe' },
                        { label: 'Shield', value: 'shield' },
                        { label: 'Gift', value: 'gift' },
                      ],
                      admin: { width: '30%' },
                    },
                    { name: 'text', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
            {
              name: 'checkoutPaymentNote',
              type: 'textarea',
              defaultValue:
                'After you click Pay, you’ll be taken to Paystack’s secure page to complete your payment, then returned here.',
            },
          ],
        },
      ],
    },
  ],
}
