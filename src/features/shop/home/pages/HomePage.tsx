import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroBanner } from '@/features/shop/home/components/HeroBanner'
import { ServiceFeatures } from '@/features/shop/home/components/ServiceFeatures'
import { CategoryPromotions } from '@/features/shop/home/components/CategoryPromotions'
import { BestSelling } from '@/features/shop/home/components/BestSelling'
import { FeaturedCollection } from '@/features/shop/home/components/FeaturedCollection'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { FlashSaleBanner } from '@/features/shop/home/components/FlashSaleBanner'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero: no reveal — it's the first thing visible */}
        <HeroBanner />

        {/* Flash sale: renders automatically when active, null when none */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
          <FlashSaleBanner />
        </div>

        {/* Each section fades-up as it enters the viewport */}
        <ScrollReveal variant="fade-up" delay={0}>
          <ServiceFeatures />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0}>
          <CategoryPromotions />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0}>
          <BestSelling />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0}>
          <FeaturedCollection />
        </ScrollReveal>
      </main>

      <ScrollReveal variant="fade" delay={0} threshold={0.05}>
        <Footer />
      </ScrollReveal>
    </>
  )
}

export { HomePage }
