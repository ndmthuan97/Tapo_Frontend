import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import { emailVerificationApi } from '@/lib/http/email-verification.api'
import { toast } from 'sonner'

type State = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const hasCalled = useRef(false)

  useEffect(() => {
    if (!token) {
      setState('error')
      setErrorMsg('Link xác thực không hợp lệ.')
      return
    }
    if (hasCalled.current) return
    hasCalled.current = true

    emailVerificationApi.verify(token)
      .then(() => setState('success'))
      .catch((err) => {
        setState('error')
        setErrorMsg(err?.message ?? 'Link xác thực không hợp lệ hoặc đã hết hạn.')
      })
  }, [token])

  async function handleResend() {
    if (!resendEmail.trim()) return
    setIsSending(true)
    try {
      await emailVerificationApi.resend(resendEmail.trim())
      toast.success('Email xác thực mới đã được gửi!')
    } catch {
      toast.error('Không thể gửi. Vui lòng kiểm tra địa chỉ email.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#18191f] dark:via-[#191b22] dark:to-[#1e1f2a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-xl shadow-orange-100/30 dark:shadow-none p-8 text-center">

          {/* Loading */}
          {state === 'loading' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10">
                <Loader2 size={36} className="text-orange-500 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Đang xác thực...</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Xác thực thành công! 🎉
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Tài khoản của bạn đã được kích hoạt.<br />
                Bạn có thể đăng nhập và mua sắm ngay bây giờ.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-200/50 hover:bg-orange-600 transition-all"
              >
                Đăng nhập ngay
              </Link>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <XCircle size={36} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Link đã hết hạn
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                {errorMsg || 'Link xác thực không hợp lệ hoặc đã hết hạn (sau 24 giờ).'}
              </p>

              {/* Resend form */}
              <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 text-left">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <Mail size={13} /> Gửi lại email xác thực
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Nhập email đăng ký"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/20"
                    onKeyDown={e => e.key === 'Enter' && handleResend()}
                  />
                  <button
                    onClick={handleResend}
                    disabled={isSending || !resendEmail.trim()}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? <Loader2 size={12} className="animate-spin" /> : 'Gửi'}
                  </button>
                </div>
              </div>

              <Link
                to="/login"
                className="mt-4 inline-block text-xs text-gray-400 hover:text-orange-500 transition-colors"
              >
                ← Quay lại đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
