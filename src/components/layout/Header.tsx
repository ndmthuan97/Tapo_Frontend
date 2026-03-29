import { ShoppingCart, Search, User, Heart, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/context/auth-context'
import { UserAvatarMenu } from '@/components/common/UserAvatarMenu'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useShopTheme } from '@/hooks/use-shop-theme'

// Mock cart/wishlist badge counts — replace with real context later
const CART_COUNT = 3
const WISH_COUNT = 4

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useShopTheme()

  const NAV_LINKS = [
    { label: t('nav.home'),    href: '/' },
    { label: t('nav.shop'),    href: '/products' },
    { label: t('nav.blog'),    href: '/blog' },
    { label: t('nav.contact'), href: '#' },
  ]

  // Focus search input when panel opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchValue('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-white/5 bg-white/95 dark:bg-[#21232d]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tapo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(s => !s)}
              className={cn(
                'rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors',
                searchOpen
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
                  : 'hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white sm:flex"
            >
              <Heart size={20} />
              {WISH_COUNT > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {WISH_COUNT}
                </span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light' : 'Switch to dark'}
              className="rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language */}
            <LanguageSwitcher />

            {/* User */}
            {user ? (
              <UserAvatarMenu />
            ) : (
              <Link
                to="/login"
                aria-label="Account"
                className="hidden rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white sm:flex"
              >
                <User size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
            >
              <ShoppingCart size={20} />
              {CART_COUNT > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {CART_COUNT}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              aria-label="Toggle menu"
              className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Inline search bar (slides in below header) ─────────────────────────── */}
      <div className={cn(
        'overflow-hidden border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-all duration-200',
        searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0',
      )}>
        <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            ref={searchInputRef}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
          />
          {searchValue && (
            <button type="button" onClick={() => setSearchValue('')} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            disabled={!searchValue.trim()}
            className="shrink-0 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {t('search.pageTitle')}
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'overflow-hidden border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-all duration-200 ease-in-out md:hidden',
        mobileMenuOpen ? 'max-h-72' : 'max-h-0',
      )}>
        <nav className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="py-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white border-b border-gray-50 dark:border-white/5 last:border-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/wishlist" className="py-3 text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Heart size={15} /> {t('wishlist.pageTitle')}
          </Link>
          <Link to="/cart" className="py-3 text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={15} /> {t('cart.pageTitle')}
          </Link>
        </nav>
      </div>
    </header>
  )
}

export { Header }
