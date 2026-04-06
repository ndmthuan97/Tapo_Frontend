import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users, ShoppingBag, TrendingUp,
  Package, BarChart3, ArrowUpRight,
  Timer, Tag, Bookmark, Download, Loader2,
} from 'lucide-react'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { statisticsApi, type DashboardStatsDto, type RevenueDataPoint } from '@/lib/http/statistics.api'
import { StatCard } from '@/features/admin/components/AdminShared'
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


// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-gray-100 dark:bg-white/5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-white/5" />)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-white/5" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 h-52 rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="lg:col-span-2 h-52 rounded-2xl bg-gray-100 dark:bg-white/5" />
      </div>
    </div>
  )
}

// ── SVG Donut Chart ───────────────────────────────────────────────────────────

interface DonutSegment { value: number; color: string; label: string }

function DonutChart({
  segments, centerValue, centerLabel,
}: {
  segments: DonutSegment[]
  centerValue: number
  centerLabel: string
}) {
  const total = Math.max(segments.reduce((s, v) => s + v.value, 0), 1)
  const r = 32, circ = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="flex items-start gap-4">
      {/* Donut ring */}
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="h-[100px] w-[100px]">
          <g style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}>
            <circle cx={50} cy={50} r={r} fill="none"
              stroke="currentColor" strokeWidth={14} className="text-gray-100 dark:text-white/5" />
            {segments.filter(s => s.value > 0).map((seg, i) => {
              const pct = seg.value / total
              const dash = pct * circ
              const off  = -(acc * circ)
              acc += pct
              return (
                <circle key={i} cx={50} cy={50} r={r} fill="none"
                  stroke={seg.color} strokeWidth={14}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={off}
                  className="transition-all duration-700" />
              )
            })}
          </g>
          <text x={50} y={46} textAnchor="middle" fontSize={14} fontWeight={700}
            className="fill-gray-900 dark:fill-white">
            {centerValue.toLocaleString()}
          </text>
          <text x={50} y={60} textAnchor="middle" fontSize={7} className="fill-gray-400">
            {centerLabel}
          </text>
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-col justify-center gap-2 py-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-1">{seg.label}</span>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 ml-2">
              {seg.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Quick access links ───────────────────────────────────────────────────────

const QUICK_LINK_DEFS = [
  { key: 'users',      href: '/admin/users',     icon: Users,       color: 'bg-orange-500'  },
  { key: 'products',   href: '/admin/products',   icon: Package,     color: 'bg-blue-500'    },
  { key: 'categories', href: '/admin/categories', icon: Tag,         color: 'bg-purple-500'  },
  { key: 'brands',     href: '/admin/brands',     icon: Bookmark,    color: 'bg-teal-500'    },
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
        toast.error(t('admin.dashboard.loadError', 'Không tải được dữ liệu thống kê'))
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
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tapo-revenue-${year}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('admin.dashboard.export.success'))
  }

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
        className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition cursor-pointer"
      >
        Thử lại
      </button>
    </div>
  )

  const chartData = chartPeriod === 'month' ? stats.monthlyRevenue : stats.quarterlyRevenue

  return (
    <div className="p-6 space-y-6">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('admin.nav.dashboard')}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t('admin.dashboard.welcomeDesc')}, <span className="font-medium text-gray-700 dark:text-gray-300">{user?.fullName}</span>
          </p>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition cursor-pointer"
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            id="dashboard-export-btn"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200/50 hover:bg-orange-600 disabled:opacity-60 transition cursor-pointer"
          >
            {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {isExporting ? t('admin.dashboard.export.loading') : t('admin.dashboard.export.button')}
          </button>
        </div>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={BarChart3}   label={t('admin.dashboard.revenueMonth')} value={formatCurrency(stats.revenueThisMonth)} color="bg-orange-500"
          badge={formatGrowth(stats.revenueGrowthPct)} badgePositive={stats.revenueGrowthPct >= 0} />
        <StatCard icon={ShoppingBag} label={t('admin.dashboard.orders')}        value={stats.ordersThisMonth.toLocaleString()}  color="bg-blue-500"
          badge={formatGrowth(stats.ordersGrowthPct)}  badgePositive={stats.ordersGrowthPct >= 0}  />
        <StatCard icon={Users}       label={t('admin.dashboard.totalUsers')}     value={stats.totalUsers.toLocaleString()}        color="bg-emerald-500" />
        <StatCard icon={Timer}       label={t('admin.dashboard.pendingOrders')}  value={stats.pendingOrders.toLocaleString()}     color="bg-amber-500"  />
      </div>

      {/* ── Revenue chart + Top products ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* Chart card */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <div className="flex items-center gap-2 mr-auto">
              <BarChart3 size={15} className="text-orange-500" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('admin.dashboard.revenueChart', { year })}
                {' — '}
                <span className="text-orange-500">{formatCurrency(stats.totalRevenue)}</span>
              </p>
            </div>
            <div className="flex gap-1 rounded-lg border border-gray-100 dark:border-white/10 p-0.5">
              {(['month', 'quarter'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer',
                    chartPeriod === p ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                  )}
                >
                  {p === 'month' ? t('admin.dashboard.monthly') : t('admin.dashboard.quarterly')}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Top products card */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <TrendingUp size={15} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.bestSeller')}</p>
          </div>
          <div className="p-5">
            {stats.topProducts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">{t('admin.dashboard.noData')}</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white',
                      i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                    )}>{i + 1}</span>
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
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
      </div>

      {/* ── Bottom row: Quick Access | Order Stats | User Stats (3-col) ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Quick Access */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <BarChart3 size={15} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.quickAccess')}</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {QUICK_LINK_DEFS.map(link => {
              const Icon = link.icon
              return (
                <Link key={link.key} to={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', link.color)}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`admin.dashboard.quickLinks.${link.key}`)}
                  </span>
                  <ArrowUpRight size={13} className="text-gray-300 dark:text-white/20 group-hover:text-orange-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Order Statistics */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <ShoppingBag size={15} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.orderStats')}</p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {/* Donut with legend */}
            <DonutChart
              centerValue={stats.totalOrders ?? 0}
              centerLabel={t('admin.dashboard.orders')}
              segments={[
                { value: stats.pendingOrders    ?? 0, color: '#f59e0b', label: t('admin.dashboard.orderStatusLabels.pending')    },
                { value: stats.processingOrders ?? 0, color: '#3b82f6', label: t('admin.dashboard.orderStatusLabels.processing') },
                { value: stats.deliveredOrders  ?? 0, color: '#10b981', label: t('admin.dashboard.orderStatusLabels.delivered')  },
                { value: stats.cancelledOrders  ?? 0, color: '#ef4444', label: t('admin.dashboard.orderStatusLabels.cancelled')  },
              ]}
            />
          </div>
        </div>

        {/* User Statistics */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <Users size={15} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.userStats')}</p>
          </div>
          <div className="p-5">
            {/* Donut with legend — segments must be mutually exclusive & sum to totalUsers */}
            {(() => {
              const active    = stats.activeUsers    ?? 0
              const locked    = stats.lockedUsers    ?? 0
              const returning = stats.returningUsers ?? 0
              const inactive  = Math.max(0, (stats.totalUsers ?? 0) - active - locked)
              return (
                <DonutChart
                  centerValue={stats.totalUsers ?? 0}
                  centerLabel={t('admin.dashboard.totalUsers')}
                  segments={[
                    { value: active,    color: '#10b981', label: t('admin.dashboard.activeUsers')    },
                    { value: returning, color: '#3b82f6', label: t('admin.dashboard.returningUsers') },
                    { value: inactive,  color: '#f59e0b', label: 'Inactive'                         },
                    { value: locked,    color: '#ef4444', label: t('admin.dashboard.lockedUsers')    },
                  ]}
                />
              )
            })()}
          </div>
        </div>

      </div>

    </div>
  )
}

export { DashboardPage }
