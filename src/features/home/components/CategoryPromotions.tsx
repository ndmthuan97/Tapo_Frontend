import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

const LAPTOP_IMAGE_URL =
  'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

const PROMO_STATIC = [
  { key: 'p1', bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',   accent: 'text-blue-600'   },
  { key: 'p2', bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',   accent: 'text-purple-600' },
  { key: 'p3', bgColor: 'bg-gradient-to-br from-slate-50 to-gray-100',    accent: 'text-slate-700'  },
  { key: 'p4', bgColor: 'bg-gradient-to-br from-orange-50 to-red-100',    accent: 'text-orange-600' },
] as const

function CategoryPromotions() {
  const { t } = useTranslation()
  const { ref, inView } = useInView({ threshold: 0.08 })

  const promotions = PROMO_STATIC.map(({ key, bgColor, accent }) => ({
    key,
    bgColor,
    accent,
    tag:      t(`home.promo.${key}.tag`),
    title:    t(`home.promo.${key}.title`),
    subtitle: t(`home.promo.${key}.subtitle`),
    cta:      t(`home.promo.${key}.cta`),
  }))

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {promotions.map((promo, i) => (
            <div
              key={promo.key}
              className={cn(
                `group relative flex items-center justify-between overflow-hidden rounded-2xl p-8 transition-all duration-600 hover:shadow-lg ${promo.bgColor}`,
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
              )}
              style={{
                transitionProperty: 'opacity, transform, box-shadow',
                transitionDuration: '600ms',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="z-10 flex flex-col gap-3">
                <span className={`text-xs font-semibold uppercase tracking-widest ${promo.accent}`}>
                  {promo.tag}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{promo.title}</h3>
                <p className="text-sm text-gray-600">{promo.subtitle}</p>
                <Button size="sm" className="mt-1 w-fit rounded-full bg-gray-900 px-6 text-white hover:bg-orange-500">
                  {promo.cta}
                </Button>
              </div>
              <div className="relative ml-4 shrink-0">
                <img
                  src={LAPTOP_IMAGE_URL}
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
