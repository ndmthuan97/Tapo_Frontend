import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  Users,
  Store,
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
  LayoutDashboard,
  ChevronsLeft,
  ChevronsRight,
  UserCircle,
  ChevronDown,
  Package,
  Tag,
  Bookmark,
  ShoppingBag,
  Mail,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/shop/auth/hooks/use-auth'
import { useAuthContext } from '@/lib/context/auth-context'
import { DEFAULT_AVATAR } from '@/lib/context/auth-context'
import { useAdminTheme } from '@/features/admin/hooks/use-admin-theme'
import { AdminLanguageSwitcher } from '@/features/admin/components/AdminLanguageSwitcher'

interface NavItem {
  to: string
  icon: typeof Users
  labelKey: string
}

interface NavSection {
  groupKey: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    groupKey: 'admin.nav.management',
    items: [
      { to: '/admin',       icon: LayoutDashboard, labelKey: 'admin.nav.dashboard' },
      { to: '/admin/users', icon: Users,           labelKey: 'admin.nav.users' },
    ],
  },
  {
    groupKey: 'admin.nav.catalog',
    items: [
      { to: '/admin/products',   icon: Package,     labelKey: 'admin.nav.products' },
      { to: '/admin/categories', icon: Tag,         labelKey: 'admin.nav.categories' },
      { to: '/admin/brands',     icon: Bookmark,    labelKey: 'admin.nav.brands' },
    ],
  },
  {
    groupKey: 'admin.nav.sales',
    items: [
      { to: '/admin/orders',   icon: ShoppingBag, labelKey: 'admin.nav.orders' },
      { to: '/admin/messages', icon: Mail,        labelKey: 'admin.nav.messages' },
    ],
  },
]


function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { user } = useAuthContext()
  const { isDark, toggleTheme } = useAdminTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Show full sidebar when: permanently open OR hovering while collapsed
  const isExpanded = !collapsed || hovered

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#1a1c23] text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* ══ SIDEBAR ═══════════════════════════════════════════════════════ */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex shrink-0 flex-col bg-white dark:bg-[#21232d] border-r border-gray-100 dark:border-white/5 transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'w-60' : 'w-[68px]',
        )}
      >
        {/* Logo + collapse toggle — same row */}
        <div className="flex h-16 items-center px-4 border-b border-gray-100 dark:border-white/5 overflow-hidden gap-1">
          <img src="/logo.png" alt="Tapo Admin" className="h-10 w-10 shrink-0 object-contain drop-shadow-sm" />
          {isExpanded && (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[15px] font-bold tracking-tight whitespace-nowrap">TAPO</span>
              <span className="rounded-full bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider whitespace-nowrap">
                Admin
              </span>
            </div>
          )}
          {/* Toggle button — locks sidebar open/closed */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
            className={cn(
              'shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-orange-500 dark:hover:text-orange-400 transition',
              !isExpanded && 'mx-auto',
            )}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-auto py-4 px-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.groupKey}>
              {isExpanded && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t(section.groupKey)}
                </p>
              )}
              {!isExpanded && <div className="my-1 mx-2 border-t border-gray-100 dark:border-white/5" />}
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, labelKey }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/admin'}
                    title={!isExpanded ? t(labelKey) : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg transition-all duration-150 overflow-hidden',
                        !isExpanded ? 'justify-center px-0 py-2.5 mx-auto w-10' : 'px-3 py-2.5',
                        isActive
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white',
                      )
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">{t(labelKey)}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-white/5 p-2 space-y-1.5">
          {/* Go to shop */}
          <button
            onClick={() => navigate('/')}
            title={!isExpanded ? t('admin.goToShop') : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/5 hover:text-orange-500 dark:hover:text-orange-400 overflow-hidden',
              !isExpanded ? 'justify-center w-10 mx-auto py-2' : 'w-full px-3 py-2',
            )}
          >
            <Store size={15} className="shrink-0" />
            {isExpanded && <span className="flex-1 text-left whitespace-nowrap">{t('admin.goToShop')}</span>}
          </button>

          {/* User card — shows only avatar when collapsed */}
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg bg-gray-50 dark:bg-white/5 overflow-hidden transition-all duration-300',
              !isExpanded ? 'justify-center px-0 py-2' : 'px-3 py-2.5',
            )}
          >
            <img
              src={user?.avatarUrl ?? DEFAULT_AVATAR}
              alt=""
              title={!isExpanded ? user?.fullName : undefined}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            {isExpanded && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{user?.fullName}</p>
                  <p className="truncate text-[10px] text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  title={t('admin.logout')}
                  className="rounded p-1 text-gray-400 hover:text-red-500 transition"
                >
                  <LogOut size={13} />
                </button>
              </>
            )}
          </div>
        </div>


      </aside>

      {/* ══ RIGHT COLUMN ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* TOP BAR */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] px-6 transition-colors duration-300">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 max-w-xs">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent flex-1 outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 text-sm min-w-0"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? t('admin.switchLight') : t('admin.switchDark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language selector */}
            <AdminLanguageSwitcher />

            {/* Notifications */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#21232d]" />
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

            {/* User avatar + dropdown */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen((p) => !p)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                <img
                  src={user?.avatarUrl ?? DEFAULT_AVATAR}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-none">
                    {user?.fullName?.split(' ').pop()}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Admin</p>
                </div>
                <ChevronDown
                  size={12}
                  className={cn(
                    'text-gray-400 transition-transform duration-200',
                    avatarOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* Dropdown */}
              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl z-50 overflow-hidden">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <img
                      src={user?.avatarUrl ?? DEFAULT_AVATAR}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setAvatarOpen(false); navigate('/admin/profile') }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      <UserCircle size={15} />
                      {t('admin.viewProfile')}
                    </button>

                    <div className="my-1 border-t border-gray-100 dark:border-white/10" />

                    <button
                      onClick={() => { setAvatarOpen(false); logout() }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={15} />
                      {t('admin.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#1a1c23] transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AdminLayout }
