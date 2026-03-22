import { Truck, Headphones, RotateCcw, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over 1,000,000₫',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our team is always ready to help',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Full refund if not satisfied',
  },
  {
    icon: ShieldCheck,
    title: 'Official Warranty',
    description: '12–24 month manufacturer warranty',
  },
]

function ServiceFeatures() {
  return (
    <section className="border-b border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-orange-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { ServiceFeatures }
