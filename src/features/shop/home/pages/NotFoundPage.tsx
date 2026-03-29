import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Home, ShoppingBag, ArrowLeft } from 'lucide-react'

function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-13rem)] items-center justify-center bg-gray-50 dark:bg-[#191b22] transition-colors px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Ghost 404 with icon overlay */}
          <div className="relative mb-8 select-none">
            <span
              className="text-[9rem] font-extrabold leading-none tracking-tighter text-gray-100 dark:text-white/5"
              aria-hidden
            >
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10">
                <ShoppingBag size={36} className="text-orange-500" />
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {t('notFound.title')}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {t('notFound.description')}
          </p>

          <div className="mb-8 h-1 w-12 rounded-full bg-orange-500" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-white/10 px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={15} /> {t('common.goBack')}
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
            >
              <Home size={15} /> {t('common.home')}
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 rounded-full border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 px-6 py-2.5 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
            >
              <ShoppingBag size={15} /> {t('common.backToShop')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { NotFoundPage }
