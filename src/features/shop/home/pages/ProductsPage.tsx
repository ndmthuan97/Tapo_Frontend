import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/useDebounce'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useProducts } from '@/features/shop/home/hooks/use-products'
import { ShopProductCard } from '@/features/shop/home/components/ShopProductCard'
import { FilterSidebar } from '@/features/shop/home/components/FilterSidebar'
import { cn } from '@/lib/utils'
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, LayoutGrid, LayoutList, Tag,
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-100 dark:bg-white/5" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-20" />
        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-full" />
        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-100 dark:bg-white/5 rounded-full w-24" />
          <div className="h-8 w-8 bg-gray-100 dark:bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  )
}


// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnCls = 'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all'

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={cn(btnCls, 'border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed')}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)} className={cn(btnCls, page === p ? 'bg-orange-500 text-white shadow-sm shadow-orange-200/50' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500')}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={cn(btnCls, 'border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed')}>
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function ProductsPage() {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [inStock, setInStock] = useState<boolean | undefined>(undefined)

  // ── Debounce search ──────────────────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(searchInput, 350)

  const {
    products, totalPages, totalItems, isLoading, params, categories, brands,
    setPage, setSearch, setFilter, reset,
  } = useProducts()

  // ── Sync debounced search to query params ───────────────────────────────────────────────────
  useEffect(() => {
    setSearch(debouncedSearch)
  }, [debouncedSearch])  // eslint-disable-line react-hooks/exhaustive-deps

  const SORT_OPTIONS = [
    { value: 'createdAt,desc', labelKey: 'products.sort.newest' },
    { value: 'price,asc',      labelKey: 'products.sort.priceAsc' },
    { value: 'price,desc',     labelKey: 'products.sort.priceDesc' },
    { value: 'soldCount,desc', labelKey: 'products.sort.bestSelling' },
    { value: 'avgRating,desc', labelKey: 'products.sort.topRated' },
  ]
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearchChange(val: string) {
    setSearchInput(val)
  }

  function handlePriceApply(min: string, max: string) {
    setMinPrice(min)
    setMaxPrice(max)
    setFilter({
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
    })
  }

  function handleMinRating(rating: number | undefined) {
    setMinRating(rating)
    setFilter({ minRating: rating })
  }

  function handleInStock(v: boolean | undefined) {
    setInStock(v)
    setFilter({ inStock: v })
  }

  function handleReset() {
    setSearchInput('')
    setMinPrice('')
    setMaxPrice('')
    setMinRating(undefined)
    setInStock(undefined)
    reset()
  }

  const activeFilterCount = [
    params.categoryId, params.brandId,
    params.minPrice !== undefined, params.maxPrice !== undefined,
    params.minRating !== undefined, params.inStock,
    params.search,
  ].filter(Boolean).length

  const currentSort = SORT_OPTIONS.find(o => o.value === params.sort) ?? SORT_OPTIONS[0]
  const currentPage = (params.page ?? 0) + 1

  const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* ── Page header ─────────────────────── */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('products.pageTitle')}</h1>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {isLoading
                    ? t('products.loading')
                    : t('products.countResult', { count: totalItems.toLocaleString() })}
                  {params.search && <> {t('products.countResultFor')} "<span className="font-medium text-orange-500">{params.search}</span>"</>}
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder={t('products.searchPlaceholder')}
                  className={cn(inputCls, 'pl-9 pr-4')}
                />
                {searchInput && (
                  <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">

            {/* Desktop sidebar */}
            <div className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-20 rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-4">
                <FilterSidebar
                  categories={categories}
                  brands={brands}
                  selectedCategory={params.categoryId ?? ''}
                  selectedBrand={params.brandId ?? ''}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  minRating={minRating}
                  inStock={inStock}
                  onCategory={id => setFilter({ categoryId: id || undefined })}
                  onBrand={id => setFilter({ brandId: id || undefined })}
                  onPriceApply={handlePriceApply}
                  onMinRating={handleMinRating}
                  onInStock={handleInStock}
                  onReset={handleReset}
                  activeCount={activeFilterCount}
                />
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="mb-4 flex items-center gap-2">
                {/* Mobile filter btn */}
                <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition lg:hidden">
                  <SlidersHorizontal size={14} />
                  {t('products.filterBtn')}
                  {activeFilterCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{activeFilterCount}</span>}
                </button>

                {/* Sort */}
                <div ref={sortRef} className="relative ml-auto">
                  <button onClick={() => setSortOpen(s => !s)} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition">
                    <ArrowUpDown size={13} />
                    {t(currentSort.labelKey)}
                    <ChevronDown size={12} className={cn('text-gray-400 transition-transform', sortOpen && 'rotate-180')} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setFilter({ sort: opt.value }); setSortOpen(false) }}
                          className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors', params.sort === opt.value ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}>
                          {params.sort === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  {(['grid', 'list'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={cn('flex h-9 w-9 items-center justify-center transition-colors', view === v ? 'bg-orange-500 text-white' : 'bg-white dark:bg-[#21232d] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300')}>
                      {v === 'grid' ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {params.categoryId && (
                    <span className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      <Tag size={10} />
                      {categories.find(c => c.id === params.categoryId)?.name}
                      <button onClick={() => setFilter({ categoryId: undefined })}><X size={10} /></button>
                    </span>
                  )}
                  {params.brandId && (
                    <span className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      <Tag size={10} />
                      {brands.find(b => b.id === params.brandId)?.name}
                      <button onClick={() => setFilter({ brandId: undefined })}><X size={10} /></button>
                    </span>
                  )}
                  {(params.minPrice !== undefined || params.maxPrice !== undefined) && (
                    <span className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      {t('products.filter.priceChip', {
                        min: params.minPrice ? formatCurrency(params.minPrice) : '0',
                        max: params.maxPrice ? formatCurrency(params.maxPrice) : '∞',
                      })}
                      <button onClick={() => { handlePriceApply('', ''); setMinPrice(''); setMaxPrice('') }}><X size={10} /></button>
                    </span>
                  )}
                  {params.minRating !== undefined && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      ⭐ {params.minRating}+ sao
                      <button onClick={() => handleMinRating(undefined)}><X size={10} /></button>
                    </span>
                  )}
                  {params.inStock && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      📦 Còn hàng
                      <button onClick={() => handleInStock(undefined)}><X size={10} /></button>
                    </span>
                  )}
                </div>
              )}

              {/* Grid / List */}
              {isLoading ? (
                <div className={cn('gap-4', view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'flex flex-col')}>
                  {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={`skel-${i}`} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-800 dark:text-gray-100">{t('products.empty.title')}</p>
                  <p className="mt-1 text-sm text-gray-400">{t('products.empty.subtitle')}</p>
                  <button onClick={handleReset} className="mt-4 rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                    {t('products.empty.resetBtn')}
                  </button>
                </div>
              ) : (
                <div className={cn('gap-4', view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'flex flex-col')}>
                  {products.map(p => <ShopProductCard key={p.id} product={p} view={view} />)}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="mt-8">
                  <Pagination page={currentPage} totalPages={totalPages} onChange={p => setPage(p - 1)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white dark:bg-[#21232d] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-900 dark:text-white">{t('products.filterTitle')}</span>
                <button onClick={() => setSidebarOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  <X size={16} />
                </button>
              </div>
              <FilterSidebar
                categories={categories}
                brands={brands}
                selectedCategory={params.categoryId ?? ''}
                selectedBrand={params.brandId ?? ''}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minRating={minRating}
                inStock={inStock}
                onCategory={id => { setFilter({ categoryId: id || undefined }); setSidebarOpen(false) }}
                onBrand={id => { setFilter({ brandId: id || undefined }); setSidebarOpen(false) }}
                onPriceApply={(min, max) => { handlePriceApply(min, max); setSidebarOpen(false) }}
                onMinRating={r => { handleMinRating(r); setSidebarOpen(false) }}
                onInStock={v => { handleInStock(v); setSidebarOpen(false) }}
                onReset={handleReset}
                activeCount={activeFilterCount}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export { ProductsPage }
