import type { GlobalConfig } from 'payload'

import { adminOnly, publicAccess } from '@/access'

/** Copy around the journal (/blog): the intro, the newsletter tile and the product shelf. */
export const Journal: GlobalConfig = {
  slug: 'journal',
  label: 'Journal page',
  admin: { group: 'Content' },
  access: {
    read: publicAccess,
    update: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'The Ten-Q Journal' },
            { name: 'title', type: 'text', required: true, defaultValue: 'Notes on healthy hair' },
            { name: 'intro', type: 'textarea' },
            {
              name: 'storiesHeading',
              type: 'text',
              defaultValue: 'Latest stories',
            },
          ],
        },
        {
          label: 'Articles',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'authorName',
                  type: 'text',
                  defaultValue: 'The Ten-Q Journal',
                  admin: { width: '50%', description: 'Credited when an article names no author.' },
                },
                {
                  name: 'authorByline',
                  type: 'text',
                  defaultValue: 'the Ten-Q Journal team',
                  admin: { width: '35%', description: 'Reads “By …” under the title.' },
                },
                {
                  name: 'authorInitials',
                  type: 'text',
                  defaultValue: 'TQ',
                  maxLength: 3,
                  admin: { width: '15%' },
                },
              ],
            },
            { name: 'authorBio', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'routineTitle', type: 'text', defaultValue: 'Shop this routine' },
                {
                  name: 'routineNote',
                  type: 'text',
                  defaultValue: 'Everything mentioned in this article.',
                },
              ],
            },
          ],
        },
        {
          label: 'Newsletter tile',
          fields: [
            { name: 'newsletterEyebrow', type: 'text', defaultValue: 'Hair notes, in your inbox' },
            {
              name: 'newsletterTitle',
              type: 'text',
              defaultValue: 'New guides, routines and 5% off your first order',
            },
          ],
        },
        {
          label: 'Product shelf',
          fields: [
            {
              name: 'shelfEyebrow',
              type: 'text',
              defaultValue: 'Shop what we write about',
            },
            {
              name: 'shelfTitle',
              type: 'text',
              defaultValue: 'From the page to your shelf',
              admin: {
                description:
                  'Lists products the newest articles mention (set on each article), up to four.',
              },
            },
          ],
        },
      ],
    },
  ],
}
