import { ShoppingCart, Search, User, Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/context/auth-context'
import { UserAvatarMenu } from '@/components/common/UserAvatarMenu'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuthContext()
  const { t } = useTranslation()

  const NAV_LINKS = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.shop'), href: '/products' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.contact'), href: '#' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Tapo
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Search size={20} />
            </button>
            <button
              aria-label="Wishlist"
              className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex"
            >
              <Heart size={20} />
            </button>

            {/* Avatar or Login link */}
            <LanguageSwitcher />
            {user ? (
              <UserAvatarMenu />
            ) : (
              <Link
                to="/login"
                aria-label="Account"
                className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <User size={20} />
              </Link>
            )}
            <button
              aria-label="Cart"
              className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ShoppingCart size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                0
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              aria-label="Toggle menu"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-gray-100 bg-white transition-all duration-200 ease-in-out md:hidden',
          mobileMenuOpen ? 'max-h-60' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export { Header }
