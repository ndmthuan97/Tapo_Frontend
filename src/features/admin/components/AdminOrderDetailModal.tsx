import { useState, useEffect } from 'react'
import {
  X, Package, MapPin, CreditCard, Clock, ImageOff,
  Loader2, AlertCircle, CheckCircle, TruckIcon, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { orderApi } from '@/lib/http/order.api'
import type { OrderDto, OrderStatus } from '@/lib/types/order/order.types'

// ── Constants (hoisted outside component — skill §5 rendering-hoist-jsx) ────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'text-amber-700',   bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: Clock },
  CONFIRMED:  { label: 'Đã xác nhận',  color: 'text-amber-700',   bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: Clock },
  PROCESSING: { label: 'Đang xử lý',   color: 'text-blue-700',    bg: 'bg-blue-50 dark:bg-blue-500/10',     icon: Package },
  SHIPPING:   { label: 'Đang giao',    color: 'text-indigo-700',  bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: TruckIcon },
  DELIVERED:  { label: 'Đã giao',      color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle },
  CANCELLED:  { label: 'Đã hủy',       color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-500/10',       icon: XCircle },
  RETURNED:   { label: 'Trả hàng',     color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-500/10',       icon: XCircle },
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'COD (Tiền mặt)',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  BANK: 'Chuyển khoản',
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AdminOrderDetailModalProps {
  orderId: string
  onClose: () => void
}

// ── Error state (hoisted — skill §5) ─────────────────────────────────────────

const ERROR_STATE = (
  <div className="flex flex-col items-center py-12 text-center">
    <AlertCircle size={32} className="mb-3 text-red-400" />
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Không thể tải đơn hàng</p>
    <p className="mt-1 text-xs text-gray-400">Vui lòng thử lại sau</p>
  </div>
)

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/5">
        <Icon size={13} className="text-orange-500" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{label}</span>
      <span className={cn('text-xs font-medium text-gray-700 dark:text-gray-300 text-right', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function AdminOrderDetailModal({ orderId, onClose }: AdminOrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setHasError(false)

    orderApi.adminGetOrderDetail(orderId).then(res => {
      if (cancelled) return
      if (res.success && res.data) {
        setOrder(res.data)
      } else {
        setHasError(true)
      }
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [orderId])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const statusCfg = order ? STATUS_CONFIG[order.status] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
              <Package size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Chi tiết đơn hàng
                {order && <span className="ml-2 font-mono text-orange-500">#{order.orderCode}</span>}
              </h2>
              {order && statusCfg && (
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold', statusCfg.color)}>
                  <statusCfg.icon size={10} />
                  {statusCfg.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={24} className="animate-spin text-orange-500 mb-3" />
              <p className="text-sm text-gray-400">Đang tải...</p>
            </div>
          ) : hasError ? ERROR_STATE : order ? (
            <>
              {/* Shipping info */}
              <Section title="Thông tin giao hàng" icon={MapPin}>
                <InfoRow label="Người nhận" value={order.shippingRecipientName} />
                <InfoRow label="Số điện thoại" value={order.shippingPhone} mono />
                <InfoRow label="Địa chỉ" value={order.shippingAddress} />
                <InfoRow label="Quận / Huyện" value={order.shippingDistrict} />
                <InfoRow label="Tỉnh / TP" value={order.shippingCity} />
                {order.customerNote && (
                  <InfoRow label="Ghi chú" value={
                    <span className="italic text-gray-500">"{order.customerNote}"</span>
                  } />
                )}
              </Section>

              {/* Payment info */}
              <Section title="Thanh toán" icon={CreditCard}>
                <InfoRow label="Phương thức" value={PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} />
                <InfoRow label="Trạng thái TT" value={
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/5',
                  )}>
                    {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '○ Chưa thanh toán'}
                  </span>
                } />
                <div className="my-2 border-t border-gray-100 dark:border-white/5" />
                <InfoRow label="Tạm tính" value={formatCurrency(order.subtotal)} />
                {order.discountAmount > 0 && (
                  <InfoRow label="Giảm giá" value={
                    <span className="text-emerald-600">−{formatCurrency(order.discountAmount)}</span>
                  } />
                )}
                <InfoRow label="Phí vận chuyển" value={formatCurrency(order.shippingFee)} />
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tổng cộng</span>
                  <span className="text-base font-extrabold text-orange-500">{formatCurrency(order.totalAmount)}</span>
                </div>
              </Section>

              {/* Products */}
              <Section title={`Sản phẩm (${order.items.length})`} icon={Package}>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                        {item.productThumbnail
                          ? <img src={item.productThumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center"><ImageOff size={14} className="text-gray-300" /></div>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">{item.productName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 shrink-0">{formatCurrency(Number(item.totalPrice))}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Status history */}
              {order.statusHistory.length > 0 && (
                <Section title="Lịch sử trạng thái" icon={Clock}>
                  <div className="space-y-2">
                    {[...order.statusHistory].reverse().map((h, i) => {
                      const cfg = STATUS_CONFIG[h.toStatus]
                      const Icon = cfg?.icon ?? Clock
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', cfg?.bg ?? 'bg-gray-100')}>
                            <Icon size={10} className={cfg?.color ?? 'text-gray-500'} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-xs font-semibold', cfg?.color ?? 'text-gray-600')}>
                              {cfg?.label ?? h.toStatus}
                            </p>
                            {h.note && <p className="text-[10px] text-gray-400">{h.note}</p>}
                            <p className="text-[10px] text-gray-300 mt-0.5">
                              {new Date(h.changedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Section>
              )}
            </>
          ) : null}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export { AdminOrderDetailModal }
