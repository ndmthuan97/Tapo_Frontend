import { ShoppingCart, Search, User, Heart, Menu, X, Sun, Moon, ImageOff } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/context/auth-context'
import { UserAvatarMenu } from '@/components/common/UserAvatarMenu'
import { NotificationBell } from '@/components/common/NotificationBell'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useShopTheme } from '@/hooks/use-shop-theme'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import { productApi } from '@/lib/http/product.api'
import type { SuggestDto } from '@/lib/types/product/product.types'

// ── Search Autocomplete Dropdown ─────────────────────────────────────────────

interface SearchDropdownProps {
  results: SuggestDto[]
  query: string
  activeIndex: number
  onSelect: (item: SuggestDto) => void
  onViewAll: () => void
  isLoading: boolean
}

function SearchDropdown({ results, query, activeIndex, onSelect, onViewAll, isLoading }: SearchDropdownProps) {
  if (!query.trim()) return null
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {isLoading && results.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          Không tìm thấy &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1.5">
            {results.map((item, i) => (
              <li
                key={item.id}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={e => { e.preventDefault(); onSelect(item) }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                  i === activeIndex
                    ? 'bg-orange-50 dark:bg-orange-500/10'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5',
                )}
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                    : <ImageOff size={14} className="text-gray-400" />}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                  {item.price != null && (
                    <p className="text-xs font-semibold text-orange-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {/* View all link */}
          <div className="border-t border-gray-100 dark:border-white/5 px-4 py-2.5">
            <button
              onMouseDown={e => { e.preventDefault(); onViewAll() }}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Xem tất cả kết quả cho &ldquo;{query}&rdquo; →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestDto[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useShopTheme()
  const { totalCount: cartCount } = useCart()

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
    } else {
      setSuggestions([])
      setShowDropdown(false)
      setActiveIndex(-1)
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

  // Debounced autocomplete fetch — 300ms delay
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setSuggestLoading(false)
      return
    }
    setSuggestLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await productApi.getSuggestProducts(q.trim())
      setSuggestLoading(false)
      if (res.success && res.data) {
        setSuggestions(res.data)
        setShowDropdown(true)
      }
    }, 300)
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearchValue(val)
    setActiveIndex(-1)
    fetchSuggestions(val)
    if (!val.trim()) setShowDropdown(false)
  }

  function navigateToSearch(q: string) {
    if (!q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    setSearchOpen(false)
    setSearchValue('')
    setSuggestions([])
    setShowDropdown(false)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    // If an item is keyboard-selected, navigate to it
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelectItem(suggestions[activeIndex])
    } else {
      navigateToSearch(searchValue)
    }
  }

  function handleSelectItem(item: SuggestDto) {
    navigate(`/products/${item.slug}`)
    setSearchOpen(false)
    setSearchValue('')
    setSuggestions([])
    setShowDropdown(false)
  }

  // Keyboard navigation: ArrowUp / ArrowDown / Enter
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-white/5 bg-white/95 dark:bg-[#21232d]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1">
            <img src="/logo.png" alt="Tapo Store" className="h-10 w-10 object-contain drop-shadow-sm" />
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
              id="header-search-btn"
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
              <>
                <NotificationBell />
                <UserAvatarMenu />
              </>
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
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
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

      {/* ── Inline search bar with autocomplete ────────────────────────────────── */}
      <div className={cn(
        'border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] transition-all duration-200',
        searchOpen ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
      )}>
        <div className="relative mx-auto max-w-2xl px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              id="header-search-input"
              ref={searchInputRef}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder={t('products.searchPlaceholder')}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => { setSearchValue(''); setSuggestions([]); setShowDropdown(false) }}
                className="shrink-0 text-gray-400 hover:text-gray-600"
              >
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

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div id="search-suggestions">
              <SearchDropdown
                results={suggestions}
                query={searchValue}
                activeIndex={activeIndex}
                isLoading={suggestLoading}
                onSelect={handleSelectItem}
                onViewAll={() => navigateToSearch(searchValue)}
              />
            </div>
          )}
        </div>
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
