import { Button } from '@/components/ui/button'

const LAPTOP_IMAGE_URL =
  'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[500px] grid-cols-1 items-center gap-8 py-12 lg:min-h-[560px] lg:grid-cols-2 lg:py-16">
          {/* Text content */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              New 2026
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Gaming Laptop{' '}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Built to Perform
              </span>
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-500 lg:max-w-none">
              Discover the latest gaming laptops powered by next-gen chips,
              144Hz displays, and all-day battery life.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button
                size="lg"
                className="rounded-full bg-orange-500 px-8 text-white hover:bg-orange-600"
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-gray-300 px-8 hover:border-orange-500 hover:text-orange-500"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
              {[
                { value: '500+', label: 'Products' },
                { value: '50K+', label: 'Customers' },
                { value: '4.9★', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product image */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              {/* Decorative glow */}
              <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-orange-200/40 blur-3xl" />
              <img
                src={LAPTOP_IMAGE_URL}
                alt="Latest gaming laptop 2026"
                className="relative z-10 h-auto w-full max-w-[520px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
    </section>
  )
}

export { HeroBanner }
