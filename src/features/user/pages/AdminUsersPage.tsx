import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, LockKeyhole, Unlock, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { useAdminUsers } from '@/features/user/hooks/use-admin-users'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { UserRole, UserStatus } from '@/lib/types/user/user.types'

const ROLE_OPTIONS = [
  { value: undefined, label: 'Tất cả' },
  { value: UserRole.CUSTOMER, label: 'Khách hàng' },
  { value: UserRole.SALES_STAFF, label: 'Bán hàng' },
  { value: UserRole.WAREHOUSE_STAFF, label: 'Kho' },
  { value: UserRole.ADMIN, label: 'Admin' },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SALES_STAFF: 'bg-blue-100 text-blue-700',
  WAREHOUSE_STAFF: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-green-100 text-green-700',
}

function AdminUsersPage() {
  const { t } = useTranslation()
  const { data, isLoading, page, roleFilter, setPage, setRoleFilter, lockUser, unlockUser, reload } =
    useAdminUsers()

  useEffect(() => { reload() }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('adminUsers.pageTitle')}</h1>
                <p className="text-sm text-gray-500">
                  {data ? `${data.totalElements} ${t('adminUsers.total')}` : '—'}
                </p>
              </div>
            </div>

            {/* Role filter */}
            <select
              value={roleFilter ?? ''}
              onChange={(e) => setRoleFilter((e.target.value as typeof UserRole[keyof typeof UserRole]) || undefined)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                      <Loader2 className="mx-auto animate-spin text-orange-400" size={32} />
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
                      className="border-b border-gray-50 transition hover:bg-orange-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl ?? ''}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover bg-gray-100"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="font-medium text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600')}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            user.status === UserStatus.ACTIVE
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600',
                          )}
                        >
                          {user.status === UserStatus.ACTIVE ? t('adminUsers.active') : t('adminUsers.locked')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== UserRole.ADMIN && (
                          user.status === UserStatus.ACTIVE ? (
                            <button
                              onClick={() => lockUser(user.id)}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                            >
                              <LockKeyhole size={12} /> {t('adminUsers.lock')}
                            </button>
                          ) : (
                            <button
                              onClick={() => unlockUser(user.id)}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              <Unlock size={12} /> {t('adminUsers.unlock')}
                            </button>
                          )
                        )}
                        {user.role === UserRole.ADMIN && (
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
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <span className="text-xs text-gray-400">
                  {t('adminUsers.page')} {page} / {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { AdminUsersPage }
