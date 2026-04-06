import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarProps {
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
  selectedCategory: string
  selectedBrand: string
  minPrice: string
  maxPrice: string
  onCategory: (id: string) => void
  onBrand: (id: string) => void
  onPriceApply: (min: string, max: string) => void
  onReset: () => void
  activeCount: number
}

type PricePresetKey = 'under500' | 'm500to2m' | 'm2to5m' | 'above5m'

const PRICE_PRESETS: { key: PricePresetKey; min: string; max: string }[] = [
  { key: 'under500', min: '',        max: '500000' },
  { key: 'm500to2m', min: '500000',  max: '2000000' },
  { key: 'm2to5m',   min: '2000000', max: '5000000' },
  { key: 'above5m',  min: '5000000', max: '' },
]

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
      {label}
      <ChevronDown size={14} className={cn('text-gray-400 transition-transform duration-200', expanded && 'rotate-180')} />
    </button>
  )
}

export function FilterSidebar({
  categories, brands, selectedCategory, selectedBrand,
  minPrice: initMin, maxPrice: initMax,
  onCategory, onBrand, onPriceApply, onReset, activeCount,
}: SidebarProps) {
  const { t } = useTranslation()
  const [min, setMin] = useState(initMin)
  const [max, setMax] = useState(initMax)
  const [catExpanded, setCatExpanded] = useState(true)
  const [brandExpanded, setBrandExpanded] = useState(true)
  const [priceExpanded, setPriceExpanded] = useState(true)

  useEffect(() => { setMin(initMin); setMax(initMax) }, [initMin, initMax])

  return (
    <aside className="w-full space-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-orange-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('products.filterTitle')}</span>
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors">
            <X size={11} /> {t('products.clearFilter')}
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border-t border-gray-100 dark:border-white/5 pt-1">
        <SectionHeader label={t('products.filter.categories')} expanded={catExpanded} onToggle={() => setCatExpanded(s => !s)} />
        {catExpanded && (
          <div className="space-y-0.5 pb-2">
            <button onClick={() => onCategory('')} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors', !selectedCategory ? 'bg-orange-50 dark:bg-orange-500/10 font-semibold text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5')}>
              <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', !selectedCategory ? 'bg-orange-500' : 'bg-gray-300 dark:bg-white/20')} />
              {t('products.filter.allCategories')}
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => onCategory(cat.id)} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors', selectedCategory === cat.id ? 'bg-orange-50 dark:bg-orange-500/10 font-semibold text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5')}>
                <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', selectedCategory === cat.id ? 'bg-orange-500' : 'bg-gray-300 dark:bg-white/20')} />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-t border-gray-100 dark:border-white/5 pt-1">
        <SectionHeader label={t('products.filter.brands')} expanded={brandExpanded} onToggle={() => setBrandExpanded(s => !s)} />
        {brandExpanded && (
          <div className="space-y-0.5 pb-2">
            <button onClick={() => onBrand('')} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors', !selectedBrand ? 'bg-orange-50 dark:bg-orange-500/10 font-semibold text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', !selectedBrand ? 'bg-orange-500' : 'bg-gray-300 dark:bg-white/20')} />
              {t('products.filter.allBrands')}
            </button>
            {brands.map(brand => (
              <button key={brand.id} onClick={() => onBrand(brand.id)} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors', selectedBrand === brand.id ? 'bg-orange-50 dark:bg-orange-500/10 font-semibold text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', selectedBrand === brand.id ? 'bg-orange-500' : 'bg-gray-300 dark:bg-white/20')} />
                {brand.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="border-t border-gray-100 dark:border-white/5 pt-1">
        <SectionHeader label={t('products.filter.priceRange')} expanded={priceExpanded} onToggle={() => setPriceExpanded(s => !s)} />
        {priceExpanded && (
          <div className="pb-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {PRICE_PRESETS.map(p => (
                <button key={p.key} onClick={() => { setMin(p.min); setMax(p.max); onPriceApply(p.min, p.max) }}
                  className={cn('rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors text-center', min === p.min && max === p.max ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500')}>
                  {t(`products.filter.pricePresets.${p.key}`)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                placeholder={t('products.filter.priceFrom')}
                value={min}
                onChange={e => setMin(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2d3a] px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="shrink-0 text-gray-400 text-xs">–</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={t('products.filter.priceTo')}
                value={max}
                onChange={e => setMax(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2d3a] px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button onClick={() => onPriceApply(min, max)} className="w-full rounded-lg bg-orange-500 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
              {t('products.filter.priceApply')}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
