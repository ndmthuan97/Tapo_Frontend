/**
 * VouchersPage — Public page listing active vouchers for customers.
 *
 * UI/UX: glassmorphism cards, copy-to-clipboard, expiry countdown badge.
 * Route: /vouchers (no auth required)
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChevronRight, Tag, Copy, Check, Clock, Loader2, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { httpClient } from '@/lib/http/http-client'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

interface VoucherDto {
  id: string
  code: string
  name: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minimumOrderValue: number
  usageLimit: number | null
  usageCount: number
  startDate: string
  endDate: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDiscount(v: VoucherDto): string {
  if (v.discountType === 'PERCENTAGE') {
    return `Giảm ${v.discountValue}%`
  }
  return `Giảm ${v.discountValue.toLocaleString('vi-VN')}₫`
}

function getDaysLeft(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
}

function formatMinOrder(value: number): string {
  if (value === 0) return 'Không giới hạn'
  return `Đơn tối thiểu ${value.toLocaleString('vi-VN')}₫`
}

// ── VoucherCard ───────────────────────────────────────────────────────────────

function VoucherCard({ voucher }: { voucher: VoucherDto }) {
  const [copied, setCopied] = useState(false)
  const daysLeft = getDaysLeft(voucher.endDate)
  const isExpiringSoon = daysLeft <= 3

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(voucher.code)
      setCopied(true)
      toast.success(`Đã sao chép mã "${voucher.code}"`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Không thể sao chép')
    }
  }

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border transition-all duration-200',
      'bg-white dark:bg-[#21232d]',
      isExpiringSoon
        ? 'border-orange-200 dark:border-orange-500/30 shadow-orange-100/50 dark:shadow-orange-900/20 shadow-md'
        : 'border-gray-100 dark:border-white/8 hover:border-orange-200 dark:hover:border-orange-500/20 hover:shadow-md',
    )}>
      {/* Color bar top */}
      <div className={cn(
        'h-1.5 w-full',
        isExpiringSoon ? 'bg-orange-500' : 'bg-gradient-to-r from-orange-400 to-orange-500',
      )} />

      <div className="p-5">
        {/* Tags row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Tag size={10} />
            {voucher.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm tiền'}
          </span>
          {isExpiringSoon && (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
              <Clock size={10} />
              Còn {daysLeft} ngày
            </span>
          )}
        </div>

        {/* Discount value */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatDiscount(voucher)}
        </h3>
        {voucher.maxDiscountAmount && voucher.discountType === 'PERCENTAGE' && (
          <p className="text-xs text-gray-400 mt-0.5">
            Tối đa {voucher.maxDiscountAmount.toLocaleString('vi-VN')}₫
          </p>
        )}

        {/* Name */}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-snug">
          {voucher.name}
        </p>

        {/* Conditions */}
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {formatMinOrder(voucher.minimumOrderValue)}
          {voucher.usageLimit && (
            <> • Còn {voucher.usageLimit - voucher.usageCount} lượt</>
          )}
        </p>

        {/* Divider dashed */}
        <div className="my-4 border-t border-dashed border-gray-200 dark:border-white/10" />

        {/* Code copy row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-500/5 px-3 py-2">
            <span className="font-mono text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400">
              {voucher.code}
            </span>
          </div>
          <button
            id={`copy-voucher-${voucher.id}`}
            onClick={handleCopy}
            aria-label={`Sao chép mã ${voucher.code}`}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
              copied
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95',
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Đã copy' : 'Copy'}
          </button>
        </div>

        {/* Expiry */}
        <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
          HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  )
}

// ── VouchersPage ──────────────────────────────────────────────────────────────

function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    httpClient.get<{ data: { content: VoucherDto[] } }>('/api/vouchers/active?size=24')
      .then(res => {
        if (!cancelled) setVouchers(res.data.data?.content ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải danh sách voucher')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">Mã giảm giá</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Page title */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                <Ticket size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mã giảm giá</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sao chép mã và dán vào ô voucher khi thanh toán
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={32} className="animate-spin text-orange-400" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <Ticket size={48} className="text-gray-300 dark:text-gray-600" />
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-300">Chưa có voucher nào</p>
                <p className="mt-1 text-sm text-gray-400">Quay lại sau để xem các ưu đãi mới nhé!</p>
              </div>
              <Link
                to="/products"
                className="mt-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { VouchersPage }
