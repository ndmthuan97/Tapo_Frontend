import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  LockKeyhole,
  Unlock,
  Eye,
  X,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react'

import { useAdminUsers } from '@/features/admin/hooks/use-admin-users'
import { cn } from '@/lib/utils'
import { UserRole, UserStatus } from '@/lib/types/user/user.types'
import type { UserDto } from '@/lib/types/user/user.types'
import { StatCard, AdminSearchInput, AdminFilterSelect, AdminTablePagination } from '@/features/admin/components/AdminShared'

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

// ── Helpers & Sub-components ──────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className={cn('text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[220px] text-right', mono && 'font-mono text-[10px]')}>{value}</span>
    </div>
  )
}

function UserDetailModal({ user, onClose }: { user: UserDto; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('adminUsers.modal.title')}</h3>
          <button onClick={onClose} aria-label={t('adminUsers.modal.close')} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"><X size={15} /></button>
        </div>
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-6 px-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative">
            <img
              src={user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f97316&color=fff&size=80`}
              alt={user.fullName}
              className="h-20 w-20 rounded-full object-cover bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-[#21232d]"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f97316&color=fff&size=80` }}
            />
            <span className={cn('absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-[#21232d]',
              user.status === UserStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500')} />
          </div>
          <h4 className="mt-3 text-base font-bold text-gray-900 dark:text-white">{user.fullName}</h4>
          <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', ROLE_BADGE[user.role] ?? 'bg-gray-100 text-gray-600')}>
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              user.status === UserStatus.ACTIVE
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', user.status === UserStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500')} />
              {user.status === UserStatus.ACTIVE ? t('adminUsers.active') : t('adminUsers.locked')}
            </span>
          </div>
        </div>
        {/* Info rows */}
        <div className="px-5 py-1">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label={t('adminUsers.modal.phone')} value={user.phoneNumber ?? t('adminUsers.modal.noPhone')} />
          <InfoRow label={t('adminUsers.modal.userId')} value={user.id} mono />
        </div>
        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 dark:border-white/5 px-5 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            {t('adminUsers.modal.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserSkeleton() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 shrink-0" />
              <div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-44 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5 text-right">
            <div className="inline-flex justify-end gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
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
  const [detailUser, setDetailUser] = useState<UserDto | null>(null)

  // Debounce 350ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalUsers = data?.totalElements ?? 0
  const activeCount = data?.content.filter((u: UserDto) => u.status === UserStatus.ACTIVE).length ?? 0
  const lockedCount = data?.content.filter((u: UserDto) => u.status === UserStatus.LOCKED).length ?? 0

  // Client-side search filter
  const q = debouncedQuery.trim().toLowerCase()
  const filteredContent = q
    ? (data?.content ?? []).filter(
      (u: UserDto) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
    : (data?.content ?? [])

  const ROLE_OPTIONS = [
    { value: undefined, label: t('adminUsers.filter.all') },
    { value: UserRole.CUSTOMER, label: t('adminUsers.filter.customer') },
    { value: UserRole.SALES_STAFF, label: t('adminUsers.filter.sales') },
    { value: UserRole.WAREHOUSE_STAFF, label: t('adminUsers.filter.warehouse') },
    { value: UserRole.ADMIN, label: t('adminUsers.filter.admin') },
  ]

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
          <AdminSearchInput
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setPage(1) }}
            placeholder={t('adminUsers.searchPlaceholder')}
          />

          {/* Role filter */}
          <AdminFilterSelect
            value={roleFilter ?? ''}
            onChange={(v) => setRoleFilter((v as (typeof UserRole)[keyof typeof UserRole]) || undefined)}
            options={ROLE_OPTIONS.map((opt) => ({ value: opt.value ?? '', label: opt.label }))}
          />
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
                <UserSkeleton />
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
                        <div className="relative shrink-0">
                          <img
                            src={user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f97316&color=fff&size=32`}
                            alt={user.fullName}
                            className="h-8 w-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f97316&color=fff&size=32`
                            }}
                          />
                          {/* Status dot */}
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
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailUser(user)}
                          aria-label={t('adminUsers.modal.viewBtn')}
                          title={t('adminUsers.modal.viewBtn')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>

                        {user.role !== UserRole.ADMIN ? (
                          user.status === UserStatus.ACTIVE ? (
                            <button
                              onClick={() => lockUser(user.id)}
                              aria-label={t('adminUsers.lock')}
                              title={t('adminUsers.lock')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition cursor-pointer"
                            >
                              <LockKeyhole size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => unlockUser(user.id)}
                              aria-label={t('adminUsers.unlock')}
                              title={t('adminUsers.unlock')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              <Unlock size={12} />
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
        {data && (
          <AdminTablePagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}
    </div>
  )
}

export { AdminUsersPage }
