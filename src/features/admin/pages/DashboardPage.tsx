import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users, UserCheck, UserX, ShoppingBag, TrendingUp, ArrowUpRight,
  Package, Tag, Bookmark, Activity, Clock, BarChart3,
} from 'lucide-react'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'

// ── Mock chart data ────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: 'T1', revenue: 120000000, orders: 28 },
  { month: 'T2', revenue: 98000000,  orders: 22 },
  { month: 'T3', revenue: 145000000, orders: 35 },
  { month: 'T4', revenue: 132000000, orders: 31 },
  { month: 'T5', revenue: 178000000, orders: 42 },
  { month: 'T6', revenue: 165000000, orders: 38 },
  { month: 'T7', revenue: 210000000, orders: 51 },
  { month: 'T8', revenue: 195000000, orders: 44 },
  { month: 'T9', revenue: 235000000, orders: 55 },
  { month: 'T10', revenue: 220000000, orders: 50 },
  { month: 'T11', revenue: 298000000, orders: 68 },
  { month: 'T12', revenue: 342000000, orders: 79 },
]

const TOP_PRODUCTS = [
  { name: 'ASUS ROG Strix G16 2024', sold: 47, revenue: 2161530000, img: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg' },
  { name: 'Lenovo Legion 5i Pro Gen 8', sold: 35, revenue: 1154650000, img: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg' },
  { name: 'MSI Raider GE78 HX', sold: 28, revenue: 1539720000, img: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg' },
  { name: 'HyperX Cloud III Wireless', sold: 64, revenue: 210560000, img: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg' },
]

const RECENT_ACTIVITIES = [
  { icon: Users,    dot: 'bg-emerald-500', textKey: 'admin.dashboard.activity1', time: '2 phút trước' },
  { icon: ShoppingBag, dot: 'bg-blue-500',     textKey: 'admin.dashboard.activity2', time: '15 phút trước' },
  { icon: Activity, dot: 'bg-orange-500',   textKey: 'admin.dashboard.activity3', time: '1 giờ trước' },
]

// ── SVG Revenue Bar Chart ──────────────────────────────────────────────────────

function RevenueChart({ period }: { period: 'month' | 'quarter' }) {
  const data = period === 'quarter'
    ? [
        { label: 'Q1', revenue: MONTHLY_REVENUE.slice(0,3).reduce((s,d) => s + d.revenue, 0) },
        { label: 'Q2', revenue: MONTHLY_REVENUE.slice(3,6).reduce((s,d) => s + d.revenue, 0) },
        { label: 'Q3', revenue: MONTHLY_REVENUE.slice(6,9).reduce((s,d) => s + d.revenue, 0) },
        { label: 'Q4', revenue: MONTHLY_REVENUE.slice(9,12).reduce((s,d) => s + d.revenue, 0) },
      ]
    : MONTHLY_REVENUE.map(d => ({ label: d.month, revenue: d.revenue }))

  const maxVal = Math.max(...data.map(d => d.revenue))
  const chartH = 140
  const barW = period === 'quarter' ? 48 : 20
  const gap   = period === 'quarter' ? 28 : 10
  const totalW = data.length * (barW + gap) - gap + 40

  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH + 30}`}
      className="w-full overflow-visible"
      style={{ height: chartH + 40 }}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(v => (
        <line
          key={v}
          x1={20} y1={chartH - v * chartH}
          x2={totalW} y2={chartH - v * chartH}
          stroke="currentColor"
          strokeOpacity={0.06}
          strokeWidth={1}
          className="text-gray-900 dark:text-white"
        />
      ))}

      {data.map((d, i) => {
        const barH = Math.max(4, (d.revenue / maxVal) * chartH)
        const x = 20 + i * (barW + gap)
        const y = chartH - barH
        return (
          <g key={d.label}>
            {/* Bar background */}
            <rect x={x} y={0} width={barW} height={chartH} rx={6}
              fill="currentColor" fillOpacity={0.03} className="text-gray-500" />
            {/* Bar fill */}
            <rect x={x} y={y} width={barW} height={barH} rx={6}
              fill="url(#barGrad)" className="transition-all duration-500" />
            {/* Label */}
            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500" fontSize={9} fontWeight={500}>
              {d.label}
            </text>
          </g>
        )
      })}

      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.5} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, positive, icon: Icon, color, bg }: {
  label: string; value: string; change: string; positive: boolean
  icon: typeof Users; color: string; bg: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
          <Icon size={20} className={color} />
        </div>
        <span className={cn(
          'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
          positive
            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400',
        )}>
          <TrendingUp size={10} />
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Người dùng',  href: '/admin/users',      icon: Users,       color: 'bg-orange-500' },
  { label: 'Sản phẩm',   href: '/admin/products',    icon: Package,     color: 'bg-blue-500' },
  { label: 'Danh mục',   href: '/admin/categories',  icon: Tag,         color: 'bg-purple-500' },
  { label: 'Thương hiệu',href: '/admin/brands',       icon: Bookmark,    color: 'bg-teal-500' },
  { label: 'Đơn hàng',   href: '/admin/orders',       icon: ShoppingBag, color: 'bg-emerald-500' },
]

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const [chartPeriod, setChartPeriod] = useState<'month' | 'quarter'>('month')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('admin.dashboard.morning') : hour < 18 ? t('admin.dashboard.afternoon') : t('admin.dashboard.evening')

  const totalRevenue = MONTHLY_REVENUE.reduce((s, d) => s + d.revenue, 0)
  const totalOrders  = MONTHLY_REVENUE.reduce((s, d) => s + d.orders, 0)

  const stats = [
    { label: t('admin.dashboard.totalUsers'),   value: '284',           change: '+12%',   positive: true,  icon: Users,        color: 'text-orange-500',                   bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: t('admin.dashboard.activeUsers'),  value: '261',           change: '+5.2%',  positive: true,  icon: UserCheck,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: t('admin.dashboard.lockedUsers'),  value: '23',            change: '-2%',    positive: false, icon: UserX,        color: 'text-red-500',                      bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: t('admin.dashboard.orders'),       value: String(totalOrders), change: '+8.1%', positive: true,  icon: ShoppingBag,  color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold mt-0.5">{user?.fullName} 👋</h1>
          <p className="text-orange-100 text-sm mt-1">{t('admin.dashboard.welcomeDesc')}</p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-2 top-12 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Revenue chart + Top products */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Doanh thu 2025 — <span className="text-orange-500">{formatCurrency(totalRevenue)}</span>
              </h3>
            </div>
            <div className="flex gap-1 rounded-lg border border-gray-100 dark:border-white/10 p-0.5">
              {(['month', 'quarter'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-all',
                    chartPeriod === p ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700',
                  )}
                >
                  {p === 'month' ? 'Tháng' : 'Quý'}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart period={chartPeriod} />
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-orange-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Sản phẩm bán chạy</h3>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white',
                  i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                )}>
                  {i + 1}
                </span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                  <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.sold} đã bán</p>
                </div>
                <p className="text-xs font-bold text-orange-500 shrink-0">{formatCurrency(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quick access */}
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.quickAccess')}</h3>
          </div>
          <div className="space-y-1">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-gray-50 dark:hover:bg-white/5 group"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', link.color)}>
                  <link.icon size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {link.label}
                </span>
                <ArrowUpRight size={13} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.recentActivity')}</h3>
          </div>
          <div className="relative pl-4">
            {/* Timeline bar */}
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-100 dark:bg-white/5" />
            <div className="space-y-5">
              {RECENT_ACTIVITIES.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className={cn('absolute -left-[17px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#21232d]', item.dot)} />
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5', 'text-gray-400')}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{t(item.textKey)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DashboardPage }
