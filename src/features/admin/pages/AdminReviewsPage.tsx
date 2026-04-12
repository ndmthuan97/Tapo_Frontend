import { useState, useEffect, useCallback } from 'react'
import {
  Star, CheckCircle2, XCircle, Clock,
  Package, MessageSquare, SendHorizonal, Pencil, Trash2,
  CheckSquare, ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { adminReviewApi, type AdminReviewDto, type ReviewStatus, type BulkReviewAction } from '@/lib/http/admin-review.api'
import { AdminSearchInput, AdminTablePagination } from '@/features/admin/components/AdminShared'

// ── Star display ──────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={11}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-white/10'}
        />
      ))}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReviewStatus }) {
  const cfg = {
    PENDING:  { label: 'Chờ duyệt', color: 'bg-amber-50  dark:bg-amber-500/10 text-amber-600  dark:text-amber-400  border-amber-200 dark:border-amber-500/20' },
    APPROVED: { label: 'Đã duyệt',  color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    REJECTED: { label: 'Từ chối',   color: 'bg-red-50    dark:bg-red-500/10 text-red-500    dark:text-red-400    border-red-200   dark:border-red-500/20' },
  }[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', cfg.color)}>
      {status === 'PENDING' ? <Clock size={10} /> : status === 'APPROVED' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {cfg.label}
    </span>
  )
}

// ── Inline Reply Box ──────────────────────────────────────────────────────────
// §1: Single responsibility — handles only reply state + submit

interface ReplyBoxProps {
  reviewId: string
  current: string | null
  onSaved: (updated: AdminReviewDto) => void
}

function ReplyBox({ reviewId, current, onSaved }: ReplyBoxProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(current ?? '')
  const [saving, setSaving] = useState(false)

  // Sync if parent updates (e.g. after approve/reject returns updated dto)
  useEffect(() => { setText(current ?? '') }, [current])

  async function handleSave() {
    if (!text.trim() && !current) return   // nothing to save
    setSaving(true)
    const res = await adminReviewApi.reply(reviewId, text.trim())
    setSaving(false)
    if (res.success && res.data) {
      toast.success(text.trim() ? 'Đã lưu phản hồi' : 'Đã xóa phản hồi')
      onSaved(res.data)
      setEditing(false)
    } else {
      toast.error(res.error?.message ?? 'Lưu phản hồi thất bại')
    }
  }

  async function handleDelete() {
    setSaving(true)
    const res = await adminReviewApi.reply(reviewId, '')
    setSaving(false)
    if (res.success && res.data) {
      toast.success('Đã xóa phản hồi')
      setText('')
      onSaved(res.data)
      setEditing(false)
    }
  }

  // ── Show existing reply (read mode) ────────────────────────────────────────
  if (current && !editing) {
    return (
      <div className="mt-3 rounded-xl border border-orange-100 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 px-4 py-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            <MessageSquare size={11} /> Phản hồi từ Shop
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/10 transition"
            >
              <Pencil size={10} /> Sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50"
            >
              <Trash2 size={10} /> Xóa
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{current}</p>
      </div>
    )
  }

  // ── Editor mode ────────────────────────────────────────────────────────────
  if (editing || !current) {
    return (
      <div className="mt-3">
        {!editing && !current && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 px-4 py-2.5 text-xs text-gray-400 hover:border-orange-300 hover:text-orange-500 dark:hover:border-orange-500/30 dark:hover:text-orange-400 transition w-full"
          >
            <MessageSquare size={12} /> Thêm phản hồi từ Shop...
          </button>
        )}
        {editing && (
          <div className="rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/60 dark:bg-orange-500/5 p-3">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Nhập phản hồi của Shop..."
              className="w-full resize-none rounded-lg bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{text.length}/2000</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setText(current ?? '') }}
                  className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition shadow-sm shadow-orange-200/50"
                >
                  <SendHorizonal size={12} />
                  {saving ? 'Đang lưu...' : 'Gửi phản hồi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

// ── Review row ────────────────────────────────────────────────────────────────

interface ReviewRowProps {
  review: AdminReviewDto
  selected: boolean
  onToggle: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onUpdate: (updated: AdminReviewDto) => void
  loading: boolean
}

function ReviewRow({ review, selected, onToggle, onApprove, onReject, onUpdate, loading }: ReviewRowProps) {
  return (
    <div className={cn(
      'rounded-2xl border bg-white dark:bg-[#21232d] p-5 hover:shadow-md transition-all duration-150',
      selected
        ? 'border-orange-300 dark:border-orange-500/40 ring-1 ring-orange-300/30 dark:ring-orange-500/20'
        : 'border-gray-100 dark:border-white/5',
    )}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Checkbox */}
        <div className="flex items-center pt-0.5 sm:pt-1">
          <button
            id={`select-review-${review.id}`}
            onClick={() => onToggle(review.id)}
            aria-label={selected ? 'Bỏ chọn' : 'Chọn'}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 shrink-0',
              selected
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-gray-300 dark:border-white/20 hover:border-orange-400'
            )}
          >
            {selected && <CheckSquare size={12} />}
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 sm:w-52 shrink-0">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
            {review.productThumbnail ? (
              <img src={review.productThumbnail} alt={review.productName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package size={16} className="text-gray-300 dark:text-white/20" />
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{review.productName}</p>
        </div>

        {/* Review content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Avatar + name */}
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-xs font-bold text-orange-500">
                {review.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{review.userName}</span>
            <StarRow rating={review.rating} />
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
            <StatusBadge status={review.status} />
          </div>

          {review.comment && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{review.comment}</p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {review.images.map((img, i) => (
                <img key={i} src={img} alt="review" className="h-12 w-12 rounded-lg object-cover border border-gray-100 dark:border-white/10" />
              ))}
            </div>
          )}

          {/* Inline reply box — §1: extracted as separate component */}
          <ReplyBox
            reviewId={review.id}
            current={review.adminReply}
            onSaved={onUpdate}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
          {review.status === 'PENDING' && (
            <>
              <button
                id={`approve-${review.id}`}
                disabled={loading}
                onClick={() => onApprove(review.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-200/50"
              >
                <CheckCircle2 size={13} /> Duyệt
              </button>
              <button
                id={`reject-${review.id}`}
                disabled={loading}
                onClick={() => onReject(review.id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <XCircle size={13} /> Từ chối
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Bulk Action Floating Bar ───────────────────────────────────────────────────
// §1: Extracted component, §6: animate-in per ui-ux-pro-max

interface BulkBarProps {
  count: number
  loading: boolean
  onApprove: () => void
  onReject: () => void
  onClear: () => void
}

function BulkBar({ count, loading, onApprove, onReject, onClear }: BulkBarProps) {
  if (count === 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900 dark:bg-[#1a1c23] px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <ListChecks size={16} className="text-orange-400" />
          {count} đã chọn
        </span>
        <div className="h-4 w-px bg-white/20" />
        <button
          id="bulk-approve-btn"
          disabled={loading}
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition disabled:opacity-60 shadow-sm shadow-emerald-500/30"
        >
          <CheckCircle2 size={13} />
          {loading ? 'Đang xử lý...' : 'Duyệt tất cả'}
        </button>
        <button
          id="bulk-reject-btn"
          disabled={loading}
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition disabled:opacity-60 shadow-sm shadow-red-500/30"
        >
          <XCircle size={13} />
          {loading ? 'Đang xử lý...' : 'Từ chối tất cả'}
        </button>
        <button
          onClick={onClear}
          disabled={loading}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white hover:border-white/30 transition disabled:opacity-60"
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: ReviewStatus | 'ALL' }> = [
  { label: 'Tất cả',    value: 'ALL' },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đã duyệt',  value: 'APPROVED' },
  { label: 'Từ chối',   value: 'REJECTED' },
]

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ReviewStatus | 'ALL'>('PENDING')
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pendingCount, setPendingCount] = useState(0)

  // ── Bulk selection state (§1: local, co-located with handlers) ────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setSelectedIds(new Set())   // clear selection on page change
    const res = await adminReviewApi.listAll({
      status: activeTab === 'ALL' ? undefined : activeTab,
      rating: ratingFilter,
      page,
      size: 15,
    })
    setIsLoading(false)
    if (res.success && res.data) {
      setReviews(res.data.content)
      setTotalPages(res.data.totalPages)
    }
  }, [activeTab, ratingFilter, page])

  useEffect(() => { loadReviews() }, [loadReviews])

  // Load pending badge count once
  useEffect(() => {
    adminReviewApi.pendingCount().then(res => {
      if (res.success && res.data) setPendingCount(res.data.count)
    })
  }, [reviews]) // re-count after any action

  // ── Row selection handlers ────────────────────────────────────────────────
  const toggleRow = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filteredPending = reviews.filter(r =>
    r.status === 'PENDING' &&
    (!search ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()))
  )

  const allPendingSelected = filteredPending.length > 0 &&
    filteredPending.every(r => selectedIds.has(r.id))

  const toggleAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPending.map(r => r.id)))
    }
  }

  // ── Single-row actions ────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(true)
    const res = await adminReviewApi.approve(id)
    setActionLoading(false)
    if (res.success) {
      toast.success('Đã duyệt đánh giá')
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    } else {
      toast.error(res.error?.message ?? 'Có lỗi xảy ra')
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(true)
    const res = await adminReviewApi.reject(id)
    setActionLoading(false)
    if (res.success) {
      toast.success('Đã từ chối đánh giá')
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    } else {
      toast.error(res.error?.message ?? 'Có lỗi xảy ra')
    }
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulk = async (action: BulkReviewAction) => {
    if (selectedIds.size === 0) return
    setActionLoading(true)
    const res = await adminReviewApi.bulkAction([...selectedIds], action)
    setActionLoading(false)
    if (res.success && res.data) {
      const processed = new Set(res.data)
      const targetStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      toast.success(
        action === 'APPROVE'
          ? `Đã duyệt ${processed.size} đánh giá`
          : `Đã từ chối ${processed.size} đánh giá`
      )
      setReviews(prev =>
        prev.map(r => processed.has(r.id) ? { ...r, status: targetStatus } : r)
      )
      setSelectedIds(new Set())
    } else {
      toast.error(res.error?.message ?? 'Xử lý hàng loạt thất bại')
    }
  }

  // §4: Optimistic local update after reply saved
  const handleUpdate = (updated: AdminReviewDto) => {
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  // Client-side search filter
  const filtered = reviews.filter(r =>
    !search ||
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase()),
  )

  // Only PENDING reviews can be bulk-acted on
  const selectedPendingCount = [...selectedIds].filter(id =>
    reviews.find(r => r.id === id)?.status === 'PENDING'
  ).length

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý Đánh giá</h1>
          {pendingCount > 0 && (
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              {pendingCount} đánh giá đang chờ duyệt
            </p>
          )}
        </div>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, sản phẩm, nội dung..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 rounded-xl bg-gray-100 dark:bg-white/5 p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            id={`tab-${tab.value.toLowerCase()}`}
            onClick={() => { setActiveTab(tab.value); setRatingFilter(undefined); setPage(0) }}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150',
              activeTab === tab.value
                ? 'bg-white dark:bg-[#21232d] text-orange-500 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            )}
          >
            {tab.label}
            {tab.value === 'PENDING' && pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Rating filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">Lọc sao:</span>
        <button
          id="rating-all"
          onClick={() => { setRatingFilter(undefined); setPage(0) }}
          className={cn(
            'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150',
            !ratingFilter
              ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm'
              : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-orange-300 dark:hover:border-orange-500/30 hover:text-orange-500',
          )}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map(r => (
          <button
            key={r}
            id={`rating-${r}`}
            onClick={() => { setRatingFilter(ratingFilter === r ? undefined : r); setPage(0) }}
            className={cn(
              'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150',
              ratingFilter === r
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-500/30 hover:text-amber-500',
            )}
          >
            <Star size={11} className={cn('transition-colors', ratingFilter === r ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-white/20 dark:text-white/20')} />
            {r} sao
          </button>
        ))}

        {/* Toggle-all (chỉ hiện khi tab PENDING) */}
        {activeTab === 'PENDING' && filteredPending.length > 0 && (
          <>
            <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            <button
              id="toggle-all-reviews"
              onClick={toggleAll}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                allPendingSelected
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-300 hover:text-orange-500',
              )}
            >
              <CheckSquare size={11} />
              {allPendingSelected ? 'Bỏ chọn tất cả' : `Chọn ${filteredPending.length} chờ duyệt`}
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <ReviewSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
            <Star size={24} className="text-gray-300 dark:text-white/20" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Không có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <ReviewRow
              key={review.id}
              review={review}
              selected={selectedIds.has(review.id)}
              onToggle={toggleRow}
              onApprove={handleApprove}
              onReject={handleReject}
              onUpdate={handleUpdate}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <AdminTablePagination
        page={page + 1}
        totalPages={totalPages}
        onPageChange={p => setPage(p - 1)}
      />

      {/* Floating bulk action bar — §6 animate-in (ui-ux-pro-max) */}
      <BulkBar
        count={selectedPendingCount}
        loading={actionLoading}
        onApprove={() => handleBulk('APPROVE')}
        onReject={() => handleBulk('REJECT')}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  )
}

export { AdminReviewsPage }
