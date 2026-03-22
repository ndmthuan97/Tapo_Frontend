import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroBanner } from '@/features/home/components/HeroBanner'
import { ServiceFeatures } from '@/features/home/components/ServiceFeatures'
import { CategoryPromotions } from '@/features/home/components/CategoryPromotions'
import { BestSelling } from '@/features/home/components/BestSelling'
import { FeaturedCollection } from '@/features/home/components/FeaturedCollection'
import { ScrollReveal } from '@/components/common/ScrollReveal'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero: no reveal — it's the first thing visible */}
        <HeroBanner />

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
