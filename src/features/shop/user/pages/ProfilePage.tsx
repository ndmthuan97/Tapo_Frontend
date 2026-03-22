import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProfilePanel } from '@/features/shop/user/components/ProfilePanel'

function ProfilePage() {
  const { t } = useTranslation()
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-white dark:from-[#1a1c23] dark:via-[#1a1c23] dark:to-[#21232d] py-12 transition-colors">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.pageTitle')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.pageSubtitle')}</p>
          </div>
          <ProfilePanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ProfilePage }
