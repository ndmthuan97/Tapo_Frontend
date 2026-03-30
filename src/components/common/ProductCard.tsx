import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, ImageOff, ArrowLeftRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { useState, useCallback } from 'react'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import { wishlistApi } from '@/lib/http/wishlist.api'
import { useAuthContext } from '@/lib/context/auth-context'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  image: string
  discountPercent?: number
  avgRating?: number
  reviewCount?: number
  soldCount?: number
  brandName?: string
  categoryName?: string
  inStock?: boolean
  className?: string
}

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
              ? 'fill-amber-400/50 text-amber-400'
              : 'fill-transparent text-gray-200 dark:text-white/10',
          )}
        />
      ))}
    </div>
  )
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  discountPercent,
  avgRating = 0,
  reviewCount = 0,
  soldCount,
  brandName,
  inStock = true,
  className,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuthContext()

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Vui lòng đăng nhập để thêm vào yêu thích'); return }
    if (wishlistLoading) return
    setWishlistLoading(true)
    const optimistic = !wishlisted
    setWishlisted(optimistic)
    const result = optimistic
      ? await wishlistApi.addToWishlist(id)
      : await wishlistApi.removeFromWishlist(id)
    setWishlistLoading(false)
    if (!result.success) {
      setWishlisted(!optimistic) // revert
      toast.error('Thao tác yêu thích thất bại')
    } else {
      toast.success(optimistic ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
    }
  }, [id, user, wishlisted, wishlistLoading])

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock || addingToCart) return
    setAddingToCart(true)
    const result = await addItem(id, 1)
    setAddingToCart(false)
    if (result.success) {
      setJustAdded(true)
      toast.success('Đã thêm vào giỏ hàng')
      setTimeout(() => setJustAdded(false), 2000)
    } else {
      toast.error('Thêm vào giỏ thất bại', { description: result.error?.message })
    }
  }

  const disc =
    discountPercent ??
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null)

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5',
        'bg-white dark:bg-[#21232d] shadow-sm transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30',
        'hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-white/5">
        <Link to={`/products/${id}`} className="block">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-48 items-center justify-center">
              <ImageOff size={36} className="text-gray-300 dark:text-white/10" />
            </div>
          )}
        </Link>

        {/* Discount badge */}
        {disc && (
          <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white shadow">
            -{disc}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-end bg-black/30">
            <span className="w-full bg-black/60 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-sm">
              Hết hàng
            </span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all',
              wishlisted
                ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-500'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-400 hover:border-red-300 hover:text-red-400',
            )}
          >
            <Heart size={13} className={wishlisted ? 'fill-current' : ''} />
          </button>

          {/* Compare */}
          <Link
            to={`/compare?ids=${id}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-400 shadow-sm hover:border-orange-300 hover:text-orange-500 transition-all"
          >
            <ArrowLeftRight size={12} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {brandName && (
          <span className="mb-1 text-[10px] font-bold uppercase tracking-wide text-orange-500">
            {brandName}
          </span>
        )}

        <Link to={`/products/${id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={avgRating} />
            <span className="text-[10px] text-gray-400">({reviewCount.toLocaleString()})</span>
            {soldCount != null && soldCount > 0 && (
              <span className="text-[10px] text-gray-400 ml-0.5">• Đã bán {soldCount.toLocaleString()}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-orange-500">{formatCurrency(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all',
            inStock
              ? justAdded
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200/60'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200/60 active:scale-[0.98]'
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed',
          )}
        >
          {justAdded ? <Check size={13} /> : <ShoppingCart size={13} />}
          {!inStock ? 'Hết hàng' : justAdded ? 'Đã thêm!' : addingToCart ? '...' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  )
}

export { ProductCard }
export type { ProductCardProps }
