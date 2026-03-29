import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import { toast } from 'sonner'
import {
  ShoppingCart, Trash2, ChevronRight, ImageOff, Plus, Minus,
  Tag, Shield, Truck, ArrowRight, Loader2,
} from 'lucide-react'
import { useState } from 'react'
import type { CartItemDto } from '@/lib/types/cart/cart.types'

// ── Cart item row ─────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: CartItemDto
  onRemove: (productId: string) => void
  onQuantityChange: (productId: string, qty: number) => void
}) {
  const { t } = useTranslation()
  const discount = item.originalPrice && item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 dark:border-white/5 last:border-0">
      {/* Image */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.productName} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={24} className="text-gray-300 dark:text-white/20" />
          </div>
        )}
        {discount && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase text-orange-500 tracking-wide">{item.brandName}</span>
            <Link to={`/products/${item.productId}`}>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
                {item.productName}
              </h3>
            </Link>
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            className="shrink-0 rounded-full p-1.5 text-gray-300 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          {/* Quantity stepper */}
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-base font-bold text-orange-500">{formatCurrency(item.lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-gray-400">{formatCurrency(item.price)} / {t('cart.each')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function CartPage() {
  const { t } = useTranslation()
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart()
  const { items, subtotal } = cart
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  async function handleRemove(productId: string) {
    await removeItem(productId)
    toast.success(t('cart.removeSuccess'))
  }

  async function handleQuantityChange(productId: string, qty: number) {
    if (qty < 1) return
    await updateQuantity(productId, qty)
  }

  async function handleClear() {
    await clearCart()
    toast.success(t('cart.clearSuccess'))
  }

  function handleCoupon() {
    if (coupon.trim().toUpperCase() === 'TAPO10') {
      setCouponApplied(true)
      toast.success(t('cart.couponApplied'))
    } else {
      toast.error(t('cart.couponInvalid'))
    }
  }

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal >= 2_000_000 ? 0 : 50_000
  const total = subtotal - discount + shipping

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
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('cart.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={22} className="text-orange-500" />
              {t('cart.pageTitle')}
            </h1>
            {isLoading && <Loader2 size={18} className="animate-spin text-orange-400" />}
            {!isLoading && items.length > 0 && (
              <span className="text-sm text-gray-400">{t('cart.count', { count: items.length })}</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 size={40} className="animate-spin text-orange-400" />
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                <ShoppingCart size={36} className="text-orange-300 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('cart.emptyTitle')}</h2>
              <p className="mt-1 text-sm text-gray-400 max-w-xs">{t('cart.emptySubtitle')}</p>
              <div className="mt-6 h-1 w-10 rounded-full bg-orange-500" />
              <Link
                to="/products"
                className="mt-6 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 px-6">
                  {items.map(item => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link to="/products" className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium">
                    ← {t('cart.continueShopping')}
                  </Link>
                  <button onClick={handleClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> {t('cart.clearCart')}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Coupon */}
                  <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                    <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <Tag size={14} className="text-orange-500" /> {t('cart.couponTitle')}
                    </h3>
                    {couponApplied ? (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-2">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">TAPO10 — {t('cart.couponApplied')}</span>
                        <button onClick={() => { setCouponApplied(false); setCoupon('') }} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={coupon}
                          onChange={e => setCoupon(e.target.value.toUpperCase())}
                          placeholder={t('cart.couponPlaceholder')}
                          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm placeholder:text-gray-400 text-gray-700 dark:text-gray-300 focus:border-orange-400 focus:outline-none transition"
                        />
                        <button
                          onClick={handleCoupon}
                          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                        >
                          {t('cart.couponApplyBtn')}
                        </button>
                      </div>
                    )}
                    <p className="mt-1.5 text-[10px] text-gray-400">{t('cart.couponHint')}</p>
                  </div>

                  {/* Price summary */}
                  <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                    <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('cart.summaryTitle')}</h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(subtotal)}</span>
                      </div>
                      {couponApplied && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-600 dark:text-emerald-400">{t('cart.discount')}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</span>
                        {shipping === 0 ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('cart.freeShipping')}</span>
                        ) : (
                          <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(shipping)}</span>
                        )}
                      </div>
                      <div className="border-t border-gray-100 dark:border-white/5 pt-2.5 flex justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                        <span className="text-xl font-extrabold text-orange-500">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Link
                      to="/checkout"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/60"
                    >
                      {t('cart.checkout')} <ArrowRight size={16} />
                    </Link>

                    {/* Trust */}
                    <div className="mt-4 space-y-2">
                      {[
                        { icon: Shield, text: t('cart.trustSecure') },
                        { icon: Truck, text: t('cart.trustShipping') },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                          <Icon size={12} className="text-orange-400 shrink-0" /> {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { CartPage }
