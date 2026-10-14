import { Bestsellers } from '@/components/home/BestSellers'
import { BrandPromises } from '@/components/home/BrandPromises'
import { VideoHero } from '@/components/home/VideoHero'
import { EssentialSteps } from '@/components/home/EssentialSteps'
import { OurStory } from '@/components/home/OurStory'
import { Philosophy } from '@/components/home/Philosophy'
import { ShopByConcern } from '@/components/home/ShopByConcern'
import { Salon } from '@/components/home/Salon'
import { Testimonials } from '@/components/home/Testimonials'

import { getHomeData } from '@/lib/queries/home'

// Re-read Payload content at most once a minute
export const revalidate = 60

export default async function HomePage() {
  const { bestsellers, routine, concerns, rating, testimonials } = await getHomeData()

  return (
    <>
      <VideoHero />
      <BrandPromises />
      <Bestsellers products={bestsellers} />
      <div>
        <Philosophy />
        <div className="bg-background relative z-20 shadow-[0_-24px_60px_rgba(0,0,0,0.18)] lg:-mt-[100vh]">
          {routine.length > 0 && <EssentialSteps steps={routine} />}
        </div>
      </div>
      <ShopByConcern concerns={concerns} />
      <OurStory />
      <Testimonials rating={rating} testimonials={testimonials} />
      <Salon />
    </>
  )
}
