import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProfilePanel } from '@/features/shop/user/components/ProfilePanel'
import {
  User, MapPin, Lock, Package, ChevronRight, Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext, DEFAULT_AVATAR } from '@/lib/context/auth-context'
import { Link } from 'react-router-dom'

// ── Quick-stat items ──────────────────────────────────────────────────────────
const QUICK_STATS = [
  { icon: Package, labelKey: 'profile.statOrders', value: '5', href: '/orders' },
  { icon: Heart,   labelKey: 'profile.statWishlist', value: '12', href: '/wishlist' },
]

type SideTab = 'profile' | 'security' | 'address'

function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SideTab>('profile')

  const avatarSrc = user?.avatarUrl ?? DEFAULT_AVATAR

  const SIDE_TABS: { id: SideTab; icon: React.ElementType; labelKey: string }[] = [
    { id: 'profile',  icon: User,    labelKey: 'profile.tabProfile' },
    { id: 'security', icon: Lock,    labelKey: 'profile.tabSecurity' },
    { id: 'address',  icon: MapPin,  labelKey: 'profile.tabAddress' },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('profile.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

            {/* ── Left sidebar ───────────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Avatar card */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-6 text-center">
                <div className="relative mx-auto mb-3 h-20 w-20">
                  <img
                    src={avatarSrc}
                    alt={user?.fullName}
                    className="h-full w-full rounded-full object-cover ring-4 ring-orange-100 dark:ring-orange-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                    <User size={11} />
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{user?.fullName}</p>
                <p className="mt-0.5 text-xs text-gray-400 truncate px-2">{user?.email}</p>
                <div className="mt-3 flex justify-center gap-4">
                  {QUICK_STATS.map(s => (
                    <button
                      key={s.href}
                      onClick={() => navigate(s.href)}
                      className="flex flex-col items-center text-center hover:text-orange-500 transition-colors"
                    >
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</span>
                      <span className="text-[10px] text-gray-400">{t(s.labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav tabs */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden">
                {SIDE_TABS.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all border-l-2',
                        activeTab === tab.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white',
                      )}
                    >
                      <Icon size={15} className="shrink-0" />
                      {t(tab.labelKey)}
                      <ChevronRight size={13} className="ml-auto opacity-40" />
                    </button>
                  )
                })}
              </div>

              {/* Quick links */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden">
                {[
                  { label: t('orders.pageTitle'), href: '/orders', icon: Package },
                  { label: t('wishlist.pageTitle'), href: '/wishlist', icon: Heart },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-orange-500 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                  >
                    <Icon size={14} className="shrink-0" />
                    {label}
                    <ChevronRight size={12} className="ml-auto opacity-40" />
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Main content ────────────────────────────────────────────── */}
            <div className="lg:col-span-3">
              <ProfilePanel initialTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ProfilePage }
