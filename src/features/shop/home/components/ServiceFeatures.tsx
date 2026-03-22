import { useTranslation } from 'react-i18next'
import { Truck, Headphones, RotateCcw, ShieldCheck } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

const SERVICE_ICONS = [Truck, Headphones, RotateCcw, ShieldCheck]
const SERVICE_KEYS = ['shipping', 'support', 'returns', 'warranty'] as const

function ServiceFeatures() {
  const { t } = useTranslation()
  const { ref, inView } = useInView({ threshold: 0.1 })

  const features = SERVICE_KEYS.map((key, i) => ({
    icon: SERVICE_ICONS[i],
    title: t(`home.service.${key}.title`),
    description: t(`home.service.${key}.desc`),
  }))

  return (
    <section className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1c23] py-10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={cn(
                'group flex items-center gap-4 rounded-xl p-4 transition-all duration-500 hover:bg-orange-50 dark:hover:bg-orange-500/10',
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { ServiceFeatures }
