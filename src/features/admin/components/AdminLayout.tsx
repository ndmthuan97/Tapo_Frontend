import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Users, Store, LogOut, ChevronRight, Zap, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAuthContext } from '@/lib/context/auth-context'
import { DEFAULT_AVATAR } from '@/lib/context/auth-context'
import { useAdminTheme } from '@/features/admin/hooks/use-admin-theme'

interface NavItem {
  to: string
  icon: typeof Users
  labelKey: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/users', icon: Users, labelKey: 'admin.nav.users' },
]

function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { user } = useAuthContext()
  const { isDark, toggleTheme } = useAdminTheme()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/5 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-900/20">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">TAPO</span>
              <span className="ml-1.5 rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                Admin
              </span>
            </div>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            title={isDark ? t('admin.switchLight') : t('admin.switchDark')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {t('admin.nav.management')}
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-orange-500 dark:text-orange-400' : ''} />
                  <span className="flex-1">{t(labelKey)}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-orange-400 opacity-60" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-white/5 p-3 space-y-2">
          {/* Go to shop */}
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 transition hover:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400"
          >
            <Store size={15} />
            <span className="flex-1 text-left">{t('admin.goToShop')}</span>
            <ChevronRight size={13} className="opacity-40" />
          </button>

          {/* User info card */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-100 dark:bg-white/5 px-3 py-2.5">
            <img
              src={user?.avatarUrl ?? DEFAULT_AVATAR}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title={t('admin.logout')}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        {children}
      </main>
    </div>
  )
}

export { AdminLayout }
