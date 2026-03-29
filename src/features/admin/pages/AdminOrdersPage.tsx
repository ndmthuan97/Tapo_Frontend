import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import {
  Search, X, ChevronDown, ChevronLeft, ChevronRight,
  Eye, ImageOff, Filter, MoreVertical,
  Clock, Package, Truck, PackageCheck, XCircle,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type AdminOrder = {
  id: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerAvatar: string
  items: { name: string; thumbnailUrl: string; quantity: number }[]
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: 'paid' | 'unpaid'
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-A1B2C3', createdAt: '2025-03-29T10:30:00Z',
    customerName: 'Nguyễn Văn An', customerEmail: 'nvan@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Nguyen+Van+An&background=f97316&color=fff`,
    items: [{ name: 'ASUS ROG Strix G16 2024', thumbnailUrl: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg', quantity: 1 }],
    total: 45990000, status: 'pending', paymentMethod: 'COD', paymentStatus: 'unpaid',
  },
  {
    id: 'ORD-D4E5F6', createdAt: '2025-03-28T14:00:00Z',
    customerName: 'Trần Thị Bình', customerEmail: 'ttbinh@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=8b5cf6&color=fff`,
    items: [{ name: 'Lenovo Legion 5i Pro Gen 8', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 1 }],
    total: 32990000, status: 'processing', paymentMethod: 'VNPay', paymentStatus: 'paid',
  },
  {
    id: 'ORD-G7H8I9', createdAt: '2025-03-27T09:15:00Z',
    customerName: 'Lê Hoàng Cường', customerEmail: 'lhcuong@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Le+Hoang+Cuong&background=06b6d4&color=fff`,
    items: [
      { name: 'MSI Raider GE78 HX', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 1 },
      { name: 'HyperX Cloud III', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 2 },
    ],
    total: 57270000, status: 'shipped', paymentMethod: 'MoMo', paymentStatus: 'paid',
  },
  {
    id: 'ORD-J1K2L3', createdAt: '2025-03-26T17:45:00Z',
    customerName: 'Phạm Minh Đức', customerEmail: 'pmduc@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Pham+Minh+Duc&background=10b981&color=fff`,
    items: [{ name: 'Dell XPS 15 9530', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 1 }],
    total: 38990000, status: 'delivered', paymentMethod: 'Bank', paymentStatus: 'paid',
  },
  {
    id: 'ORD-M4N5O6', createdAt: '2025-03-25T12:00:00Z',
    customerName: 'Nguyễn Thị Hoa', customerEmail: 'nthoa@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Nguyen+Thi+Hoa&background=ec4899&color=fff`,
    items: [{ name: 'Sony WH-1000XM5', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 1 }],
    total: 7990000, status: 'cancelled', paymentMethod: 'COD', paymentStatus: 'unpaid',
  },
  {
    id: 'ORD-P7Q8R9', createdAt: '2025-03-24T15:30:00Z',
    customerName: 'Võ Thanh Giang', customerEmail: 'vtgiang@email.com',
    customerAvatar: `https://ui-avatars.com/api/?name=Vo+Thanh+Giang&background=f59e0b&color=fff`,
    items: [{ name: 'ASUS ROG Monitor 27"', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', quantity: 1 }],
    total: 12990000, status: 'delivered', paymentMethod: 'VNPay', paymentStatus: 'paid',
  },
]

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string; dot: string }> = {
  pending:    { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-500/10',    dot: 'bg-amber-500' },
  processing: { icon: Package,      color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/10',      dot: 'bg-blue-500' },
  shipped:    { icon: Truck,        color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10',  dot: 'bg-indigo-500' },
  delivered:  { icon: PackageCheck, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  cancelled:  { icon: XCircle,      color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10',        dot: 'bg-red-500' },
}

const ALL_STATUSES: (OrderStatus | 'all')[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

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

  const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    pending:    ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped:    ['delivered', 'cancelled'],
    delivered:  [],
    cancelled:  [],
  }

  const nexts = NEXT_STATUSES[current]
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

const PAGE_SIZE = 5

function AdminOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const filtered = orders.filter(o => {
    const matchStatus = activeStatus === 'all' || o.status === activeStatus
    const q = search.toLowerCase()
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  // Stats
  const stats = ALL_STATUSES.slice(1).map(s => ({ status: s as OrderStatus, count: orders.filter(o => o.status === s).length }))

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('adminOrders.pageTitle')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{t('adminOrders.subtitle', { count: filtered.length })}</p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ status, count }) => {
          const cfg = STATUS_CONFIG[status]
          const Icon = cfg.icon
          return (
            <button
              key={status}
              onClick={() => { setActiveStatus(status); setPage(0) }}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-sm',
                activeStatus === status
                  ? cn('border-2', cfg.bg, cfg.color.split(' ')[0].replace('text-', 'border-'))
                  : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]',
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color.split(' ')[0])}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-[10px] text-gray-400">{t(`orders.status.${status}`)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder={t('adminOrders.searchPlaceholder')}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] pl-9 pr-9 py-2.5 text-sm placeholder:text-gray-400 text-gray-700 dark:text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
              activeStatus !== 'all'
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-600 dark:text-gray-400',
            )}
          >
            <Filter size={13} />
            {activeStatus === 'all' ? t('orders.statusAll') : t(`orders.status.${activeStatus}`)}
            <ChevronDown size={12} className={cn('transition-transform', filterOpen && 'rotate-180')} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { setActiveStatus(s); setPage(0); setFilterOpen(false) }}
                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors', s === activeStatus ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}
                >
                  {s === 'all' ? t('orders.statusAll') : t(`orders.status.${s}`)}
                  <span className="ml-auto text-[10px] text-gray-400">{s === 'all' ? orders.length : orders.filter(o => o.status === s).length}</span>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.customer')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.product')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.total')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.payment')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.status')}</th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminOrders.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">{t('adminOrders.noResults')}</td>
                </tr>
              ) : (
                paginated.map(order => {
                  const date = new Date(order.createdAt).toLocaleDateString('vi-VN')
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{order.id}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <img src={order.customerAvatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{order.customerName}</p>
                            <p className="text-[10px] text-gray-400 truncate">{order.customerEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Product preview */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                            {order.items[0].thumbnailUrl
                              ? <img src={order.items[0].thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center"><ImageOff size={14} className="text-gray-300" /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{order.items[0].name}</p>
                            {order.items.length > 1 && (
                              <p className="text-[10px] text-gray-400">+{order.items.length - 1} {t('orders.andMore', { count: '' }).replace(' ', '')}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-orange-500">{formatCurrency(order.total)}</p>
                        <span className={cn('text-[10px] font-medium', order.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                          {order.paymentStatus === 'paid' ? '✓ ' + t('orderDetail.paid') : t('orderDetail.unpaid')}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{order.paymentMethod}</span>
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
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors" title={t('adminOrders.viewDetail')}>
                            <Eye size={14} />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title={t('adminOrders.moreActions')}>
                            <MoreVertical size={14} />
                          </button>
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
              {t('adminOrders.showing', { from: page * PAGE_SIZE + 1, to: Math.min((page + 1) * PAGE_SIZE, filtered.length), total: filtered.length })}
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
