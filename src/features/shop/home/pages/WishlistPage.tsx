import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { Heart, ShoppingCart, Trash2, Star, ChevronRight, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_WISHLIST = [
  {
    id: 'w1',
    name: 'Laptop Gaming ASUS ROG Strix G16 2024 - Intel Core i9',
    price: 45990000,
    originalPrice: 52000000,
    thumbnailUrl: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg',
    brandName: 'ASUS ROG',
    categoryName: 'Laptop Gaming',
    avgRating: 4.6,
    reviewCount: 128,
    stock: 12,
  },
  {
    id: 'w2',
    name: 'Lenovo Legion 5i Pro Gen 8 - Intel Core i7',
    price: 32990000,
    originalPrice: null,
    thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    brandName: 'Lenovo',
    categoryName: 'Laptop Gaming',
    avgRating: 4.5,
    reviewCount: 87,
    stock: 5,
  },
  {
    id: 'w3',
    name: 'MSI Raider GE78 HX 2024 - Intel Core i9 Ultra',
    price: 54990000,
    originalPrice: 60000000,
    thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    brandName: 'MSI',
    categoryName: 'Laptop Gaming',
    avgRating: 4.7,
    reviewCount: 62,
    stock: 0,
  },
  {
    id: 'w4',
    name: 'Dell XPS 15 9530 - Intel Core i7 13700H',
    price: 38990000,
    originalPrice: 42000000,
    thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    brandName: 'Dell',
    categoryName: 'Laptop Văn phòng',
    avgRating: 4.8,
    reviewCount: 154,
    stock: 8,
  },
]

// ── Wish card ─────────────────────────────────────────────────────────────────

function WishlistCard({
  item,
  onRemove,
}: {
  item: typeof MOCK_WISHLIST[0]
  onRemove: (id: string) => void
}) {
  const { t } = useTranslation()
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null

  return (
    <div className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
      {/* Image */}
      <div className="relative w-full sm:w-40 h-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={32} className="text-gray-300 dark:text-white/20" />
          </div>
        )}
        {discount && (
          <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">{item.brandName}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="shrink-0 rounded-full p-1.5 text-gray-300 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <Link to={`/products/${item.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
              {item.name}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className={cn(i < Math.round(item.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10')} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({item.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div>
            <span className="text-lg font-bold text-orange-500">{formatCurrency(item.price)}</span>
            {item.originalPrice && (
              <span className="ml-2 text-xs text-gray-400 line-through">{formatCurrency(item.originalPrice)}</span>
            )}
          </div>

          {item.stock > 0 ? (
            <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200/50">
              <ShoppingCart size={13} /> {t('wishlist.addToCart')}
            </button>
          ) : (
            <span className="rounded-full bg-gray-100 dark:bg-white/5 px-4 py-2 text-xs font-medium text-gray-400">
              {t('wishlist.outOfStock')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function WishlistPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState(MOCK_WISHLIST)

  function handleRemove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function handleClear() {
    setItems([])
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('wishlist.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header row */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart size={22} className="text-red-500 fill-red-500" />
                {t('wishlist.pageTitle')}
              </h1>
              {items.length > 0 && (
                <p className="mt-0.5 text-sm text-gray-400">{t('wishlist.count', { count: items.length })}</p>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={13} /> {t('wishlist.clearAll')}
                </button>
                <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50">
                  <ShoppingCart size={15} /> {t('wishlist.addAllToCart')}
                </button>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <Heart size={36} className="text-red-300 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('wishlist.emptyTitle')}</h2>
              <p className="mt-1 text-sm text-gray-400 max-w-xs">{t('wishlist.emptySubtitle')}</p>
              <div className="mt-6 h-1 w-10 rounded-full bg-orange-500" />
              <Link
                to="/products"
                className="mt-6 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
              >
                {t('wishlist.browseProducts')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { WishlistPage }
