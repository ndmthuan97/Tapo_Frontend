import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt', flagSrc: 'https://flagcdn.com/w40/vn.png' },
  { code: 'en', label: 'English',    flagSrc: 'https://flagcdn.com/w40/us.png' },
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

function LanguageSwitcher() {
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
      {/* Trigger: flag image only */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-center rounded-md w-8 h-8 transition-colors hover:bg-gray-100"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <FlagImg src={currentLang.flagSrc} alt={currentLang.label} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-xl z-50">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-orange-50',
                currentCode === lang.code
                  ? 'font-semibold text-orange-600'
                  : 'text-gray-700 hover:text-orange-600',
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

export { LanguageSwitcher }
