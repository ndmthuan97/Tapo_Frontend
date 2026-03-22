import { useState, useEffect } from 'react'

const SHOP_THEME_KEY = 'shop_theme'

/** Manages dark/light mode for the shop by toggling the 'dark' class on <html> */
export function useShopTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // default: light for shop
    const saved = localStorage.getItem(SHOP_THEME_KEY)
    return saved === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(SHOP_THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  function toggleTheme() {
    setIsDark((prev) => !prev)
  }

  return { isDark, toggleTheme }
}
