import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, CheckCircle2, Shield, KeyRound, Loader2 } from 'lucide-react'
import { FloatingInput } from '@/components/common/FloatingInput'

// ── Step types ────────────────────────────────────────────────────────────────

type Step = 'email' | 'sent'

// ── Main page ─────────────────────────────────────────────────────────────────

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    // Mock API delay
    await new Promise(r => setTimeout(r, 1500))
    setIsLoading(false)
    setStep('sent')
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
          {/* Decorative circles */}
          <div className="absolute left-6 top-8 h-16 w-16 rounded-full bg-white/20" />
          <div className="absolute bottom-16 right-8 h-10 w-10 rounded-full bg-amber-300/60" />
          <div className="absolute right-14 top-24 h-6 w-6 rounded-full bg-orange-300/70" />
          <div className="absolute bottom-28 left-16 h-8 w-8 rounded-full bg-white/15" />

          <div className="relative mb-8 flex flex-col items-center">
            <div className="relative mb-4 flex h-44 w-44 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
              <div className="absolute -left-4 -top-4 h-12 w-12 rounded-2xl bg-amber-300/60 backdrop-blur-sm" />
              <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-xl bg-orange-300/50" />
              <KeyRound size={72} className="text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Feature badges */}
          <div className="mb-6 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: Mail, text: t('auth.forgot.panelBadge1') },
              { icon: Shield, text: t('auth.forgot.panelBadge2') },
              { icon: CheckCircle2, text: t('auth.forgot.panelBadge3') },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                <Icon size={16} className="text-white shrink-0" />
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">{t('auth.forgot.panelHeading')}</h2>
            <p className="text-sm text-orange-100">{t('auth.forgot.panelSubtitle')}</p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex w-full flex-col justify-center px-10 py-14 lg:w-[480px] lg:flex-none">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
              <span className="text-lg font-black text-white">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Tapo</span>
          </div>

          {step === 'email' ? (
            <>
              {/* Heading */}
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/15">
                  <KeyRound size={22} className="text-orange-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgot.title')}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('auth.forgot.subtitle')}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingInput
                  id="forgot-email"
                  name="email"
                  type="email"
                  label={t('auth.forgot.emailLabel')}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  rightSlot={<Mail size={16} className="text-gray-400" />}
                />

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <><Loader2 size={16} className="animate-spin" /> {t('auth.forgot.sending')}</>
                    : t('auth.forgot.submitButton')
                  }
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgot.sentTitle')}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                {t('auth.forgot.sentDesc', { email })}
              </p>

              <div className="mt-6 w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 text-left">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('auth.forgot.nextSteps')}</p>
                <ul className="space-y-1.5">
                  {[
                    t('auth.forgot.step1'),
                    t('auth.forgot.step2'),
                    t('auth.forgot.step3'),
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white mt-0.5">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setStep('email')}
                className="mt-6 text-sm text-gray-500 hover:text-orange-500 transition-colors"
              >
                {t('auth.forgot.changeEmail')}
              </button>
            </div>
          )}

          {/* Back to login */}
          <Link
            to="/login"
            className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={14} />
            {t('auth.forgot.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export { ForgotPasswordPage }
