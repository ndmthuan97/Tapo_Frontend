import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { emailVerificationApi } from '@/lib/http/email-verification.api'

const RESEND_COOLDOWN = 60 // seconds

interface Props {
  email?: string
}

export function VerifyEmailNoticePage({ email }: Props) {
  // Read email from URL search params if not passed as prop
  const searchEmail = new URLSearchParams(window.location.search).get('email') ?? ''
  const displayEmail = email ?? searchEmail

  const navigate = useNavigate()
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [isSending, setIsSending] = useState(false)
  const [resentCount, setResentCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startCooldown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (!displayEmail || cooldown > 0 || isSending) return
    setIsSending(true)
    try {
      await emailVerificationApi.resend(displayEmail)
      setResentCount(c => c + 1)
      toast.success('Email xác thực đã được gửi lại!')
      startCooldown()
    } catch {
      toast.error('Không thể gửi lại. Vui lòng thử lại sau.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#18191f] dark:via-[#191b22] dark:to-[#1e1f2a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-xl shadow-orange-100/30 dark:shadow-none p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10">
            <Mail size={36} className="text-orange-500" />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
            Kiểm tra hộp thư!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Chúng tôi đã gửi link xác thực đến
          </p>
          {displayEmail && (
            <p className="mt-1 text-sm font-semibold text-orange-500 break-all">{displayEmail}</p>
          )}
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            Click vào link trong email để kích hoạt tài khoản.<br />
            Link có hiệu lực trong <strong>24 giờ</strong>.
          </p>

          {/* Divider */}
          <div className="my-6 border-t border-gray-100 dark:border-white/5" />

          {/* Resend */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Không nhận được email?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isSending}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw size={14} className={isSending ? 'animate-spin' : ''} />
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại email'}
            </button>
            {resentCount > 0 && (
              <p className="text-xs text-emerald-500 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} />
                Đã gửi lại {resentCount} lần — kiểm tra cả thư mục Spam nhé!
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-4 text-left">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">💡 Mẹo nếu không nhận được email:</p>
            <ul className="space-y-1 text-xs text-amber-600 dark:text-amber-500">
              <li>• Kiểm tra thư mục <strong>Spam / Junk</strong></li>
              <li>• Đảm bảo email nhập đúng chính tả</li>
              <li>• Có thể mất 1–2 phút để nhận</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={12} />
            Quay lại đăng nhập
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Đã xác thực?{' '}
          <Link to="/login" className="font-medium text-orange-500 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
