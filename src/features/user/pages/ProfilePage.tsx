import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Lock, Phone, Mail, Camera, Loader2 } from 'lucide-react'
import { useProfile } from '@/features/user/hooks/use-profile'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { DEFAULT_AVATAR } from '@/lib/context/auth-context'

type Tab = 'profile' | 'security'

function ProfilePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('profile')
  const { profile, isLoading, isSaving, updateProfile, changePassword } = useProfile()

  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Sync form with loaded profile (only once)
  if (profile && !profileForm.fullName) {
    setProfileForm({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? '',
    })
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateProfile({ fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber || undefined })
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await changePassword(passwordForm)
    if (ok) setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('profile.tabProfile'), icon: User },
    { id: 'security', label: t('profile.tabSecurity'), icon: Lock },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('profile.pageTitle')}</h1>
            <p className="text-sm text-gray-500">{t('profile.pageSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="space-y-4">
              {/* Avatar card */}
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
                <div className="relative">
                  <img
                    src={profile?.avatarUrl ?? DEFAULT_AVATAR}
                    alt={profile?.fullName ?? ''}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-orange-100"
                  />
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600">
                    <Camera size={13} />
                  </button>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{profile?.fullName ?? '—'}</p>
                  <p className="text-xs text-gray-400">{profile?.email}</p>
                </div>
              </div>

              {/* Nav tabs */}
              <nav className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors',
                      tab === id
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Panel */}
            <section className="lg:col-span-3">
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                {/* Profile Tab */}
                {tab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">{t('profile.infoTitle')}</h2>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <User size={14} /> {t('profile.fullName')}
                        </span>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                          required
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Mail size={14} /> {t('profile.email')}
                        </span>
                        <input
                          type="email"
                          value={profile?.email ?? ''}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Phone size={14} /> {t('profile.phone')}
                        </span>
                        <input
                          type="tel"
                          value={profileForm.phoneNumber}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                          placeholder="0901234567"
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving || isLoading}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
                    >
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      {t('profile.saveButton')}
                    </button>
                  </form>
                )}

                {/* Security Tab */}
                {tab === 'security' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">{t('profile.securityTitle')}</h2>

                    {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
                      <label key={field} className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">
                          {t(`profile.${field}`)}
                        </span>
                        <input
                          type="password"
                          value={passwordForm[field]}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, [field]: e.target.value }))
                          }
                          required
                          minLength={field !== 'currentPassword' ? 8 : undefined}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                    ))}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
                    >
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      {t('profile.changePasswordButton')}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ProfilePage }
