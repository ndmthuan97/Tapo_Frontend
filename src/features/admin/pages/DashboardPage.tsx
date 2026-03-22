import { useTranslation } from 'react-i18next'
import { Users, UserCheck, UserX, ShoppingBag, TrendingUp, ArrowUpRight, Activity, Clock } from 'lucide-react'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'

interface StatCard {
  label: string
  value: string
  change: string
  positive: boolean
  icon: typeof Users
  color: string
  bg: string
}

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthContext()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('admin.dashboard.morning') : hour < 18 ? t('admin.dashboard.afternoon') : t('admin.dashboard.evening')

  const stats: StatCard[] = [
    {
      label: t('admin.dashboard.totalUsers'),
      value: '—',
      change: '+12%',
      positive: true,
      icon: Users,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: t('admin.dashboard.activeUsers'),
      value: '—',
      change: '+5.2%',
      positive: true,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: t('admin.dashboard.lockedUsers'),
      value: '—',
      change: '-2%',
      positive: false,
      icon: UserX,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-500/10',
    },
    {
      label: t('admin.dashboard.orders'),
      value: '—',
      change: '+8.1%',
      positive: true,
      icon: ShoppingBag,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
  ]

  const quickLinks = [
    { label: t('admin.nav.users'), href: '/admin/users', icon: Users, color: 'bg-orange-500' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold mt-0.5">{user?.fullName} 👋</h1>
          <p className="text-orange-100 text-sm mt-1">{t('admin.dashboard.welcomeDesc')}</p>
        </div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-2 top-12 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.bg)}>
                <s.icon size={20} className={s.color} />
              </div>
              <span
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  s.positive
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400',
                )}
              >
                <TrendingUp size={10} />
                {s.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick access */}
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.quickAccess')}</h3>
          </div>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-white/5 group"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', link.color)}>
                  <link.icon size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {link.label}
                </span>
                <ArrowUpRight size={13} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition" />
              </a>
            ))}
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('admin.dashboard.recentActivity')}</h3>
          </div>
          <div className="space-y-3">
            {[
              { text: t('admin.dashboard.activity1'), time: '2 phút trước', dot: 'bg-emerald-500' },
              { text: t('admin.dashboard.activity2'), time: '15 phút trước', dot: 'bg-blue-500' },
              { text: t('admin.dashboard.activity3'), time: '1 giờ trước', dot: 'bg-orange-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { DashboardPage }
