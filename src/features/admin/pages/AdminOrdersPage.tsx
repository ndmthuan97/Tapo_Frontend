import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Eye, ImageOff,
  Clock, Package, Truck, PackageCheck, XCircle, ShoppingBag,
  Download, CheckSquare, Square, Loader2 as BulkLoader,
} from 'lucide-react'
import { orderApi } from '@/lib/http/order.api'
import type { OrderStatus, OrderSummary } from '@/lib/types/order/order.types'
import { toast } from 'sonner'
import { AdminOrderDetailModal } from '@/features/admin/components/AdminOrderDetailModal'
import { StatCard, AdminSearchInput, AdminFilterSelect, AdminTablePagination } from '@/features/admin/components/AdminShared'
import React from 'react'

// ── Excel Export helper (SheetJS) ────────────────────────────────────────
import * as XLSX from 'xlsx'

function exportOrdersToExcel(orders: OrderSummary[], filename = 'orders.xlsx') {
  const rows = orders.map(o => ({
    'Mã đơn':     o.orderCode ?? '',
    'Sản phẩm':   o.firstProductName ?? '',
    'Tổng tiền':  o.totalAmount,
    'Thanh toán': o.paymentStatus ?? '',
    'Trạng thái': o.status ?? '',
    'Ngày tạo':   new Date(o.createdAt).toLocaleString('vi-VN'),
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 18 }, { wch: 36 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng')
  XLSX.writeFile(wb, filename)
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING:    { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-500/10'    },
  CONFIRMED:  { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-500/10'    },
  PROCESSING: { icon: Package,      color: 'text-blue-700 dark:text-blue-400',        bg: 'bg-blue-50 dark:bg-blue-500/10'      },
  SHIPPING:   { icon: Truck,        color: 'text-indigo-700 dark:text-indigo-400',    bg: 'bg-indigo-50 dark:bg-indigo-500/10'  },
  DELIVERED:  { icon: PackageCheck, color: 'text-emerald-700 dark:text-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-500/10'},
  CANCELLED:  { icon: XCircle,      color: 'text-red-600 dark:text-red-400',          bg: 'bg-red-50 dark:bg-red-500/10'        },
  RETURNED:   { icon: XCircle,      color: 'text-red-600 dark:text-red-400',          bg: 'bg-red-50 dark:bg-red-500/10'        },
}


const ALL_STATUSES: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED']
// keep to avoid unused-var warning
void ALL_STATUSES

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OrdersSkeleton() {
  return (
    <>
      {[...Array(7)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /><div className="mt-1 h-3 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-5 w-24 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="ml-auto h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" /></td>
        </tr>
      ))}
    </>
  )
}

// ── Status dropdown (change status) ──────────────────────────────────────────

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING:   ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
  RETURNED:   [],
}

function StatusDropdown({ current, onSelect }: { current: OrderStatus; onSelect: (s: OrderStatus) => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const nexts = NEXT_STATUSES[current] ?? []

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => nexts.length > 0 && setOpen(o => !o)}
        disabled={nexts.length === 0}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all',
          STATUS_CONFIG[current].color, STATUS_CONFIG[current].bg,
          nexts.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
        )}
      >
        {React.createElement(STATUS_CONFIG[current].icon, { size: 11 })}
        {t(`orders.status.${current}`)}
        {nexts.length > 0 && <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[160px] rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
          {nexts.map(s => {
            const Icon = STATUS_CONFIG[s].icon
            return (
              <button key={s}
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
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [totalPages,    setTotalPages]    = useState(0)
  const [activeStatus, setActiveStatus]   = useState<OrderStatus | 'ALL'>('ALL')
  const [page, setPage]                   = useState(0)
  const [isLoading, setIsLoading]         = useState(true)
  const [searchQuery, setSearchQuery]     = useState('')
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  // ── Global stat totals (independent of table filter) ──────────────────────
  const [statTotal,     setStatTotal]     = useState(0)
  const [statPending,   setStatPending]   = useState(0)
  const [statDelivered, setStatDelivered] = useState(0)

  const STATUS_OPTIONS = useMemo(() => [
    { value: 'ALL',        label: t('orders.statusFilter.ALL')        },
    { value: 'PENDING',    label: t('orders.statusFilter.PENDING')    },
    { value: 'CONFIRMED',  label: t('orders.statusFilter.CONFIRMED')  },
    { value: 'PROCESSING', label: t('orders.statusFilter.PROCESSING') },
    { value: 'SHIPPING',   label: t('orders.statusFilter.SHIPPING')   },
    { value: 'DELIVERED',  label: t('orders.statusFilter.DELIVERED')  },
    { value: 'CANCELLED',  label: t('orders.statusFilter.CANCELLED')  },
    { value: 'RETURNED',   label: t('orders.statusFilter.RETURNED')   },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [lang])

  const loadStats = useCallback(async () => {
    try {
      const [total, pending, confirmed, delivered] = await Promise.all([
        orderApi.adminGetAllOrders({ page: 0, size: 1 }),
        orderApi.adminGetAllOrders({ page: 0, size: 1, status: 'PENDING' }),
        orderApi.adminGetAllOrders({ page: 0, size: 1, status: 'CONFIRMED' }),
        orderApi.adminGetAllOrders({ page: 0, size: 1, status: 'DELIVERED' }),
      ])
      if (total.data)     setStatTotal(total.data.totalElements)
      if (delivered.data) setStatDelivered(delivered.data.totalElements)
      const pendingN   = pending.data?.totalElements   ?? 0
      const confirmedN = confirmed.data?.totalElements ?? 0
      setStatPending(pendingN + confirmedN)
    } catch { /* ignore */ }
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
      setTotalPages(result.data.totalPages)
    }
  }, [page, activeStatus])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadData()  }, [loadData])

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const result = await orderApi.adminUpdateStatus(orderId, newStatus)
    if (result.success) {
      toast.success(t('adminOrders.statusUpdated'))
      loadData(); loadStats()
    } else {
      toast.error(t('adminOrders.errorUpdate'), { description: result.error?.message })
    }
  }

  const q = searchQuery.trim().toLowerCase()
  const filteredOrders = q
    ? orders.filter(o => o.orderCode?.toLowerCase().includes(q) || o.firstProductName?.toLowerCase().includes(q))
    : orders

  async function handleBulkStatus(newStatus: OrderStatus) {
    if (selectedIds.size === 0) return
    setIsBulkLoading(true)
    const res = await orderApi.adminBulkUpdateStatus([...selectedIds], newStatus)
    setIsBulkLoading(false)
    if (res.success) {
      toast.success(`Đã cập nhật ${res.data?.length ?? 0} đơn hàng → ${newStatus}`)
      setSelectedIds(new Set())
      loadData(); loadStats()
    } else {
      toast.error('Có lỗi khi bulk update', { description: res.error?.message })
    }
  }

  function toggleRow(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)))
    }
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('adminOrders.pageTitle')}
          </h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={ShoppingBag}  label={t('adminOrders.statAll')}      value={statTotal}     color="bg-orange-500"  />
          <StatCard icon={Clock}        label={t('adminOrders.statPending')}   value={statPending}   color="bg-amber-500"   />
          <StatCard icon={PackageCheck} label={t('adminOrders.statDelivered')} value={statDelivered} color="bg-emerald-500" />
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">
              {t('adminOrders.pageTitle')}
            </p>
            <AdminSearchInput
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setPage(0) }}
              placeholder={t('adminOrders.placeholder')}
            />
            <AdminFilterSelect
              value={activeStatus}
              onChange={v => { setActiveStatus(v as OrderStatus | 'ALL'); setPage(0) }}
              options={STATUS_OPTIONS}
            />
            {/* Export Excel button */}
            <button
              id="export-orders-excel-btn"
              type="button"
              disabled={filteredOrders.length === 0}
              onClick={() => {
                const date = new Date().toISOString().slice(0, 10)
                exportOrdersToExcel(filteredOrders, `orders_${activeStatus.toLowerCase()}_${date}.xlsx`)
                toast.success(`Đã xuất ${filteredOrders.length} đơn hàng ra Excel`)
              }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Download size={12} /> Export Excel
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                  <th className="px-4 py-3.5">
                    <button onClick={toggleAll} className="flex items-center justify-center text-gray-300 hover:text-orange-500 transition">
                      {selectedIds.size > 0 && selectedIds.size === filteredOrders.length
                        ? <CheckSquare size={15} className="text-orange-500" />
                        : <Square size={15} />}
                    </button>
                  </th>
                  <th className="px-5 py-3.5">{t('adminOrders.col.orderId')}</th>
                  <th className="px-5 py-3.5">{t('adminOrders.col.product')}</th>
                  <th className="px-5 py-3.5">{t('adminOrders.col.total')}</th>
                  <th className="px-5 py-3.5">{t('adminOrders.col.payment')}</th>
                  <th className="px-5 py-3.5">{t('adminOrders.col.status')}</th>
                  <th className="px-5 py-3.5 text-right">{t('adminOrders.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {isLoading ? (
                  <OrdersSkeleton />
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                      {t('adminOrders.noResults')}
                    </td>
                  </tr>
                ) : filteredOrders.map(order => {
                  const locale = lang.startsWith('en') ? 'en-US' : 'vi-VN'
                  const date = new Date(order.createdAt).toLocaleDateString(locale)
                  const time = new Date(order.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                  return (
                    <tr key={order.id} className={cn('group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]', selectedIds.has(order.id) && 'bg-orange-50/40 dark:bg-orange-500/5')}>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleRow(order.id)} className="flex items-center justify-center text-gray-300 hover:text-orange-500 transition">
                          {selectedIds.has(order.id)
                            ? <CheckSquare size={15} className="text-orange-500" />
                            : <Square size={15} />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{order.orderCode}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{time} · {date}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                            {order.firstProductThumbnail
                              ? <img src={order.firstProductThumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center"><ImageOff size={14} className="text-gray-300" /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{order.firstProductName || '—'}</p>
                            {order.totalQty > 1 && <p className="text-[10px] text-gray-400">{t('adminOrders.andMore', { count: order.totalQty - 1 })}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-orange-500">{formatCurrency(order.totalAmount)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'text-[10px] font-semibold px-2.5 py-1 rounded-full',
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-500',
                        )}>
                          {t(`orders.paymentStatus.${order.paymentStatus}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusDropdown current={order.status} onSelect={s => handleStatusChange(order.id, s)} />
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDetailOrderId(order.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition"
                          title={t('adminOrders.titleView')}
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <AdminTablePagination page={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
        </div>
      </div>

      {detailOrderId !== null && (
        <AdminOrderDetailModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#21232d] px-5 py-3 shadow-2xl shadow-orange-100/50 dark:shadow-black/40 transition-all animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {selectedIds.size} đơn đã chọn
          </span>
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
          {(['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(s => (
            <button
              key={s}
              disabled={isBulkLoading}
              onClick={() => handleBulkStatus(s)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50',
                STATUS_CONFIG[s].color, STATUS_CONFIG[s].bg,
                'hover:opacity-80 active:scale-95',
              )}
            >
              {isBulkLoading ? <BulkLoader size={11} className="animate-spin" /> : React.createElement(STATUS_CONFIG[s].icon, { size: 11 })}
              {s}
            </button>
          ))}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-2 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Bỏ chọn
          </button>
        </div>
      )}
    </>
  )
}

export { AdminOrdersPage }
