import type { Metadata } from 'next'
import { Suspense } from 'react'

import { JournalView } from '@/components/journal/JournalView'
import { Shelf } from '@/components/journal/Shelf'
import { getJournal } from '@/lib/queries/journal'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Guides, routines and ingredient deep-dives from the Ten-Q formulators.',
}

// Re-read Payload content at most once a minute
export const revalidate = 60

export default async function BlogPage() {
  const journal = await getJournal()

  return (
    <>
      {/* Reads ?category= and ?q= from the URL */}
      <Suspense>
        <JournalView journal={journal} />
      </Suspense>
      <Shelf eyebrow={journal.shelfEyebrow} title={journal.shelfTitle} items={journal.shelf} />
    </>
  )
}
