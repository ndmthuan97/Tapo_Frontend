import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useProducts } from '@/features/shop/home/hooks/use-products'
import { useEffect } from 'react'
import { ChevronRight, LayoutGrid, Star, ImageOff, Heart, ShoppingCart, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { useState } from 'react'
import type { ProductDto } from '@/lib/types/product/product.types'

// ── Mock category metadata ────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { name: string; nameEn: string; description: string; descriptionEn: string; color: string }> = {
  default: {
    name: 'Danh mục',
    nameEn: 'Category',
    description: 'Khám phá các sản phẩm trong danh mục này',
    descriptionEn: 'Explore products in this category',
    color: 'from-orange-500 to-amber-400',
  },
  'laptop-gaming': {
    name: 'Laptop Gaming',
    nameEn: 'Gaming Laptops',
    description: 'Laptop gaming hiệu năng cao, thiết kế ấn tượng cho các game thủ đam mê',
    descriptionEn: 'High-performance gaming laptops with impressive designs for passionate gamers',
    color: 'from-orange-500 to-amber-400',
  },
  'laptop-van-phong': {
    name: 'Laptop Văn Phòng',
    nameEn: 'Business Laptops',
    description: 'Siêu mỏng, pin trâu, hiệu năng ổn định cho công việc hàng ngày',
    descriptionEn: 'Ultra-thin, long battery life, stable performance for daily work',
    color: 'from-blue-500 to-indigo-400',
  },
  'phu-kien': {
    name: 'Phụ Kiện',
    nameEn: 'Accessories',
    description: 'Tai nghe, chuột, bàn phím gaming và phụ kiện công nghệ cao cấp',
    descriptionEn: 'Headsets, mice, gaming keyboards and premium tech accessories',
    color: 'from-purple-500 to-pink-400',
  },
}

// ── Product card (minimal reuse) ──────────────────────────────────────────────

function ProductCard({ product }: { product: ProductDto }) {
  const { t } = useTranslation()
  const [wishlisted, setWishlisted] = useState(false)
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-all hover:shadow-lg hover:-translate-y-0.5">
      <button
        onClick={() => setWishlisted(w => !w)}
        className={cn('absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all', wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400')}
      >
        <Heart size={13} className={wishlisted ? 'fill-current' : ''} />
      </button>
      {discount && (
        <div className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
          -{discount}%
        </div>
      )}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-white/5 h-48">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center"><ImageOff size={32} className="text-gray-200 dark:text-white/10" /></div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button className="flex w-full items-center justify-center gap-2 bg-orange-500 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
            <ShoppingCart size={13} /> {t('products.card.addToCart')}
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">{product.brandName}</span>
        <h3 className="mt-0.5 mb-2 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug min-h-[2.5rem]">{product.name}</h3>
        <div className="mb-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} className={cn(i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10')} />
          ))}
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-orange-500">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</div>
            )}
          </div>
          {product.soldCount > 0 && (
            <span className="text-[10px] text-gray-400">{product.soldCount.toLocaleString()} {t('products.card.sold', { count: '' }).replace(' ', '')}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function CategoryPage() {
  const { slug = 'default' } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  const meta = CATEGORY_META[slug] ?? CATEGORY_META['default']

  const { products, isLoading } = useProducts()

  // Pre-filter by slug — in a real app we'd resolve categoryId from slug
  useEffect(() => {
    // With real API: setFilter({ categorySlug: slug })
    // For mock: load all products (no filter needed)
  }, [slug])

  const skeletons = Array.from({ length: 8 })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/products" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbProducts')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{isEn ? meta.nameEn : meta.name}</span>
            </nav>
          </div>
        </div>

        {/* Category hero banner */}
        <div className={cn('bg-gradient-to-r text-white', meta.color)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Tag size={20} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">{t('category.categoryLabel')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              {isEn ? meta.nameEn : meta.name}
            </h1>
            <p className="text-sm opacity-80 max-w-lg">
              {isEn ? meta.descriptionEn : meta.description}
            </p>
          </div>
        </div>

        {/* Products grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading
                ? t('products.loading')
                : t('products.countResult', { count: products.length })}
            </p>
            <Link to="/products" className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
              <LayoutGrid size={14} /> {t('category.viewAll')}
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {skeletons.map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-100 dark:bg-white/5" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-16" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="text-gray-400 text-sm">{t('products.empty.title')}</p>
              <Link to="/products" className="mt-4 text-sm font-medium text-orange-500 hover:underline">
                {t('products.empty.resetBtn')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { CategoryPage }
