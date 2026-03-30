import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Eye, ImageOff, Filter,
  Clock, Package, Truck, PackageCheck, XCircle, Loader2,
} from 'lucide-react'
import { orderApi } from '@/lib/http/order.api'
import type { OrderStatus, OrderSummary } from '@/lib/types/order/order.types'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string; dot: string }> = {
  PENDING:    { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-500/10',    dot: 'bg-amber-500' },
  CONFIRMED:  { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-500/10',    dot: 'bg-amber-500' },
  PROCESSING: { icon: Package,      color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/10',      dot: 'bg-blue-500' },
  SHIPPING:   { icon: Truck,        color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10',  dot: 'bg-indigo-500' },
  DELIVERED:  { icon: PackageCheck, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  CANCELLED:  { icon: XCircle,      color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10',        dot: 'bg-red-500' },
  RETURNED:   { icon: XCircle,      color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10',        dot: 'bg-red-500' },
}

const ALL_STATUSES: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED']

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', cfg.color, cfg.bg)}>
      <Icon size={11} /> {t(`orders.status.${status}`)}
    </span>
  )
}

// ── Status dropdown ───────────────────────────────────────────────────────────

function StatusDropdown({ current, onSelect }: { current: OrderStatus; onSelect: (s: OrderStatus) => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Admin can change to almost anything forward, or cancel if not already finished
  const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    PENDING:    ['CONFIRMED', 'CANCELLED'],
    CONFIRMED:  ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPING', 'CANCELLED'],
    SHIPPING:   ['DELIVERED', 'CANCELLED'],
    DELIVERED:  ['RETURNED'],
    CANCELLED:  [],
    RETURNED:   [],
  }

  const nexts = NEXT_STATUSES[current] || []
  if (nexts.length === 0) return <StatusBadge status={current} />

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1"
      >
        <StatusBadge status={current} />
        <ChevronDown size={12} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[160px] rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
          {nexts.map(s => {
            const Icon = STATUS_CONFIG[s].icon
            return (
              <button
                key={s}
                onClick={() => { onSelect(s); setOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
              >
                <Icon size={12} /> {t(`orders.status.${s}`)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function AdminOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const result = await orderApi.adminGetAllOrders({
      page,
      size: PAGE_SIZE,
      status: activeStatus !== 'ALL' ? activeStatus : undefined,
    })
    setIsLoading(false)
    if (result.success && result.data) {
      setOrders(result.data.content)
      setTotalElements(result.data.totalElements)
      setTotalPages(result.data.totalPages)
    }
  }, [page, activeStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const result = await orderApi.adminUpdateStatus(orderId, newStatus)
    if (result.success) {
      toast.success(t('adminOrders.statusUpdated'))
      loadData()
    } else {
      toast.error('Lỗi', { description: result.error?.message })
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('adminOrders.pageTitle')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{t('adminOrders.subtitle', { count: totalElements })}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Status filter */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
              activeStatus !== 'ALL'
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-600 dark:text-gray-400',
            )}
          >
            <Filter size={13} />
            {activeStatus === 'ALL' ? t('orders.statusAll') : t(`orders.status.${activeStatus}`)}
            <ChevronDown size={12} className={cn('transition-transform', filterOpen && 'rotate-180')} />
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { setActiveStatus(s); setPage(0); setFilterOpen(false) }}
                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors', s === activeStatus ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}
                >
                  {s === 'ALL' ? t('orders.statusAll') : t(`orders.status.${s}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.orderId')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.product')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.total')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.payment')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.status')}</th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">{t('common.loading')}</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">{t('adminOrders.noResults')}</td>
                </tr>
              ) : (
                orders.map(order => {
                  const date = new Date(order.createdAt).toLocaleDateString('vi-VN')
                  const time = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{order.orderCode}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{time} - {date}</p>
                        </div>
                      </td>

                      {/* Product preview */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                            {order.firstProductThumbnail
                              ? <img src={order.firstProductThumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center"><ImageOff size={14} className="text-gray-300" /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{order.firstProductName || '—'}</p>
                            {order.totalQty > 1 && (
                              <p className="text-[10px] text-gray-400">+{order.totalQty - 1} {t('orders.andMore', { count: '' }).replace(' ', '')}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-orange-500">{formatCurrency(order.totalAmount)}</p>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className={cn('text-[10px] font-medium px-2 py-1 rounded border', order.paymentStatus === 'PAID' ? 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'border-gray-200 text-gray-500')}>
                          {t(`orders.paymentStatus.${order.paymentStatus}`)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusDropdown
                          current={order.status}
                          onSelect={s => handleStatusChange(order.id, s)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/admin/orders/${order.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors" title={t('adminOrders.viewDetail')}>
                            <Eye size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3">
            <p className="text-xs text-gray-400">
              {t('adminOrders.showing', { from: page * PAGE_SIZE + 1, to: Math.min((page + 1) * PAGE_SIZE, totalElements), total: totalElements })}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all', i === page ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500')}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AdminOrdersPage }
