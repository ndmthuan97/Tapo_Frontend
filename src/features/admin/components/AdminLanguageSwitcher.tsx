import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt', flagSrc: 'https://flagcdn.com/w40/vn.png' },
  { code: 'en', label: 'English', flagSrc: 'https://flagcdn.com/w40/us.png' },
]

function FlagImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-4 w-6 rounded-sm object-cover shadow-sm"
      loading="lazy"
    />
  )
}

/** Admin-themed language switcher — dark by default, respects dark: variants */
function AdminLanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentCode = i18n.language.split('-')[0]
  const currentLang = LANGS.find((l) => l.code === currentCode) ?? LANGS[0]

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function switchTo(code: string) {
    void i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <FlagImg src={currentLang.flagSrc} alt={currentLang.label} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2d3a] py-1 shadow-xl z-50">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                'hover:bg-orange-50 dark:hover:bg-orange-500/10',
                currentCode === lang.code
                  ? 'font-semibold text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400',
              )}
            >
              <FlagImg src={lang.flagSrc} alt={lang.label} />
              {lang.label}
              {currentCode === lang.code && (
                <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { AdminLanguageSwitcher }
