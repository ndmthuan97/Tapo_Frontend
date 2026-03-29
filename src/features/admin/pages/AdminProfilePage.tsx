import { useTranslation } from 'react-i18next'
import { ProfilePanel } from '@/features/shop/user/components/ProfilePanel'

/** Profile page rendered inside the admin panel (no Header/Footer — AdminLayout handles that). */
function AdminProfilePage() {
  const { t } = useTranslation()
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('profile.pageTitle')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t('profile.pageSubtitle')}
        </p>
      </div>
      <ProfilePanel />
    </div>
  )
}

export { AdminProfilePage }
