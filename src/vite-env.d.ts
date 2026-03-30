/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API
  readonly VITE_API_BASE_URL: string

  // Supabase Storage
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_AVATAR_BUCKET: string
  readonly VITE_SUPABASE_PRODUCT_BUCKET: string

  // EmailJS (ContactPage) — optional, undefined when not configured
  readonly VITE_EMAILJS_SERVICE_ID?: string
  readonly VITE_EMAILJS_TEMPLATE_ID?: string
  readonly VITE_EMAILJS_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
