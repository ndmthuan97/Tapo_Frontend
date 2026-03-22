import { Button } from '@/components/ui/button'

const LAPTOP_IMAGE_URL =
  'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

interface PromotionCardProps {
  tag: string
  title: string
  subtitle: string
  ctaLabel: string
  image: string
  bgColor: string
  accent: string
}

const PROMOTIONS: PromotionCardProps[] = [
  {
    tag: 'Just Launched',
    title: 'Lenovo Legion S7',
    subtitle: 'Starting from 29,990,000₫',
    ctaLabel: 'Buy Now',
    image: LAPTOP_IMAGE_URL,
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    accent: 'text-blue-600',
  },
  {
    tag: 'Accessories',
    title: 'New Smart Watch',
    subtitle: 'Starting from 2,990,000₫',
    ctaLabel: 'Explore',
    image: LAPTOP_IMAGE_URL,
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
    accent: 'text-purple-600',
  },
  {
    tag: 'Best Seller',
    title: 'Dell XPS 2026',
    subtitle: 'Outstanding performance, ultra-thin design',
    ctaLabel: 'View Now',
    image: LAPTOP_IMAGE_URL,
    bgColor: 'bg-gradient-to-br from-slate-50 to-gray-100',
    accent: 'text-slate-700',
  },
  {
    tag: 'Flash Sale',
    title: 'Save up to 30%',
    subtitle: 'Thousands of products on sale',
    ctaLabel: 'View Deals',
    image: LAPTOP_IMAGE_URL,
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-100',
    accent: 'text-orange-600',
  },
]

function CategoryPromotions() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.title}
              className={`group relative flex items-center justify-between overflow-hidden rounded-2xl p-8 ${promo.bgColor} transition-shadow hover:shadow-lg`}
            >
              {/* Content */}
              <div className="z-10 flex flex-col gap-3">
                <span
                  className={`text-xs font-semibold uppercase tracking-widest ${promo.accent}`}
                >
                  {promo.tag}
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {promo.title}
                </h3>
                <p className="text-sm text-gray-600">{promo.subtitle}</p>
                <Button
                  size="sm"
                  className="mt-1 w-fit rounded-full bg-gray-900 px-6 text-white hover:bg-orange-500"
                >
                  {promo.ctaLabel}
                </Button>
              </div>

              {/* Image */}
              <div className="relative ml-4 shrink-0">
                <img
                  src={promo.image}
                  alt={promo.title}
                  loading="lazy"
                  className="h-32 w-40 object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { CategoryPromotions }
