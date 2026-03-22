import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProductCard } from '@/components/common/ProductCard'
import { cn } from '@/lib/utils'

const LAPTOP_IMG =
  'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

type Category = 'all' | 'laptop' | 'accessories' | 'cameras' | 'audio'

interface FeaturedProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  discountPercent?: number
  category: Category
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  { id: 'f1', name: 'Lenovo Legion 5i Pro Gaming', price: 32990000, originalPrice: 38000000, image: LAPTOP_IMG, discountPercent: 13, category: 'laptop' },
  { id: 'f2', name: 'ASUS ROG Zephyrus G15',       price: 41500000, image: LAPTOP_IMG, category: 'laptop' },
  { id: 'f3', name: 'Camera TZ85 Optical 30x',     price: 12018000, originalPrice: 14689000, image: LAPTOP_IMG, discountPercent: 18, category: 'cameras' },
  { id: 'f4', name: 'Wireless Headphones NXTG',    price: 6009000, originalPrice: 8333000, image: LAPTOP_IMG, discountPercent: 28, category: 'audio' },
  { id: 'f5', name: 'Dell XPS 15 OLED 4K',         price: 45990000, image: LAPTOP_IMG, category: 'laptop' },
  { id: 'f6', name: 'USB-C Hub 12-in-1',           price: 890000, originalPrice: 1200000, image: LAPTOP_IMG, discountPercent: 26, category: 'accessories' },
  { id: 'f7', name: 'Sony ZV-E10 Mirrorless',      price: 15990000, image: LAPTOP_IMG, category: 'cameras' },
  { id: 'f8', name: 'Apple Magic Trackpad 3',       price: 3490000, originalPrice: 3990000, image: LAPTOP_IMG, discountPercent: 13, category: 'accessories' },
]

const TAB_VALUES: Category[] = ['all', 'laptop', 'accessories', 'cameras', 'audio']

function FeaturedCollection() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Category>('all')

  const tabs = TAB_VALUES.map((value) => ({
    value,
    label: t(`home.featured.tabs.${value}`),
  }))

  const filteredProducts =
    activeTab === 'all'
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter((p) => p.category === activeTab)

  return (
    <section className="bg-gray-50 dark:bg-[#21232d] py-14 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('home.featured.title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{t('home.featured.subtitle')}</p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-500" />
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all',
                activeTab === tab.value
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 px-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:border-orange-500 hover:text-orange-500"
          >
            {t('home.featured.viewAll')}
          </a>
        </div>
      </div>
    </section>
  )
}

export { FeaturedCollection }
