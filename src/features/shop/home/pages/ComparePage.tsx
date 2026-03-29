import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  ChevronRight, X, Plus, Check, Minus as DashIcon, Star, ShoppingCart,
  ImageOff, ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────────

type CompareProduct = {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number | null
  image: string
  avgRating: number
  reviewCount: number
  specs: Record<string, string>
}

// ── Mock pool ──────────────────────────────────────────────────────────────────

const PRODUCT_POOL: CompareProduct[] = [
  {
    id: 'p1',
    name: 'ASUS ROG Strix G16 2024',
    brand: 'ASUS ROG',
    category: 'Laptop Gaming',
    price: 45990000,
    originalPrice: 52000000,
    image: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg',
    avgRating: 4.6,
    reviewCount: 128,
    specs: {
      CPU: 'Intel Core i9-14900HX 5.8 GHz',
      GPU: 'NVIDIA RTX 4070 Super 8GB',
      RAM: '32GB DDR5 4800MHz',
      'Ổ cứng': '1TB SSD NVMe PCIe 4.0',
      'Màn hình': '16" QHD 240Hz IPS',
      Pin: '90Wh, Sạc 240W',
      'Trọng lượng': '2.3 kg',
      'Hệ điều hành': 'Windows 11 Home',
      'Bảo hành': '24 tháng',
    },
  },
  {
    id: 'p2',
    name: 'Lenovo Legion 5i Pro Gen 8',
    brand: 'Lenovo',
    category: 'Laptop Gaming',
    price: 32990000,
    originalPrice: null,
    image: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    avgRating: 4.5,
    reviewCount: 94,
    specs: {
      CPU: 'Intel Core i7-13700HX 5.0 GHz',
      GPU: 'NVIDIA RTX 4060 8GB',
      RAM: '16GB DDR5 4800MHz',
      'Ổ cứng': '512GB SSD NVMe PCIe 4.0',
      'Màn hình': '16" QHD 165Hz IPS',
      Pin: '80Wh, Sạc 230W',
      'Trọng lượng': '2.5 kg',
      'Hệ điều hành': 'Windows 11 Home',
      'Bảo hành': '24 tháng',
    },
  },
  {
    id: 'p3',
    name: 'MSI Raider GE78 HX 2024',
    brand: 'MSI',
    category: 'Laptop Gaming',
    price: 54990000,
    originalPrice: 60000000,
    image: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    avgRating: 4.7,
    reviewCount: 67,
    specs: {
      CPU: 'Intel Core i9-14900HX 5.8 GHz',
      GPU: 'NVIDIA RTX 4080 12GB',
      RAM: '32GB DDR5 5200MHz',
      'Ổ cứng': '2TB SSD NVMe PCIe 5.0',
      'Màn hình': '17.3" QHD 240Hz Mini-LED',
      Pin: '99.9Wh, Sạc 330W',
      'Trọng lượng': '3.1 kg',
      'Hệ điều hành': 'Windows 11 Home',
      'Bảo hành': '24 tháng',
    },
  },
  {
    id: 'p4',
    name: 'Dell Alienware m18 R2',
    brand: 'Dell',
    category: 'Laptop Gaming',
    price: 72990000,
    originalPrice: null,
    image: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    avgRating: 4.8,
    reviewCount: 45,
    specs: {
      CPU: 'Intel Core i9-14900HX 5.8 GHz',
      GPU: 'NVIDIA RTX 4090 16GB',
      RAM: '64GB DDR5 5600MHz',
      'Ổ cứng': '2TB SSD NVMe PCIe 4.0',
      'Màn hình': '18" QHD+ 480Hz IPS',
      Pin: '99Wh, Sạc 330W',
      'Trọng lượng': '4.2 kg',
      'Hệ điều hành': 'Windows 11 Home',
      'Bảo hành': '36 tháng',
    },
  },
]

const ALL_SPEC_KEYS = [
  'CPU', 'GPU', 'RAM', 'Ổ cứng', 'Màn hình', 'Pin', 'Trọng lượng', 'Hệ điều hành', 'Bảo hành',
]

const MAX_COMPARE = 3

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
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

// ── Main page ─────────────────────────────────────────────────────────────────

