import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Laptop, Zap, Shield, Headphones, MailWarning } from 'lucide-react'
import { FloatingInput } from '@/components/common/FloatingInput'
import { useAuth } from '@/features/shop/auth/hooks/use-auth'
import { emailVerificationApi } from '@/lib/http/email-verification.api'
import { toast } from 'sonner'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (unverifiedEmail) setUnverifiedEmail(null) // clear banner when user retypes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email: formData.email, password: formData.password })
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 4040) {
        setUnverifiedEmail(formData.email)
      }
    }
  }

  async function handleResendFromLogin() {
    if (!unverifiedEmail) return
    try {
      await emailVerificationApi.resend(unverifiedEmail)
      toast.success('Email xác thực đã được gửi!')
      navigate(`/verify-email-notice?email=${encodeURIComponent(unverifiedEmail)}`)
    } catch {
      toast.error('Không thể gửi lại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100 dark:from-[#1a1c23] dark:via-[#21232d] dark:to-[#1a1c23] p-4 transition-colors">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-32 left-1/4 h-40 w-40 rounded-full bg-orange-300/30 blur-2xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-[#21232d] shadow-2xl shadow-orange-200/40 dark:shadow-black/40 transition-colors">

        {/* ── Left illustration panel ── */}
        <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 p-12 lg:flex">
          <div className="absolute left-6 top-8 h-16 w-16 rounded-full bg-white/20" />
          <div className="absolute bottom-16 right-8 h-10 w-10 rounded-full bg-amber-300/60" />
          <div className="absolute right-14 top-24 h-6 w-6 rounded-full bg-orange-300/70" />
          <div className="absolute bottom-28 left-16 h-8 w-8 rounded-full bg-white/15" />

          <div className="relative mb-8 flex flex-col items-center">
            <div className="relative mb-4 flex h-44 w-44 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
              <div className="absolute -left-4 -top-4 h-12 w-12 rounded-2xl bg-amber-300/60 backdrop-blur-sm" />
              <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-xl bg-orange-300/50" />
              <Laptop size={72} className="text-white drop-shadow-lg" />
            </div>
            <div className="absolute -right-20 top-4 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-orange-600 shadow-lg">
              <Zap size={14} className="text-orange-500" /> {t('auth.loginPanel.fastDelivery')}
            </div>
            <div className="absolute -left-20 bottom-6 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-orange-600 shadow-lg">
              <Shield size={14} className="text-orange-500" /> {t('auth.loginPanel.warranty')}
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            {[Laptop, Zap, Shield, Headphones].map((Icon, i) => (
              <div key={i} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Icon size={18} className="text-white" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">{t('auth.loginPanel.heading')}</h2>
            <p className="text-sm text-orange-100">{t('auth.loginPanel.subtitle')}</p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex w-full flex-col justify-center px-10 py-14 lg:w-[480px] lg:flex-none">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
              <span className="text-lg font-black text-white">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Tapo</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.login.title')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('auth.login.subtitle')}</p>
          </div>

          {/* Email not verified banner */}
          {unverifiedEmail && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-4 py-3">
              <MailWarning size={16} className="shrink-0 text-amber-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Email chưa được xác thực</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Kiểm tra hộp thư hoặc{' '}
                  <button onClick={handleResendFromLogin} className="font-semibold underline hover:text-amber-700">
                    gửi lại email xác thực
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={() => {
              const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
              window.location.href = `${apiBase}/oauth2/authorize/google`
            }}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-shadow hover:shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            {t('auth.login.continueGoogle')}
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#21232d] px-3 text-xs text-gray-400">{t('auth.login.orSignInWith')}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              id="login-email"
              name="email"
              type="email"
              label={t('auth.login.emailLabel')}
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <FloatingInput
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.login.passwordLabel')}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-orange-500"
                />
                {t('auth.login.rememberMe')}
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.login.submitting') : t('auth.login.submitButton')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-600">
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export { LoginPage }
