import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, LockKeyhole, Unlock, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { useAdminUsers } from '@/features/user/hooks/use-admin-users'
import { cn } from '@/lib/utils'
import { UserRole, UserStatus } from '@/lib/types/user/user.types'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-500 dark:text-red-400',
  SALES_STAFF: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  WAREHOUSE_STAFF: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  CUSTOMER: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
}

function AdminUsersPage() {
  const { t } = useTranslation()
  const { data, isLoading, page, roleFilter, setPage, setRoleFilter, lockUser, unlockUser, reload } =
    useAdminUsers()

  // i18n-ised role filter options — built inside component so they react to language changes
  const ROLE_OPTIONS = [
    { value: undefined, label: t('adminUsers.filter.all') },
    { value: UserRole.CUSTOMER, label: t('adminUsers.filter.customer') },
    { value: UserRole.SALES_STAFF, label: t('adminUsers.filter.sales') },
    { value: UserRole.WAREHOUSE_STAFF, label: t('adminUsers.filter.warehouse') },
    { value: UserRole.ADMIN, label: t('adminUsers.filter.admin') },
  ]

  useEffect(() => { reload() }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <Users size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminUsers.pageTitle')}</h1>
            <p className="text-sm text-gray-500">
              {data ? `${data.totalElements} ${t('adminUsers.total')}` : '—'}
            </p>
          </div>
        </div>

        {/* Role filter — fully i18n */}
        <select
          value={roleFilter ?? ''}
          onChange={(e) =>
            setRoleFilter(
              (e.target.value as (typeof UserRole)[keyof typeof UserRole]) || undefined,
            )
          }
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-orange-400 dark:focus:border-orange-500 focus:outline-none transition-colors"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900 shadow-sm transition-colors">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-4">{t('adminUsers.colName')}</th>
              <th className="px-6 py-4">{t('adminUsers.colEmail')}</th>
              <th className="px-6 py-4">{t('adminUsers.colRole')}</th>
              <th className="px-6 py-4">{t('adminUsers.colStatus')}</th>
              <th className="px-6 py-4 text-right">{t('adminUsers.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="mx-auto animate-spin text-orange-500" size={32} />
                </td>
              </tr>
            ) : !data?.content.length ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  {t('adminUsers.noResult')}
                </td>
              </tr>
            ) : (
              data.content.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 dark:border-white/5 transition hover:bg-orange-50/40 dark:hover:bg-white/5"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl ?? ''}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        ROLE_COLORS[user.role] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        user.status === UserStatus.ACTIVE
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                      )}
                    >
                      {user.status === UserStatus.ACTIVE
                        ? t('adminUsers.active')
                        : t('adminUsers.locked')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== UserRole.ADMIN ? (
                      user.status === UserStatus.ACTIVE ? (
                        <button
                          onClick={() => lockUser(user.id)}
                          className="flex items-center gap-1.5 ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <LockKeyhole size={12} /> {t('adminUsers.lock')}
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockUser(user.id)}
                          className="flex items-center gap-1.5 ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        >
                          <Unlock size={12} /> {t('adminUsers.unlock')}
                        </button>
                      )
                    ) : (
                      <Shield size={14} className="ml-auto text-gray-300" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-6 py-4 transition-colors">
            <span className="text-xs text-gray-400">
              {t('adminUsers.page')} {page} / {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-200 dark:border-white/10 p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-gray-200 dark:border-white/10 p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AdminUsersPage }