function ComparePage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<CompareProduct[]>([PRODUCT_POOL[0], PRODUCT_POOL[1]])
  const [pickerOpen, setPickerOpen] = useState(false)

  function addProduct(p: CompareProduct) {
    if (selected.find(s => s.id === p.id) || selected.length >= MAX_COMPARE) return
    setSelected(prev => [...prev, p])
    setPickerOpen(false)
  }

  function removeProduct(id: string) {
    setSelected(prev => prev.filter(p => p.id !== id))
  }

  const available = PRODUCT_POOL.filter(p => !selected.find(s => s.id === p.id))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
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
              >
                <X size={14} /> {t('compare.clearAll')}
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm">
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <colgroup>
                <col className="w-36" />
                {selected.map(p => <col key={p.id} />)}
                {selected.length < MAX_COMPARE && <col />}
              </colgroup>

              {/* Product header row */}
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="p-4 text-left text-xs font-semibold text-gray-400">{t('compare.product')}</th>
                  {selected.map(p => {
                    const disc = p.originalPrice
                      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                      : null
                    return (
                      <th key={p.id} className="p-4 align-top">
                        <div className="relative group">
                          <button
                            onClick={() => removeProduct(p.id)}
                            className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            title="Remove"
                          >
                            <X size={10} />
                          </button>

                          {/* Image */}
                          <div className="mx-auto mb-2 h-32 w-full max-w-[140px] overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageOff size={28} className="text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="text-center">
                            <span className="text-[10px] font-bold uppercase text-orange-500">{p.brand}</span>
                            <h2 className="mt-0.5 text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">{p.name}</h2>
                            <div className="mt-1.5 flex justify-center gap-1.5 flex-wrap">
                              <span className="text-base font-extrabold text-orange-500">{formatCurrency(p.price)}</span>
                              {p.originalPrice && (
                                <span className="text-xs text-gray-400 line-through mt-0.5">{formatCurrency(p.originalPrice)}</span>
                              )}
                              {disc && (
                                <span className="self-start rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  -{disc}%
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center justify-center gap-1">
                              <Stars rating={p.avgRating} />
                              <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
                            </div>
                            <Link
                              to={`/products/${p.id}`}
                              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-orange-600 transition-colors"
                            >
                              <ShoppingCart size={11} /> {t('compare.addToCart')}
                            </Link>
                          </div>
                        </div>
                      </th>
                    )
                  })}

                  {/* Add slot */}
                  {selected.length < MAX_COMPARE && (
                    <th className="p-4 align-middle">
                      <div className="relative">
                        <button
                          onClick={() => setPickerOpen(o => !o)}
                          className="mx-auto flex h-32 w-full max-w-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all"
                        >
                          <Plus size={24} />
                          <span className="text-xs font-medium">{t('compare.addProduct')}</span>
                        </button>

                        {/* Picker dropdown */}
                        {pickerOpen && available.length > 0 && (
                          <div className="absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#21232d] shadow-xl shadow-black/10 p-2">
                            {available.map(p => (
                              <button
                                key={p.id}
                                onClick={() => addProduct(p)}
                                className="flex w-full items-center gap-3 rounded-xl p-2.5 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-left"
                              >
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">{p.name}</p>
                                  <p className="text-[10px] text-orange-500">{formatCurrency(p.price)}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Spec rows */}
              <tbody>
                {ALL_SPEC_KEYS.map((key, rowIdx) => (
                  <tr key={key} className={cn('border-b border-gray-100 dark:border-white/5 last:border-0', rowIdx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[0.02]')}>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {key}
                    </td>
                    {selected.map(p => {
                      const val = p.specs[key]
                      return (
                        <td key={p.id} className="px-4 py-3 text-center">
                          {val ? (
                            <span className="text-xs text-gray-700 dark:text-gray-300">{val}</span>
                          ) : (
                            <DashIcon size={12} className="mx-auto text-gray-300 dark:text-white/20" />
                          )}
                        </td>
                      )
                    })}
                    {selected.length < MAX_COMPARE && <td />}
                  </tr>
                ))}

                {/* Verdict row */}
                <tr className="bg-orange-50 dark:bg-orange-500/5">
                  <td className="px-4 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {t('compare.verdict')}
                  </td>
                  {selected.map((p, i) => {
                    const isBest = p.price === Math.min(...selected.map(s => s.price / s.avgRating))
                    return (
                      <td key={p.id} className="px-4 py-4 text-center">
                        {i === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
                            <Check size={10} /> {t('compare.bestValue')}
                          </span>
                        ) : isBest ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
                            <Check size={10} /> {t('compare.bestValue')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    )
                  })}
                  {selected.length < MAX_COMPARE && <td />}
                </tr>
              </tbody>
            </table>
          </div>

          {selected.length === 0 && (
            <div className="mt-8 flex flex-col items-center py-20 text-center">
              <ArrowLeftRight size={48} className="text-gray-200 dark:text-white/10 mb-4" />
              <p className="text-gray-400">{t('compare.emptyHint')}</p>
              <Link
                to="/products"
                className="mt-4 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                {t('compare.browseProducts')}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ComparePage }
