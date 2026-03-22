import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SlideConfig {
  image: string
  accentFrom: string
  accentTo: string
  slideKey: 'slide1' | 'slide2' | 'slide3'
}

// Only static data (images & colors) lives outside the component
const SLIDE_CONFIG: SlideConfig[] = [
  { image: '/banner-1.png', accentFrom: 'from-blue-500',   accentTo: 'to-cyan-400',  slideKey: 'slide1' },
  { image: '/banner-2.png', accentFrom: 'from-purple-500', accentTo: 'to-pink-400',  slideKey: 'slide2' },
  { image: '/banner-3.png', accentFrom: 'from-orange-500', accentTo: 'to-red-400',   slideKey: 'slide3' },
]

const AUTO_PLAY_INTERVAL = 5000

function HeroBanner() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Derive translated text per slide inside the render cycle so it updates on language change
  const slides = SLIDE_CONFIG.map((cfg) => ({
    ...cfg,
    badge:        t(`banner.${cfg.slideKey}.badge`),
    title:        t(`banner.${cfg.slideKey}.title`),
    highlight:    t(`banner.${cfg.slideKey}.highlight`),
    description:  t(`banner.${cfg.slideKey}.description`),
    primaryCta:   t(`banner.${cfg.slideKey}.primaryCta`),
    secondaryCta: t(`banner.${cfg.slideKey}.secondaryCta`),
  }))

  const goTo = useCallback(
    (index: number) => {
      if (animating) return
      setAnimating(true)
      setCurrent((index + slides.length) % slides.length)
      setTimeout(() => setAnimating(false), 600)
    },
    [animating, slides.length],
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative h-[560px] overflow-hidden bg-gray-950 lg:h-[640px]">
      {/* Background images — fixed box, object-cover prevents any layout shift */}
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt=""
          aria-hidden
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700',
            i === current ? 'opacity-100' : 'opacity-0',
          )}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Dark overlay gradient — stronger on left for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/55 to-gray-950/10" />

      {/* Content — fills the section height exactly, no overflow */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'w-full max-w-lg text-left transition-all duration-500',
              animating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
            )}
          >
            {/* Badge */}
            <span
              className={cn(
                'mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white',
                `bg-gradient-to-r ${slide.accentFrom} ${slide.accentTo}`,
              )}
            >
              {slide.badge}
            </span>

            {/* Heading */}
            <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {slide.title}{' '}
              <span
                className={cn(
                  'bg-gradient-to-r bg-clip-text text-transparent',
                  `${slide.accentFrom} ${slide.accentTo}`,
                )}
              >
                {slide.highlight}
              </span>
            </h1>

            {/* Description */}
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-300 sm:text-base">
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className={cn(
                  'rounded-full px-8 font-semibold text-white shadow-lg transition-transform hover:scale-105',
                  `bg-gradient-to-r ${slide.accentFrom} ${slide.accentTo} border-0 hover:opacity-90`,
                )}
              >
                {slide.primaryCta}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/30 px-8 font-semibold text-white backdrop-blur-sm hover:border-white hover:bg-white/10"
              >
                {slide.secondaryCta}
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-6 flex gap-6">
              {[
                { value: '500+', label: 'Products' },
                { value: '50K+', label: 'Customers' },
                { value: '4.9★', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/25"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/25"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current ? 'h-2 w-8 bg-white' : 'h-2 w-2 bg-white/40 hover:bg-white/70',
            )}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={current}
          className={cn('h-full bg-gradient-to-r', `${slide.accentFrom} ${slide.accentTo}`)}
          style={{ animation: `progress ${AUTO_PLAY_INTERVAL}ms linear` }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  )
}

export { HeroBanner }
