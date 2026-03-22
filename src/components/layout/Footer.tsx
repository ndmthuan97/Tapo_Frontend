import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

function Footer() {
  const { t } = useTranslation()

  // returnObjects: true lets i18next return the array from the locale file
  const infoLinks    = t('footer.info.links',       { returnObjects: true }) as string[]
  const quickLinks   = t('footer.quickLinks.links', { returnObjects: true }) as string[]

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div>
            <span className="mb-4 block text-2xl font-bold tracking-tight text-gray-900">Tapo</span>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-orange-500 hover:text-orange-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {t('footer.contact.title')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
                <span>{t('footer.contact.address')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={16} className="text-orange-500" />
                <span>{t('footer.contact.phone')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={16} className="text-orange-500" />
                <span>support@tapo.vn</span>
              </li>
            </ul>
          </div>

          {/* Information column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {t('footer.info.title')}
            </h4>
            <ul className="space-y-2">
              {infoLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-orange-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links + newsletter column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {t('footer.quickLinks.title')}
            </h4>
            <ul className="mb-6 space-y-2">
              {quickLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-orange-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              {t('footer.newsletter.title')}
            </h4>
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400"
              />
              <button className="bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                {t('footer.newsletter.button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400">{t('footer.bottom.copyright')}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{t('footer.bottom.weAccept')}</span>
            <div className="flex gap-2">
              {['VISA', 'MC', 'VNPay', 'MoMo'].map((p) => (
                <span
                  key={p}
                  className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
