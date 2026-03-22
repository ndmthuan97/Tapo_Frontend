import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroBanner } from '@/features/home/components/HeroBanner'
import { ServiceFeatures } from '@/features/home/components/ServiceFeatures'
import { CategoryPromotions } from '@/features/home/components/CategoryPromotions'
import { BestSelling } from '@/features/home/components/BestSelling'
import { FeaturedCollection } from '@/features/home/components/FeaturedCollection'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <ServiceFeatures />
        <CategoryPromotions />
        <BestSelling />
        <FeaturedCollection />
      </main>
      <Footer />
    </>
  )
}

export { HomePage }
