import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  Star, Heart, ShoppingCart, ChevronRight, ChevronLeft, Share2,
  Shield, Truck, RefreshCw, Award, Minus, Plus, ImageOff, Tag,
  MessageSquare, ThumbsUp,
} from 'lucide-react'
import { productApi } from '@/lib/http/product.api'
import type { ProductDto } from '@/lib/types/product/product.types'

// ── Skeleton ───────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-32" />
          <div className="h-7 bg-gray-100 dark:bg-white/5 rounded-full w-full" />
          <div className="h-7 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
          <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-2xl" />
          <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Mock reviews (reviews API Sprint later) ───────────────────────────────────

const MOCK_REVIEWS = [
  { id: 1, user: 'Nguyễn Văn A', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user1`, rating: 5, date: '2025-03-15', comment: 'Sản phẩm tuyệt vời, hiệu năng mạnh mẽ. Rất hài lòng!', helpful: 24 },
  { id: 2, user: 'Trần Thị B',   avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user2`, rating: 4, date: '2025-02-28', comment: 'Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đúng mô tả.', helpful: 15 },
  { id: 3, user: 'Phạm Minh C',  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user3`, rating: 5, date: '2025-02-10', comment: 'Chất lượng vượt mong đợi, sẽ mua lại!', helpful: 32 },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
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

function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)

  function prev() { setActive(i => (i - 1 + images.length) % images.length) }
  function next() { setActive(i => (i + 1) % images.length) }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 aspect-[4/3]">
        {images[active] ? (
          <img src={images[active]} alt="product" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={48} className="text-gray-300 dark:text-white/20" />
          </div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-[#21232d]/90 shadow-md text-gray-700 dark:text-gray-300 hover:bg-white transition">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-[#21232d]/90 shadow-md text-gray-700 dark:text-gray-300 hover:bg-white transition">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} className={cn('h-1.5 rounded-full transition-all', i === active ? 'w-5 bg-orange-500' : 'w-1.5 bg-white/60')} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn('h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all', i === active ? 'border-orange-400 shadow-sm shadow-orange-200/60' : 'border-gray-100 dark:border-white/10 opacity-70 hover:opacity-100')}
            >
              <img src={img} alt={`thumb-${i}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const [product, setProduct] = useState<ProductDto | null>(null)
  const [related, setRelated] = useState<ProductDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setNotFound(false)

    productApi.getProduct(id).then(result => {
      setIsLoading(false)
      if (result.success && result.data) {
        setProduct(result.data)
        // Load related after product is found
        productApi.getRelatedProducts(id).then(r => {
          if (r.success && r.data) setRelated(r.data)
        })
      } else {
        setNotFound(true)
      }
    })
  }, [id])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
          <DetailSkeleton />
        </main>
        <Footer />
      </>
    )
  }

  if (notFound || !product) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#191b22] gap-4">
          <p className="text-2xl font-bold text-gray-400">{t('productDetail.notFound')}</p>
          <Link to="/products" className="text-sm font-medium text-orange-500 hover:underline">
            {t('productDetail.backToProducts')}
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const images: string[] = product.thumbnailUrl ? [product.thumbnailUrl] : []

  const ratingDist = [
    { stars: 5, count: Math.round(product.reviewCount * 0.65) },
    { stars: 4, count: Math.round(product.reviewCount * 0.20) },
    { stars: 3, count: Math.round(product.reviewCount * 0.10) },
    { stars: 2, count: Math.round(product.reviewCount * 0.03) },
    { stars: 1, count: Math.round(product.reviewCount * 0.02) },
  ]
  const totalReviews = ratingDist.reduce((acc, d) => acc + d.count, 0)

  const TRUST_BADGES = [
    { icon: Shield,    label: t('productDetail.trustedWarranty'),  sub: t('productDetail.trustedWarrantySub') },
    { icon: Truck,     label: t('productDetail.trustedShipping'),  sub: t('productDetail.trustedShippingSub') },
    { icon: RefreshCw, label: t('productDetail.trustedReturn'),    sub: t('productDetail.trustedReturnSub') },
    { icon: Award,     label: t('productDetail.trustedAuth'),      sub: t('productDetail.trustedAuthSub') },
  ]

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
              <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ── Hero: gallery + info ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

            {/* Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ImageGallery images={images} />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              {/* Brand + Category chips */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <Tag size={10} /> {product.brandName}
                </span>
                <span className="text-xs text-gray-400">{product.categoryName}</span>
              </div>

              {/* Name */}
              <h1 className="text-xl font-bold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <StarDisplay rating={product.avgRating} size={16} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{product.avgRating?.toFixed(1) ?? '0.0'}</span>
                </div>
                <span className="text-gray-200 dark:text-white/10">|</span>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                  <MessageSquare size={13} />
                  {t('productDetail.reviews', { count: product.reviewCount })}
                </button>
                <span className="text-gray-200 dark:text-white/10">|</span>
                <span className="text-sm text-gray-500">
                  {t('productDetail.sold', { count: product.soldCount.toLocaleString() })}
                </span>
              </div>

              {/* Price box */}
              <div className="rounded-2xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 p-4">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-orange-500">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="mb-1 text-base text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                  )}
                  {discountPercent && (
                    <span className="mb-1 flex items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    {t('productDetail.savings', { amount: formatCurrency(product.originalPrice - product.price) })}
                  </p>
                )}
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className={cn('h-2 w-2 rounded-full', product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-400')} />
                <span className={cn('font-medium', product.stock > 10 ? 'text-emerald-600 dark:text-emerald-400' : product.stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500')}>
                  {product.stock > 10
                    ? t('productDetail.inStock')
                    : product.stock > 0
                    ? t('productDetail.lowStock', { count: product.stock })
                    : t('productDetail.outOfStock')}
                </span>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('productDetail.quantity')}</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-orange-500 py-3 text-sm font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                  <ShoppingCart size={17} /> {t('productDetail.addToCart')}
                </button>
                <button className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/60">
                  {t('productDetail.buyNow')}
                </button>
                <button
                  onClick={() => setWishlisted(w => !w)}
                  className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all', wishlisted ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-red-300 hover:text-red-400')}
                >
                  <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
                </button>
                <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-400 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2">
                {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                      <Icon size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</p>
                      <p className="text-[10px] text-gray-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail tabs ───────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-white/5">
              {([
                { id: 'desc'    as const, label: t('productDetail.tabDesc') },
                { id: 'specs'   as const, label: t('productDetail.tabSpecs') },
                { id: 'reviews' as const, label: t('productDetail.tabReviews', { count: product.reviewCount }) },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn('px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px', activeTab === tab.id ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-8">
              {/* Description */}
              {activeTab === 'desc' && (
                <div className="max-w-none text-gray-700 dark:text-gray-300">
                  {(product.description ?? '').split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-sm last:mb-0">{para}</p>
                  ))}
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specs' && (
                product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                    {Object.entries(product.specifications).map(([key, val], i) => (
                      <div key={key} className={cn('flex gap-4 px-4 py-3 text-sm', i % 2 === 0 ? 'bg-gray-50 dark:bg-white/3' : 'bg-white dark:bg-transparent')}>
                        <span className="w-44 shrink-0 font-medium text-gray-500 dark:text-gray-400">{key}</span>
                        <span className="text-gray-800 dark:text-gray-200">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t('productDetail.noSpecs')}</p>
                )
              )}

              {/* Reviews (mock until Sprint 6) */}
              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 p-6 sm:w-44 shrink-0">
                      <span className="text-5xl font-extrabold text-orange-500">{product.avgRating?.toFixed(1) ?? '0.0'}</span>
                      <StarDisplay rating={product.avgRating} size={18} />
                      <span className="mt-1 text-xs text-gray-400">{t('productDetail.totalReviews', { count: totalReviews })}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingDist.map(({ stars, count }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="flex w-6 shrink-0 items-center gap-0.5 text-xs text-gray-500">{stars} <Star size={9} className="fill-amber-400 text-amber-400" /></span>
                          <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 h-2">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {MOCK_REVIEWS.map(review => (
                      <div key={review.id} className="border-b border-gray-100 dark:border-white/5 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <img src={review.avatar} alt={review.user} className="h-9 w-9 rounded-full bg-gray-100" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{review.user}</span>
                              <StarDisplay rating={review.rating} size={11} />
                              <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                            <button className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <ThumbsUp size={11} />
                              {t('productDetail.helpful', { count: review.helpful })}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">{t('productDetail.relatedTitle')}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map(p => {
                const disc = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null
                return (
                  <Link to={`/products/${p.id}`} key={p.id} className="group overflow-hidden rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden bg-gray-50 dark:bg-white/5 h-44">
                      {p.thumbnailUrl ? (
                        <img src={p.thumbnailUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><ImageOff size={28} className="text-gray-200 dark:text-white/10" /></div>
                      )}
                      {disc && <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">-{disc}%</span>}
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-semibold text-orange-500 uppercase">{p.brandName}</span>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-800 dark:text-gray-100 min-h-[2rem]">{p.name}</h3>
                      <div className="mt-1.5 flex items-center gap-1">
                        <StarDisplay rating={p.avgRating} size={10} />
                        <span className="text-[10px] text-gray-400">{p.avgRating?.toFixed(1)}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-orange-500">{formatCurrency(p.price)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export { ProductDetailPage }
