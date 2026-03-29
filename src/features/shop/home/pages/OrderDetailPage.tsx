import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { orderApi } from '@/lib/http/order.api'
import type { OrderDto, OrderStatus } from '@/lib/types/order/order.types'
import {
  ChevronRight, Package, MapPin, CreditCard, ImageOff,
  CheckCircle2, Clock, Truck, PackageCheck, XCircle, RotateCcw,
  Loader2, AlertCircle,
} from 'lucide-react'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING:    Clock,
  CONFIRMED:  CheckCircle2,
  PROCESSING: Package,
  SHIPPING:   Truck,
  DELIVERED:  PackageCheck,
  CANCELLED:  XCircle,
  RETURNED:   RotateCcw,
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'text-amber-500   bg-amber-50   dark:bg-amber-500/10   border-amber-200   dark:border-amber-500/20',
  CONFIRMED:  'text-blue-600   bg-blue-50    dark:bg-blue-500/10    border-blue-200    dark:border-blue-500/20',
  PROCESSING: 'text-indigo-500 bg-indigo-50  dark:bg-indigo-500/10  border-indigo-200  dark:border-indigo-500/20',
  SHIPPING:   'text-purple-500 bg-purple-50  dark:bg-purple-500/10  border-purple-200  dark:border-purple-500/20',
  DELIVERED:  'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  CANCELLED:  'text-red-500    bg-red-50     dark:bg-red-500/10     border-red-200     dark:border-red-500/20',
  RETURNED:   'text-gray-500   bg-gray-100   dark:bg-white/5        border-gray-200    dark:border-white/10',
}

const PROGRESS_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED']

// ── Main page ─────────────────────────────────────────────────────────────────

function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const [order, setOrder] = useState<OrderDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    orderApi.getOrderDetail(id).then(result => {
      setIsLoading(false)
      if (result.success && result.data) {
        setOrder(result.data)
      } else {
        setNotFound(true)
      }
    })
  }, [id])

  async function handleCancel() {
    if (!id || !window.confirm(t('orderDetail.cancelConfirm'))) return
    setIsCancelling(true)
    const result = await orderApi.cancelOrder(id)
    setIsCancelling(false)
    if (result.success && result.data) {
      setOrder(result.data)
      toast.success(t('orderDetail.cancelSuccess'))
    } else {
      toast.error(t('orderDetail.cancelFailed'), { description: result.error?.message })
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#191b22]">
          <Loader2 size={40} className="animate-spin text-orange-400" />
        </main>
        <Footer />
      </>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (notFound || !order) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-[#191b22]">
          <AlertCircle size={48} className="text-orange-400" />
          <p className="text-gray-600 dark:text-gray-300">{t('orderDetail.notFound')}</p>
          <Link to="/orders" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
            ← {t('orders.pageTitle')}
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const statusClasses = STATUS_COLORS[order.status]
  const StatusIcon = STATUS_ICONS[order.status]
  const date = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const currentIdx = PROGRESS_STEPS.indexOf(order.status)
  const showProgress = order.status !== 'CANCELLED' && order.status !== 'RETURNED'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/orders" className="hover:text-orange-500">{t('orders.pageTitle')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{order.orderCode}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('orderDetail.pageTitle')} {order.orderCode}</h1>
              <p className="mt-0.5 text-xs text-gray-400">{t('orderDetail.placedOn')} {date}</p>
            </div>
            <span className={cn('flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold', statusClasses)}>
              <StatusIcon size={15} />
              {t(`orders.status.${order.status.toLowerCase()}`)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {/* Progress tracker */}
              {showProgress && (
                <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-6">
                  <h3 className="mb-5 text-sm font-bold text-gray-800 dark:text-gray-100">{t('orderDetail.trackingTitle')}</h3>
                  <div className="relative flex justify-between">
                    {/* Progress bar */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/10">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${currentIdx >= 0 ? (currentIdx / (PROGRESS_STEPS.length - 1)) * 100 : 0}%` }}
                      />
                    </div>
                    {PROGRESS_STEPS.map((s, i) => {
                      const Icon = STATUS_ICONS[s]
                      const done = currentIdx >= 0 && i <= currentIdx
                      return (
                        <div key={s} className="relative flex flex-col items-center z-10">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                            done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-300',
                          )}>
                            {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                          </div>
                          <span className={cn('mt-2 text-[10px] font-medium text-center hidden sm:block max-w-[70px]', done ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-white/20')}>
                            {t(`orders.status.${s.toLowerCase()}`)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Status history timeline */}
                  {order.statusHistory.length > 0 && (
                    <div className="mt-6 space-y-3 border-t border-gray-100 dark:border-white/5 pt-4">
                      {[...order.statusHistory].reverse().map((h, i) => {
                        const Icon = STATUS_ICONS[h.toStatus] ?? Clock
                        return (
                          <div key={i} className={cn('flex items-start gap-3', i === 0 ? '' : 'opacity-60')}>
                            <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', i === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400')}>
                              <Icon size={11} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{h.note ?? t(`orders.status.${h.toStatus.toLowerCase()}`)}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(h.changedAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Package size={14} className="text-orange-500" /> {t('orderDetail.itemsTitle')} ({order.items.length})
                </h3>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-100 dark:border-white/5 last:border-0 pb-4 last:pb-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                        {item.productThumbnail
                          ? <img src={item.productThumbnail} alt={item.productName} loading="lazy" className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center"><ImageOff size={20} className="text-gray-300" /></div>
                        }
                      </div>
                      <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{item.productName}</p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-orange-500">{formatCurrency(item.totalPrice)}</p>
                          <p className="text-[10px] text-gray-400">{formatCurrency(item.unitPrice)} / cái</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Shipping address */}
              <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <MapPin size={14} className="text-orange-500" /> {t('checkout.shippingTitle')}
                </h3>
                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{order.shippingRecipientName}</p>
                  <p>{order.shippingPhone}</p>
                  <p>{order.shippingAddress}</p>
                  <p>{order.shippingDistrict}, {order.shippingCity}</p>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <CreditCard size={14} className="text-orange-500" /> {t('checkout.paymentTitle')}
                </h3>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
                )}>
                  {order.paymentStatus === 'PAID' ? '✓ ' + t('orderDetail.paid') : t('orderDetail.unpaid')}
                </span>
              </div>

              {/* Price summary */}
              <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('cart.summaryTitle')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.subtotal')}</span>
                    <span className="text-gray-700 dark:text-gray-200">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600">{t('cart.discount')}</span>
                      <span className="text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.shipping')}</span>
                    <span className="text-gray-700 dark:text-gray-200">{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2 font-bold">
                    <span className="text-gray-900 dark:text-white">{t('cart.total')}</span>
                    <span className="text-orange-500 text-base">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 dark:border-red-500/20 text-red-500 py-2.5 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                  >
                    {isCancelling && <Loader2 size={14} className="animate-spin" />}
                    {t('orderDetail.cancelOrder')}
                  </button>
                )}
                <Link
                  to="/orders"
                  className="block w-full rounded-xl border border-gray-200 dark:border-white/10 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors text-center"
                >
                  ← {t('orders.pageTitle')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { OrderDetailPage }
