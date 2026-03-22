import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import vi from './locales/vi'
import en from './locales/en'

const SUPPORTED_LANGS = ['vi', 'en']
const stored = localStorage.getItem('lang')
// Only use stored value if it's actually a supported language code
const savedLang = stored && SUPPORTED_LANGS.includes(stored) ? stored : 'vi'

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'vi',
  // Force synchronous init when using inline resources — prevents the race condition
  // where React renders before i18n has set the correct language
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
