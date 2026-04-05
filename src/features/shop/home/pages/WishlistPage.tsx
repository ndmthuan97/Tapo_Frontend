import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { Heart, ShoppingCart, Trash2, Star, ChevronRight, ImageOff } from 'lucide-react'
import { WishlistCardSkeletonGrid } from '@/components/ui/SkeletonComponents'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/features/shop/home/hooks/use-wishlist'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import type { WishlistItemDto } from '@/lib/http/wishlist.api'
import { toast } from 'sonner'

// ── Wish card ─────────────────────────────────────────────────────────────────

function WishlistCard({
  item,
  onRemove,
  onAddToCart,
}: {
  item: WishlistItemDto
  onRemove: (productId: string) => void
  onAddToCart: (productId: string) => void
}) {
  const { t } = useTranslation()
  const discount = item.originalPrice && item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null

  return (
    <div className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-4 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
      {/* Image */}
      <div className="relative w-full sm:w-40 h-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.productName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={28} className="text-gray-300 dark:text-white/20" />
          </div>
        )}
        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${item.productSlug}`}
            className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
            {item.productName}
          </Link>
          <button
            onClick={() => onRemove(item.productId)}
            className="mt-0.5 shrink-0 rounded-full p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {item.brandName && (
          <p className="mt-1 text-xs text-gray-400">{item.brandName} · {item.categoryName}</p>
        )}

        {/* Rating */}
        {item.avgRating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11}
                  className={cn(s <= Math.round(item.avgRating) ? 'fill-orange-400 text-orange-400' : 'text-gray-200 dark:text-white/10')} />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">({item.reviewCount?.toLocaleString()})</span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <div>
            <p className="text-base font-bold text-orange-500">{formatCurrency(item.price)}</p>
            {item.originalPrice && item.originalPrice > item.price && (
              <p className="text-xs text-gray-400 line-through">{formatCurrency(item.originalPrice)}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {item.stock === 0 ? (
              <span className="rounded-full bg-gray-100 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400">
                {t('productDetail.outOfStock')}
              </span>
            ) : (
              <button
                onClick={() => onAddToCart(item.productId)}
                className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200/50"
              >
                <ShoppingCart size={13} />
                {t('productDetail.addToCart')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function WishlistPage() {
  const { t } = useTranslation()
  const { wishlist, isLoading, toggle, reload } = useWishlist()
  const { addItem } = useCart()

  const handleRemove = useCallback(async (productId: string) => {
    await toggle(productId)
    toast.success('Đã xóa khỏi danh sách yêu thích')
  }, [toggle])

  const handleAddToCart = useCallback(async (productId: string) => {
    const result = await addItem(productId, 1)
    if (result.success) {
      toast.success('Đã thêm vào giỏ hàng')
    } else {
      toast.error('Không thể thêm vào giỏ hàng')
    }
  }, [addItem])

  const handleAddAllToCart = useCallback(async () => {
    const inStock = wishlist.content.filter(w => w.stock > 0)
    for (const item of inStock) {
      await addItem(item.productId, 1)
    }
    toast.success(`Đã thêm ${inStock.length} sản phẩm vào giỏ hàng`)
    reload()
  }, [wishlist.content, addItem, reload])

  const items = wishlist.content

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
                <p className="mt-0.5 text-sm text-gray-400">{t('wishlist.count', { count: wishlist.totalElements })}</p>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
                >
                  <ShoppingCart size={15} /> {t('wishlist.addAllToCart')}
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <WishlistCardSkeletonGrid count={8} />
          ) : items.length === 0 ? (
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
                <WishlistCard
                  key={item.wishlistId}
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                />
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
