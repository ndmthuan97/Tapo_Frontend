import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users, UserCheck, UserX, ShoppingBag, TrendingUp, TrendingDown, ArrowUpRight,
  Package, Tag, Bookmark, Activity, BarChart3,
  CheckCircle2, XCircle, Timer, Download,
} from 'lucide-react'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { statisticsApi, type DashboardStatsDto, type RevenueDataPoint } from '@/lib/http/statistics.api'
import { toast } from 'sonner'

// ── SVG Revenue Bar Chart ─────────────────────────────────────────────────────

function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue), 1)
  const chartH = 140
  const barW   = data.length <= 4 ? 48 : 20
  const gap    = data.length <= 4 ? 28 : 10
  const totalW = data.length * (barW + gap) - gap + 40

  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH + 30}`}
      className="w-full overflow-visible"
      style={{ height: chartH + 40 }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(v => (
        <line key={v}
          x1={20} y1={chartH - v * chartH}
          x2={totalW} y2={chartH - v * chartH}
          stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
          className="text-gray-900 dark:text-white"
        />
      ))}
      {data.map((d, i) => {
        const barH = Math.max(4, (d.revenue / maxVal) * chartH)
        const x = 20 + i * (barW + gap)
        const y = chartH - barH
        return (
          <g key={d.label}>
            <rect x={x} y={0} width={barW} height={chartH} rx={6}
              fill="currentColor" fillOpacity={0.03} className="text-gray-500" />
            <rect x={x} y={y} width={barW} height={barH} rx={6}
              fill="url(#barGrad)" className="transition-all duration-500" />
            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500" fontSize={9} fontWeight={500}>
              {d.label}
            </text>
          </g>
        )
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f97316" stopOpacity={1} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.5} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string; value: string; change: string | null; positive: boolean
  icon: typeof Users; color: string; bg: string
}

function StatCard({ label, value, change, positive, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
          <Icon size={20} className={color} />
        </div>
        {change && (
          <span className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            positive
              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400',
          )}>
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-28 rounded-2xl bg-orange-100 dark:bg-orange-900/20" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-white/5" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 h-52 rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="lg:col-span-2 h-52 rounded-2xl bg-gray-100 dark:bg-white/5" />
      </div>
    </div>
  )
}

// ── Quick access links ────────────────────────────────────────────────────────

// QUICK_LINKS are defined inside component to access t() — labels move to locale
const QUICK_LINK_DEFS = [
  { key: 'users',      href: '/admin/users',     icon: Users,       color: 'bg-orange-500' },
  { key: 'products',   href: '/admin/products',   icon: Package,     color: 'bg-blue-500' },
  { key: 'categories', href: '/admin/categories', icon: Tag,         color: 'bg-purple-500' },
  { key: 'brands',     href: '/admin/brands',     icon: Bookmark,    color: 'bg-teal-500' },
  { key: 'orders',     href: '/admin/orders',     icon: ShoppingBag, color: 'bg-emerald-500' },
] as const

// ── Main ──────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const [chartPeriod, setChartPeriod] = useState<'month' | 'quarter'>('month')
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [retryKey, setRetryKey] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    statisticsApi.getDashboard(year).then(res => {
      setIsLoading(false)
      if (res.success && res.data) {
        setStats(res.data)
      } else {
        setHasError(true)
        toast.error('Không tải được dữ liệu thống kê')
      }
    })
  }, [year, retryKey])

  async function handleExport() {
    setIsExporting(true)
    const result = await statisticsApi.exportDashboard(year)
    setIsExporting(false)
    if (!result.ok) {
      toast.error(t('admin.dashboard.export.failed'))
      return
    }
    // Trigger browser download
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tapo-revenue-${year}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('admin.dashboard.export.success'))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('admin.dashboard.morning')
    : hour < 18 ? t('admin.dashboard.afternoon')
    : t('admin.dashboard.evening')

  const formatGrowth = (pct: number) =>
    `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`

  if (isLoading) return <DashboardSkeleton />
  if (hasError || !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <BarChart3 size={40} className="text-gray-200 dark:text-white/10" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Không thể tải dữ liệu dashboard</p>
      <p className="text-xs text-gray-400">Kiểm tra kết nối backend hoặc thử lại</p>
      <button
        onClick={() => { setStats(null); setRetryKey(k => k + 1) }}
        className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
      >
        Thử lại
      </button>
    </div>
  )

  const statCards: StatCardProps[] = [
    {
      label: t('admin.dashboard.revenueMonth'),
      value: formatCurrency(stats.revenueThisMonth),
      change: formatGrowth(stats.revenueGrowthPct),
      positive: stats.revenueGrowthPct >= 0,
      icon: BarChart3,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: t('admin.dashboard.orders'),
      value: stats.ordersThisMonth.toLocaleString(),
      change: formatGrowth(stats.ordersGrowthPct),
      positive: stats.ordersGrowthPct >= 0,
      icon: ShoppingBag,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: t('admin.dashboard.totalUsers'),
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersThisMonth} ${t('admin.dashboard.newUsersMonth')}`,
      positive: true,
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: t('admin.dashboard.pendingOrders'),
      value: stats.pendingOrders.toLocaleString(),
      change: null,
      positive: stats.pendingOrders === 0,
      icon: Timer,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: t('admin.dashboard.avgOrder'),
      value: formatCurrency(stats.avgOrderValue ?? 0),
      change: null,
      positive: true,
      icon: BarChart3,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ]

  const chartData = chartPeriod === 'month' ? stats.monthlyRevenue : stats.quarterlyRevenue

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.fullName} 👋</h1>
            <p className="text-orange-100 text-sm mt-1">{t('admin.dashboard.welcomeDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export button */}
            <button
              id="dashboard-export-btn"
              onClick={handleExport}
              disabled={isExporting || isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30 transition disabled:opacity-50 backdrop-blur"
            >
              <Download size={14} />
              {isExporting ? t('admin.dashboard.export.loading') : t('admin.dashboard.export.button')}
            </button>
            {/* Year selector */}
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="rounded-xl bg-white/20 border border-white/30 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y} className="text-gray-800">{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-2 top-12 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Order status mini row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: 'pending',    value: stats.pendingOrders,    icon: Timer,         color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { key: 'processing', value: stats.processingOrders, icon: Activity,       color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { key: 'delivered',  value: stats.deliveredOrders,  icon: CheckCircle2,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { key: 'cancelled',  value: stats.cancelledOrders,  icon: XCircle,        color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map(item => (
          <div key={item.key} className={cn('flex items-center gap-3 rounded-xl p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]')}>
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', item.bg)}>
              <item.icon size={16} className={item.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400">{t(`admin.dashboard.orderStatusLabels.${item.key}` as any)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Top products */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {t('admin.dashboard.revenueChart', { year })}{' —'}{' '}
                <span className="text-orange-500">{formatCurrency(stats.totalRevenue)}</span>
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
                  {p === 'month' ? t('admin.dashboard.monthly') : t('admin.dashboard.quarterly')}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-orange-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('admin.dashboard.bestSeller')}</h3>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">{t('admin.dashboard.noData')}</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white',
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                  )}>{i + 1}</span>
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package size={14} className="text-gray-300 dark:text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{t('admin.dashboard.soldCount', { count: p.totalSold.toLocaleString() })}</p>
                  </div>
                  <p className="text-xs font-bold text-orange-500 shrink-0">{formatCurrency(p.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
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
            {QUICK_LINK_DEFS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-gray-50 dark:hover:bg-white/5 group"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', link.color)}>
                  <link.icon size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {t(`admin.dashboard.quickLinks.${link.key}` as any)}
                </span>
                <ArrowUpRight size={13} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* User stats */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Users size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.userStats')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'totalUsers',  value: stats.totalUsers,   icon: Users,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-500/10' },
              { key: 'activeUsers', value: stats.activeUsers,  icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { key: 'lockedUsers', value: stats.lockedUsers,  icon: UserX,    color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-500/10' },
            ].map(item => (
              <div key={item.key} className="text-center">
                <div className={cn('mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl', item.bg)}>
                  <item.icon size={18} className={item.color} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400">{t(`admin.dashboard.${item.key}` as any)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 px-4 py-3 text-center">
            <span className="text-sm font-bold text-orange-500 mr-2">{stats.newUsersThisMonth}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.dashboard.newUsersMonth')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DashboardPage }
