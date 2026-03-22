import { useState, useEffect } from 'react'

const THEME_KEY = 'admin_theme'

/** Manages dark/light mode for the admin panel by toggling the 'dark' class on <html> */
export function useAdminTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    // default: dark (matches the admin panel original feel)
    return saved !== null ? saved === 'dark' : true
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  function toggleTheme() {
    setIsDark((prev) => !prev)
  }

  return { isDark, toggleTheme }
}
