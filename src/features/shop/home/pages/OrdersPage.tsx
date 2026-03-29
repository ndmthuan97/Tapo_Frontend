import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import { ChevronRight, Package, ImageOff, Search, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type OrderItem = {
  name: string
  thumbnailUrl: string
  price: number
  quantity: number
}

type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  paymentMethod: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-A1B2C3',
    createdAt: '2025-03-25T10:30:00Z',
    status: 'delivered',
    paymentMethod: 'COD',
    total: 49280000,
    items: [
      { name: 'Laptop Gaming ASUS ROG Strix G16 2024', thumbnailUrl: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg', price: 45990000, quantity: 1 },
      { name: 'Tai nghe HyperX Cloud III', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', price: 3290000, quantity: 1 },
    ],
  },
  {
    id: 'ORD-D4E5F6',
    createdAt: '2025-03-20T14:00:00Z',
    status: 'shipped',
    paymentMethod: 'VNPay',
    total: 32990000,
    items: [
      { name: 'Lenovo Legion 5i Pro Gen 8', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', price: 32990000, quantity: 1 },
    ],
  },
  {
    id: 'ORD-G7H8I9',
    createdAt: '2025-03-10T09:15:00Z',
    status: 'cancelled',
    paymentMethod: 'MoMo',
    total: 3990000,
    items: [
      { name: 'Tai nghe Sony WH-1000XM5', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', price: 3990000, quantity: 1 },
    ],
  },
  {
    id: 'ORD-J1K2L3',
    createdAt: '2025-03-28T17:45:00Z',
    status: 'processing',
    paymentMethod: 'Bank',
    total: 54990000,
    items: [
      { name: 'MSI Raider GE78 HX 2024', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', price: 54990000, quantity: 1 },
    ],
  },
  {
    id: 'ORD-M4N5O6',
    createdAt: '2025-03-29T08:00:00Z',
    status: 'pending',
    paymentMethod: 'COD',
    total: 8990000,
    items: [
      { name: 'Màn hình Gaming ASUS ROG Swift 27"', thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg', price: 8990000, quantity: 1 },
    ],
  },
]

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { color: string; bgColor: string; dotColor: string }> = {
  pending:    { color: 'text-amber-700 dark:text-amber-400',   bgColor: 'bg-amber-50 dark:bg-amber-500/10',   dotColor: 'bg-amber-500' },
  processing: { color: 'text-blue-700 dark:text-blue-400',    bgColor: 'bg-blue-50 dark:bg-blue-500/10',     dotColor: 'bg-blue-500' },
  shipped:    { color: 'text-indigo-700 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10', dotColor: 'bg-indigo-500' },
  delivered:  { color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10', dotColor: 'bg-emerald-500' },
  cancelled:  { color: 'text-red-600 dark:text-red-400',      bgColor: 'bg-red-50 dark:bg-red-500/10',       dotColor: 'bg-red-500' },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.color, cfg.bgColor)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dotColor)} />
      {t(`orders.status.${status}`)}
    </span>
  )
}

// ── Order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const { t } = useTranslation()
  const date = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-shadow hover:shadow-md dark:hover:shadow-black/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-3 bg-gray-50 dark:bg-white/3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{order.id}</span>
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs text-gray-400">• {order.paymentMethod}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items preview */}
      <div className="px-5 py-4 flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center"><ImageOff size={20} className="text-gray-300" /></div>
              }
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-500">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{order.items[0].name}</p>
          {order.items.length > 1 && (
            <p className="text-xs text-gray-400">{t('orders.andMore', { count: order.items.length - 1 })}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3">
        <div>
          <span className="text-xs text-gray-400">{t('orders.total')}: </span>
          <span className="text-base font-bold text-orange-500">{formatCurrency(order.total)}</span>
        </div>
        <Link
          to={`/orders/${order.id}`}
          className="flex items-center gap-1.5 rounded-full border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
        >
          {t('orders.viewDetail')} <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: (OrderStatus | 'all')[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

function OrdersPage() {
  const { t } = useTranslation()
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_ORDERS.filter(o => {
    const matchStatus = activeStatus === 'all' || o.status === activeStatus
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('orders.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Package size={22} className="text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('orders.pageTitle')}</h1>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('orders.searchPlaceholder')}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] pl-10 pr-10 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                  activeStatus === s
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200/50'
                    : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500',
                )}
              >
                {s === 'all' ? t('orders.statusAll') : t(`orders.status.${s}`)}
                {s !== 'all' && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    ({MOCK_ORDERS.filter(o => o.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <Package size={28} className="text-gray-300 dark:text-white/20" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('orders.emptyTitle')}</p>
              <p className="mt-1 text-xs text-gray-400">{t('orders.emptySubtitle')}</p>
              <Link to="/products" className="mt-5 rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                {t('orders.shopNow')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { OrdersPage }
