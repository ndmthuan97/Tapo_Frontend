import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  LockKeyhole,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react'
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users'
import { cn } from '@/lib/utils'
import { UserRole, UserStatus } from '@/lib/types/user/user.types'
import type { UserDto } from '@/lib/types/user/user.types'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:
    'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  SALES_STAFF:
    'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  WAREHOUSE_STAFF:
    'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400',
  CUSTOMER:
    'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  SALES_STAFF: 'Sales',
  WAREHOUSE_STAFF: 'Warehouse',
  CUSTOMER: 'Customer',
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm transition-colors">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function AdminUsersPage() {
  const { t } = useTranslation()
  const {
    data,
    isLoading,
    page,
    roleFilter,
    setPage,
    setRoleFilter,
    lockUser,
    unlockUser,
    reload,
  } = useAdminUsers()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce: wait 350ms after user stops typing before updating the filter
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const ROLE_OPTIONS = [
    { value: undefined, label: t('adminUsers.filter.all') },
    { value: UserRole.CUSTOMER, label: t('adminUsers.filter.customer') },
    { value: UserRole.SALES_STAFF, label: t('adminUsers.filter.sales') },
    { value: UserRole.WAREHOUSE_STAFF, label: t('adminUsers.filter.warehouse') },
    { value: UserRole.ADMIN, label: t('adminUsers.filter.admin') },
  ]

  useEffect(() => { reload() }, [])

  const totalUsers = data?.totalElements ?? 0
  const activeCount = data?.content.filter((u: UserDto) => u.status === UserStatus.ACTIVE).length ?? 0
  const lockedCount = data?.content.filter((u: UserDto) => u.status === UserStatus.LOCKED).length ?? 0

  // Filter the visible page by the debounced query (name or email, case-insensitive)
  const q = debouncedQuery.trim().toLowerCase()
  const filteredContent = q
    ? (data?.content ?? []).filter(
      (u: UserDto) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
    : (data?.content ?? [])

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('adminUsers.pageTitle')}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label={t('adminUsers.filter.all')} value={totalUsers} color="bg-orange-500" />
        <StatCard icon={UserCheck} label={t('adminUsers.active')} value={activeCount} color="bg-emerald-500" />
        <StatCard icon={UserX} label={t('adminUsers.locked')} value={lockedCount} color="bg-red-500" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">
            {t('adminUsers.pageTitle')}
          </p>

          {/* Search */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder={t('adminUsers.searchPlaceholder')}
              className="w-52 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter ?? ''}
            onChange={(e) =>
              setRoleFilter(
                (e.target.value as (typeof UserRole)[keyof typeof UserRole]) || undefined,
              )
            }
            className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm focus:border-orange-400 dark:focus:border-orange-500 focus:outline-none transition-colors cursor-pointer"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">{t('adminUsers.colName')}</th>
                <th className="px-5 py-3.5">{t('adminUsers.colEmail')}</th>
                <th className="px-5 py-3.5">{t('adminUsers.colRole')}</th>
                <th className="px-5 py-3.5">{t('adminUsers.colStatus')}</th>
                <th className="px-5 py-3.5 text-right">{t('adminUsers.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-orange-500" size={28} />
                  </td>
                </tr>
              ) : !filteredContent.length ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    {t('adminUsers.noResult')}
                  </td>
                </tr>
              ) : (
                filteredContent.map((user: UserDto) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]"
                  >
                    {/* Name + avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatarUrl ?? ''}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
                            onError={(e) => {
                              ; (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          {/* Online dot */}
                          <span
                            className={cn(
                              'absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#21232d]',
                              user.status === UserStatus.ACTIVE
                                ? 'bg-emerald-500'
                                : 'bg-gray-400',
                            )}
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          ROLE_BADGE[user.role] ??
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                        )}
                      >
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          user.status === UserStatus.ACTIVE
                            ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            user.status === UserStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500',
                          )}
                        />
                        {user.status === UserStatus.ACTIVE
                          ? t('adminUsers.active')
                          : t('adminUsers.locked')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {user.role !== UserRole.ADMIN ? (
                          user.status === UserStatus.ACTIVE ? (
                            <button
                              onClick={() => lockUser(user.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                            >
                              <LockKeyhole size={11} />
                              {t('adminUsers.lock')}
                            </button>
                          ) : (
                            <button
                              onClick={() => unlockUser(user.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
                            >
                              <Unlock size={11} />
                              {t('adminUsers.unlock')}
                            </button>
                          )
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 dark:text-gray-600">
                            <Shield size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3.5 transition-colors">
            <span className="text-xs text-gray-400">
              {t('adminUsers.page')} {page} / {data.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition',
                    p === page
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AdminUsersPage }
