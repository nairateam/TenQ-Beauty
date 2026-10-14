import type { Metadata } from 'next'

import { ContactHero } from '@/components/contact/ContactHero'
import { ContactRoutes } from '@/components/contact/ContactRoutes'
import { Faq } from '@/components/contact/Faq'
import { Stockists } from '@/components/contact/Stockists'

export const metadata: Metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactRoutes />
      <Stockists />
      <Faq />
    </>
  )
}
