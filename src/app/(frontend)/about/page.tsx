import type { Metadata } from 'next'

import { AboutHero } from '@/components/about/AboutHero'
import { AboutReveal } from '@/components/about/AboutReveal'
import { ClosingCta } from '@/components/about/ClosingCta'
import { Journey } from '@/components/about/Journey'
import { MeetFounder } from '@/components/about/MeetFounder'
import { RootedInTradition } from '@/components/about/RootedInTradition'
import { Stats } from '@/components/about/Stats'
import { TenQFamily } from '@/components/about/TenQFamily'
import { WhatWeBelieve } from '@/components/about/WhatWeBelieve'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutReveal />
      <MeetFounder />
      <Journey />
      <WhatWeBelieve />
      <RootedInTradition />
      <TenQFamily />
      <Stats />
      <ClosingCta />
    </>
  )
}
