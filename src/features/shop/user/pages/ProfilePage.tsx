import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProfilePanel } from '@/features/shop/user/components/ProfilePanel'
import { ChevronRight } from 'lucide-react'

function ProfilePage() {
  const { t } = useTranslation()

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
          <ProfilePanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ProfilePage }
