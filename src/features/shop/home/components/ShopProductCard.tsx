import { useTranslation } from 'react-i18next'
import { Star, ImageOff, Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { useWishlist } from '@/features/shop/home/hooks/use-wishlist'
import type { ProductDto } from '@/lib/types/product/product.types'

interface Props {
  product: ProductDto
  view: 'grid' | 'list'
}

export function ShopProductCard({ product, view }: Props) {
  const { t } = useTranslation()
  const { isWishlisted, toggle } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  if (view === 'list') {
    return (
      <div className="group flex gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
        <div className="relative shrink-0 w-36 h-36 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff size={28} className="text-gray-300 dark:text-white/20" />
            </div>
          )}
          {discountPercent && (
            <span className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-medium text-orange-500 uppercase tracking-wide">{product.brandName}</span>
              <span className="text-gray-200 dark:text-white/10">•</span>
              <span className="text-[11px] text-gray-400">{product.categoryName}</span>
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{product.name}</h3>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-400 dark:text-gray-500">{product.description}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className={cn('transition-colors', i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10')} />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
              {product.soldCount > 0 && (
                <span className="text-[11px] text-gray-400">• {t('products.card.sold', { count: product.soldCount.toLocaleString() })}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-orange-500">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(product.id)}
                className={cn('flex h-8 w-8 items-center justify-center rounded-full border transition-all', wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-red-300 hover:text-red-400')}
              >
                <Heart size={14} className={wishlisted ? 'fill-current' : ''} />
              </button>
              <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200/50">
                <ShoppingCart size={12} /> {t('products.card.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-all hover:shadow-lg hover:-translate-y-0.5 dark:hover:shadow-black/20">
      <button
        onClick={() => toggle(product.id)}
        className={cn('absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all', wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400')}
      >
        <Heart size={13} className={wishlisted ? 'fill-current' : ''} />
      </button>

      {discountPercent && (
        <div className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white shadow-sm shadow-orange-300/50">
          -{discountPercent}%
        </div>
      )}

      <div className="relative overflow-hidden bg-gray-50 dark:bg-white/5 h-52">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={36} className="text-gray-200 dark:text-white/10" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button className="flex w-full items-center justify-center gap-2 bg-orange-500 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors">
            <ShoppingCart size={13} /> {t('products.card.addToCart')}
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">{product.brandName}</span>
          <span className="text-gray-200 dark:text-white/10 text-xs">•</span>
          <span className="text-[10px] text-gray-400 truncate">{product.categoryName}</span>
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug min-h-[2.5rem]">{product.name}</h3>
        <div className="mb-2.5 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={cn(i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10')} />
            ))}
          </div>
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
            <span className="text-[10px] text-gray-400">{t('products.card.sold', { count: product.soldCount.toLocaleString() })}</span>
          )}
        </div>
      </div>
    </div>
  )
}
