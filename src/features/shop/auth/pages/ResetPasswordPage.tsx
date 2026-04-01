import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react'
import { FloatingInput } from '@/components/common/FloatingInput'
import { authApi } from '@/lib/http/auth.api'

// ── Step types ────────────────────────────────────────────────────────────────

type Step = 'form' | 'success' | 'invalid'

// ── Main page ─────────────────────────────────────────────────────────────────

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>('form')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // If no token in URL → go to invalid immediately
  useEffect(() => {
    if (!token) setStep('invalid')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsLoading(true)
    const result = await authApi.resetPassword(token, newPassword)
    setIsLoading(false)

    if (result.success) {
      setStep('success')
    } else {
      const code = result.error?.statusCode
      if (code === 4042 || code === 4043) {
        setStep('invalid')
      } else {
        setError(result.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
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
              <KeyRound size={72} className="text-white drop-shadow-lg" />
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: Shield, text: 'Mật khẩu được mã hóa an toàn' },
              { icon: KeyRound, text: 'Link chỉ dùng một lần duy nhất' },
              { icon: CheckCircle2, text: 'Có hiệu lực trong vòng 1 giờ' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                <Icon size={16} className="text-white shrink-0" />
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">Bảo mật tài khoản</h2>
            <p className="text-sm text-orange-100">Tạo mật khẩu mới mạnh và an toàn</p>
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

          {/* ── Step: invalid token ── */}
          {step === 'invalid' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Link đã hết hạn</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                Link đặt lại mật khẩu này không hợp lệ hoặc đã hết hạn (có hiệu lực 1 giờ).
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
              >
                Yêu cầu link mới
              </Link>
              <Link
                to="/login"
                className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft size={14} />
                Quay lại đăng nhập
              </Link>
            </div>
          )}

          {/* ── Step: success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đặt lại thành công!</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full max-w-xs rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* ── Step: form ── */}
          {step === 'form' && (
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/15">
                  <KeyRound size={22} className="text-orange-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đặt lại mật khẩu</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingInput
                  id="reset-new-password"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  label="Mật khẩu mới"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowNew(p => !p)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Toggle password visibility"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                <FloatingInput
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  label="Xác nhận mật khẩu mới"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                <p className="text-xs text-gray-400">Mật khẩu phải có ít nhất 6 ký tự.</p>

                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                    : 'Đặt lại mật khẩu'
                  }
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          {step === 'form' && (
            <Link
              to="/login"
              className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export { ResetPasswordPage }
