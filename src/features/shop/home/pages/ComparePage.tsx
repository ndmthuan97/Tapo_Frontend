import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  ChevronRight, X, Plus, Check, Minus as DashIcon, Star, ShoppingCart,
  ImageOff, ArrowLeftRight, Search, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { productApi } from '@/lib/http/product.api'
import type { ProductDto } from '@/lib/types/product/product.types'
import { useCart } from '@/features/shop/cart/hooks/use-cart'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_COMPARE = 3

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUniqueSpecKeys(products: ProductDto[]): string[] {
  const keys = new Set<string>()
  products.forEach(p => {
    if (p.specifications) {
      Object.keys(p.specifications).forEach(k => keys.add(k))
    }
  })
  return Array.from(keys)
}

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
              ? 'fill-amber-400/50 text-amber-400'
              : 'text-gray-200 dark:text-white/10',
          )}
        />
      ))}
    </div>
  )
}

// ── Search Picker ─────────────────────────────────────────────────────────────

function ProductPicker({ onSelect, excludeIds }: { onSelect: (p: ProductDto) => void; excludeIds: string[] }) {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<ProductDto[]>([])
  const [searching, setSearching] = useState(false)

  // Quick fetch on keyword change
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true)
      const res = await productApi.getProducts({ search: keyword, size: 5 })
      setSearching(false)
      if (res.success && res.data) {
        setResults(res.data.content.filter(p => !excludeIds.includes(p.id)))
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [keyword, excludeIds])

  return (
    <div className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#21232d] shadow-xl shadow-black/10 p-2">
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder={t('compare.searchPlaceholder', 'Tìm sản phẩm...')}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-9 pr-3 py-2 text-xs text-gray-700 dark:text-gray-200 focus:border-orange-400 focus:outline-none"
        />
        {searching && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500" />}
      </div>

      <div className="max-h-60 overflow-y-auto space-y-1">
        {results.length === 0 && !searching ? (
          <p className="py-4 text-center text-xs text-gray-400">{t('common.noData')}</p>
        ) : (
          results.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-left"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-white/5">
                {p.thumbnailUrl ? (
                  <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff size={14} className="mx-auto mt-3 text-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 line-clamp-2">{p.name}</p>
                <p className="text-[10px] text-orange-500 font-bold mt-0.5">{formatCurrency(p.price)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}


// ── Main page ─────────────────────────────────────────────────────────────────

function ComparePage() {
  const { t } = useTranslation()
  const { addItem } = useCart()
  const [params, setParams] = useSearchParams()
  
  const [selected, setSelected] = useState<ProductDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 1. Initial Load: Read ?ids=... from URL and fetch them
  useEffect(() => {
    async function loadInitial() {
      const idsParam = params.get('ids')
      if (!idsParam) {
        setIsLoading(false)
        return
      }

      const idArray = idsParam.split(',').filter(Boolean).slice(0, MAX_COMPARE)
      if (idArray.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const fetched = await Promise.all(
        idArray.map(id => productApi.getProduct(id).then(res => res.data || null).catch(() => null))
      )
      setSelected(fetched.filter((p): p is ProductDto => p !== null))
      setIsLoading(false)
    }
    loadInitial()
  }, []) // Empty dependency array -> runs once on mount

  // 2. Sync selected products to URL ?ids=
  useEffect(() => {
    if (isLoading) return // Wait until initial load is done
    
    if (selected.length === 0) {
      setParams({}, { replace: true })
    } else {
      setParams({ ids: selected.map(p => p.id).join(',') }, { replace: true })
    }
  }, [selected, isLoading, setParams])

  // Close picker when clicking outside
  useEffect(() => {
    function h(e: MouseEvent) { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function addProduct(p: ProductDto) {
    if (selected.find(s => s.id === p.id) || selected.length >= MAX_COMPARE) return
    setSelected(prev => [...prev, p])
    setPickerOpen(false)
  }

  function removeProduct(id: string) {
    setSelected(prev => prev.filter(p => p.id !== id))
  }

  const specKeys = getUniqueSpecKeys(selected)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors pb-20">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/products" className="hover:text-orange-500">{t('productDetail.breadcrumbProducts')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('compare.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <ArrowLeftRight size={18} className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('compare.pageTitle')}</h1>
                <p className="text-sm text-gray-400">{t('compare.subtitle', { max: MAX_COMPARE })}</p>
              </div>
            </div>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
                disabled={isLoading}
              >
                <X size={14} /> {t('compare.clearAll')}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p>{t('common.loading')}</p>
            </div>
          ) : selected.length === 0 ? (
            <div className="mt-8 flex flex-col items-center py-20 text-center bg-white dark:bg-[#21232d] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <ArrowLeftRight size={48} className="text-gray-200 dark:text-white/10 mb-4" />
              <p className="text-gray-400">{t('compare.emptyHint')}</p>
              <div className="mt-6 w-full max-w-sm" ref={pickerRef}>
                <div className="relative">
                  <button
                    onClick={() => setPickerOpen(o => !o)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
                  >
                    <Plus size={16} /> {t('compare.addProduct')}
                  </button>
                  {pickerOpen && (
                    <ProductPicker onSelect={addProduct} excludeIds={[]} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm">
              <table className="w-full min-w-[640px] text-sm border-collapse">
                <colgroup>
                  <col className="w-36" />
                  {selected.map(p => <col key={p.id} />)}
                  {selected.length < MAX_COMPARE && <col />}
                </colgroup>

                {/* Product header row */}
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <th className="p-4 text-left text-xs font-semibold text-gray-400">{t('compare.product')}</th>
                    {selected.map(p => {
                      const disc = p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : null
                      return (
                        <th key={p.id} className="p-4 align-top border-l border-gray-100 dark:border-white/5">
                          <div className="relative group min-h-[220px] flex flex-col items-center">
                            <button
                              onClick={() => removeProduct(p.id)}
                              className="absolute -top-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                              title="Remove"
                            >
                              <X size={12} />
                            </button>

                            {/* Image */}
                            <div className="mx-auto mb-3 h-32 w-full max-w-[160px] overflow-hidden rounded-xl bg-white dark:bg-white/5">
                              {p.thumbnailUrl ? (
                                <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-contain p-2" />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <ImageOff size={28} className="text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div className="text-center flex-1 flex flex-col">
                              <span className="text-[10px] font-bold uppercase text-orange-500">{p.brandName}</span>
                              <Link to={`/products/${p.slug}`} className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug hover:text-orange-500 transition-colors">
                                {p.name}
                              </Link>
                              
                              <div className="mt-auto pt-2">
                                <div className="flex justify-center gap-1.5 flex-wrap items-end">
                                  <span className="text-base font-extrabold text-orange-500">{formatCurrency(p.price)}</span>
                                  {p.originalPrice && p.originalPrice > p.price && (
                                    <span className="text-xs text-gray-400 line-through mb-0.5">{formatCurrency(p.originalPrice)}</span>
                                  )}
                                  {disc && (
                                    <span className="self-start rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-500 mb-0.5">
                                      -{disc}%
                                    </span>
                                  )}
                                </div>
                                
                                <div className="mt-1 flex items-center justify-center gap-1">
                                  <Stars rating={p.avgRating || 5} />
                                  <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
                                </div>
                                
                                <button
                                  onClick={() => addItem(p.id, 1)}
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-[11px] font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
                                >
                                  <ShoppingCart size={12} /> {t('compare.addToCart', 'Thêm vào giỏ')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </th>
                      )
                    })}

                    {/* Add slot */}
                    {selected.length < MAX_COMPARE && (
                      <th className="p-4 align-middle border-l border-gray-100 dark:border-white/5">
                        <div className="relative h-full flex items-center justify-center min-h-[220px]" ref={pickerRef}>
                          <button
                            onClick={() => setPickerOpen(o => !o)}
                            className="mx-auto flex h-32 w-full max-w-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all"
                          >
                            <Plus size={24} />
                            <span className="text-xs font-medium">{t('compare.addProduct')}</span>
                          </button>

                          {/* Picker dropdown */}
                          {pickerOpen && (
                            <ProductPicker onSelect={addProduct} excludeIds={selected.map(s => s.id)} />
                          )}
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Spec rows */}
                <tbody>
                  {specKeys.map((key, rowIdx) => (
                    <tr key={key} className={cn('border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors', rowIdx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-white/[0.01]')}>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap align-top">
                        {key}
                      </td>
                      {selected.map(p => {
                        const val = p.specifications?.[key]
                        return (
                          <td key={p.id} className="px-4 py-3 text-center border-l border-gray-100 dark:border-white/5 align-top">
                            {val ? (
                              <span className="text-xs text-gray-700 dark:text-gray-300 inline-block text-left">{val}</span>
                            ) : (
                              <DashIcon size={12} className="mx-auto text-gray-300 dark:text-white/20 mt-1" />
                            )}
                          </td>
                        )
                      })}
                      {selected.length < MAX_COMPARE && <td className="border-l border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-transparent" />}
                    </tr>
                  ))}

                  {/* Verdict row */}
                  {selected.length > 1 && (
                    <tr className="bg-orange-50 dark:bg-orange-500/5">
                      <td className="px-4 py-5 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {t('compare.verdict', 'Nhận định')}
                      </td>
                      {selected.map((p) => {
                        // Very simple local verdict: lowest price gets best value
                        const minPrice = Math.min(...selected.map(s => s.price));
                        const isBest = p.price === minPrice;
                        return (
                          <td key={p.id} className="px-4 py-5 text-center border-l border-orange-100 dark:border-orange-500/10">
                            {isBest ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                                <Check size={12} /> {t('compare.bestValue', 'Giá tốt nhất')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        )
                      })}
                      {selected.length < MAX_COMPARE && <td className="border-l border-orange-100 dark:border-orange-500/10" />}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ComparePage }
