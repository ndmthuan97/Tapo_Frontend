import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useProducts } from '@/features/shop/home/hooks/use-products'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  Search, X, Star, ImageOff, Heart, ShoppingCart, ChevronRight,
  ArrowUpDown, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductDto } from '@/lib/types/product/product.types'

// ── Product card ──────────────────────────────────────────────────────────────

function SearchResultCard({ product }: { product: ProductDto }) {
  const { t } = useTranslation()
  const [wishlisted, setWishlisted] = useState(false)
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div className="group flex gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
      <div className="relative shrink-0 w-28 h-28 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center"><ImageOff size={28} className="text-gray-300 dark:text-white/20" /></div>
        )}
        {discount && (
          <span className="absolute left-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase text-orange-500 tracking-wide">{product.brandName}</span>
            <span className="text-gray-200 dark:text-white/10">•</span>
            <span className="text-[10px] text-gray-400">{product.categoryName}</span>
          </div>
          <Link to={`/products/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={cn(i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10')} />
            ))}
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            {product.soldCount > 0 && (
              <span className="text-[10px] text-gray-400 ml-1">• {t('products.card.sold', { count: product.soldCount.toLocaleString() })}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-base font-bold text-orange-500">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWishlisted(w => !w)}
              className={cn('flex h-8 w-8 items-center justify-center rounded-full border transition-all', wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-red-300 hover:text-red-400')}
            >
              <Heart size={13} className={wishlisted ? 'fill-current' : ''} />
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
              <ShoppingCart size={12} /> {t('products.card.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(initialQ)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    products, totalPages, totalItems, isLoading, params,
    setSearch, setFilter, setPage,
  } = useProducts()

  const SORT_OPTIONS = [
    { value: 'createdAt,desc', labelKey: 'products.sort.newest' },
    { value: 'price,asc',      labelKey: 'products.sort.priceAsc' },
    { value: 'price,desc',     labelKey: 'products.sort.priceDesc' },
    { value: 'soldCount,desc', labelKey: 'products.sort.bestSelling' },
    { value: 'avgRating,desc', labelKey: 'products.sort.topRated' },
  ]

  const currentSort = SORT_OPTIONS.find(o => o.value === params.sort) ?? SORT_OPTIONS[0]
  const currentPage = (params.page ?? 0) + 1

  useEffect(() => {
    if (initialQ) setSearch(initialQ)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current) }, [])

  function handleInput(val: string) {
    setInputValue(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(val)
      setSearchParams(val ? { q: val } : {})
    }, 350)
  }

  function handleClear() {
    setInputValue('')
    setSearch('')
    setSearchParams({})
  }

  // Pagination dots
  const pageItems: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageItems.push(i)
  } else {
    pageItems.push(1)
    if (currentPage > 3) pageItems.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pageItems.push(i)
    if (currentPage < totalPages - 2) pageItems.push('...')
    pageItems.push(totalPages)
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
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('search.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Big search bar */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('search.pageTitle')}</h1>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={inputValue}
                onChange={e => handleInput(e.target.value)}
                placeholder={t('products.searchPlaceholder')}
                className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] pl-12 pr-12 py-4 text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition shadow-sm"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Result header + sort */}
          {(inputValue || products.length > 0) && (
            <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading
                  ? t('products.loading')
                  : inputValue
                  ? t('search.resultFor', { count: totalItems, query: inputValue })
                  : t('products.countResult', { count: totalItems })}
              </p>

              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortOpen(s => !s)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition"
                >
                  <ArrowUpDown size={13} />
                  {t(currentSort.labelKey)}
                  <ChevronDown size={12} className={cn('text-gray-400 transition-transform', sortOpen && 'rotate-180')} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setFilter({ sort: opt.value }); setSortOpen(false) }}
                        className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors', params.sort === opt.value ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}
                      >
                        {params.sort === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
                        {t(opt.labelKey)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-4 animate-pulse">
                  <div className="w-28 h-28 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-24" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !inputValue ? (
            /* Initial state — no query yet */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                <Search size={28} className="text-orange-400" />
              </div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-200">{t('search.placeholder')}</p>
              <p className="mt-1 text-sm text-gray-400">{t('search.placeholderSub')}</p>

              {/* Trending tags */}
              <div className="mt-6">
                <p className="text-xs text-gray-400 mb-2">{t('search.trending')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['ASUS ROG', 'RTX 4070', 'MacBook', 'Gaming Chair', 'SSD 2TB', 'Monitor 4K'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleInput(tag)}
                      className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            /* No results */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-800 dark:text-gray-100">{t('search.noResultTitle', { query: inputValue })}</p>
              <p className="mt-1 text-sm text-gray-400">{t('search.noResultSub')}</p>
              <button onClick={handleClear} className="mt-4 rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                {t('search.clearSearch')}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {products.map(p => <SearchResultCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1.5">
                  <button onClick={() => setPage(currentPage - 2)} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40">
                    ‹
                  </button>
                  {pageItems.map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage((p as number) - 1)}
                        className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all', currentPage === p ? 'bg-orange-500 text-white shadow-sm' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500')}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => setPage(currentPage)} disabled={currentPage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40">
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { SearchPage }
