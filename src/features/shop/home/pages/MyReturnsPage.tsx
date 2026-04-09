/**
 * MyReturnsPage — Customer view of all their return requests.
 * Route: /orders/returns (PrivateRoute)
 * BE:    GET /api/orders/returns
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import {
  ChevronRight, RotateCcw, Package, Clock,
  CheckCircle2, XCircle, Loader2, AlertCircle,
} from 'lucide-react'
import { returnRequestApi, type ReturnRequestDto, type ReturnRequestStatus } from '@/lib/http/return-request.api'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReturnRequestStatus, {
  label: string; icon: React.ElementType
  color: string; bg: string; border: string
}> = {
  PENDING:  {
    label: 'Chờ xử lý', icon: Clock,
    color: 'text-amber-700 dark:text-amber-400',
    bg:    'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  APPROVED: {
    label: 'Đã duyệt', icon: CheckCircle2,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg:    'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  REJECTED: {
    label: 'Từ chối', icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg:    'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
  },
}

// ── ReturnStatusBadge ─────────────────────────────────────────────────────────

function ReturnStatusBadge({ status }: { status: ReturnRequestStatus }) {
  const { label, icon: Icon, color, bg } = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', color, bg)}>
      <Icon size={11} />
      {label}
    </span>
  )
}

// ── ReturnCard ────────────────────────────────────────────────────────────────

function ReturnCard({ item }: { item: ReturnRequestDto }) {
  const { border } = STATUS_CONFIG[item.status]
  const date = new Date(item.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl border bg-white dark:bg-[#21232d] transition-shadow hover:shadow-md dark:hover:shadow-black/20',
      border,
    )}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            YC #{item.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">Đơn: {item.orderCode}</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <ReturnStatusBadge status={item.status} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Lý do yêu cầu:</p>
          <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{item.reason}</p>
        </div>

        {item.evidenceImages && item.evidenceImages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Hình ảnh minh chứng:</p>
            <div className="flex gap-2 flex-wrap">
              {item.evidenceImages.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Minh chứng ${i + 1}`}
                    loading="lazy"
                    className="h-16 w-16 rounded-xl object-cover border border-gray-100 dark:border-white/10 hover:opacity-80 transition"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {item.staffNote && (
          <div className="rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 px-4 py-3">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Phản hồi từ shop:</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{item.staffNote}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-gray-100 dark:border-white/5 px-5 py-3">
        <Link
          to={`/orders/${item.orderId}`}
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Xem đơn hàng <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ── MyReturnsPage ─────────────────────────────────────────────────────────────

function MyReturnsPage() {
  const [items, setItems]     = useState<ReturnRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages]   = useState(1)

  const loadReturns = useCallback(async (page: number) => {
    setLoading(true)
    const res = await returnRequestApi.getMyReturns({ page, size: 10 })
    setLoading(false)
    if (res.success && res.data) {
      setItems(res.data.content)
      setTotalPages(res.data.totalPages)
    } else {
      setError('Không thể tải danh sách yêu cầu đổi trả')
    }
  }, [])

  useEffect(() => { loadReturns(currentPage) }, [loadReturns, currentPage])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
              <ChevronRight size={12} />
              <Link to="/orders" className="hover:text-orange-500">Đơn hàng</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">Yêu cầu đổi/trả</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title */}
          <div className="mb-6 flex items-center gap-3">
            <RotateCcw size={22} className="text-rose-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yêu cầu đổi/trả</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Theo dõi trạng thái các yêu cầu đổi trả của bạn
              </p>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={32} className="animate-spin text-orange-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <Package size={28} className="text-gray-300 dark:text-white/20" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Chưa có yêu cầu nào</p>
                <p className="mt-1 text-sm text-gray-400">Bạn chưa gửi yêu cầu đổi/trả hàng nào.</p>
              </div>
              <Link
                to="/orders"
                className="mt-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                Xem đơn hàng
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <ReturnCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-orange-300 hover:text-orange-500 transition-colors"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-500">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-orange-300 hover:text-orange-500 transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { MyReturnsPage }
