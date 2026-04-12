import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Star, CheckCircle2, XCircle, Clock,
  Package, MessageSquare, SendHorizonal, Pencil, Trash2,
  CheckSquare, ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { adminReviewApi, type AdminReviewDto, type ReviewStatus, type BulkReviewAction } from '@/lib/http/admin-review.api'
import { StatCard, AdminSearchInput, AdminTablePagination } from '@/features/admin/components/AdminShared'

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
  const { t } = useTranslation()
  const cfg = {
    PENDING:  { dot: 'bg-amber-500',   badge: 'bg-amber-50  dark:bg-amber-500/10  text-amber-600  dark:text-amber-400' },
    APPROVED: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    REJECTED: { dot: 'bg-red-500',     badge: 'bg-red-50    dark:bg-red-500/10    text-red-500    dark:text-red-400' },
  }[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {t(`adminReviews.status.${status}`)}
    </span>
  )
}

// ── Inline Reply Box ──────────────────────────────────────────────────────────
interface ReplyBoxProps {
  reviewId: string
  current: string | null
  onSaved: (updated: AdminReviewDto) => void
}

function ReplyBox({ reviewId, current, onSaved }: ReplyBoxProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(current ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setText(current ?? '') }, [current])

  async function handleSave() {
    if (!text.trim() && !current) return
    setSaving(true)
    const res = await adminReviewApi.reply(reviewId, text.trim())
    setSaving(false)
    if (res.success && res.data) {
      toast.success(text.trim() ? t('adminReviews.reply.saved') : t('adminReviews.reply.deleted'))
      onSaved(res.data)
      setEditing(false)
    } else {
      toast.error(res.error?.message ?? t('adminReviews.reply.saveFailed'))
    }
  }

  async function handleDelete() {
    setSaving(true)
    const res = await adminReviewApi.reply(reviewId, '')
    setSaving(false)
    if (res.success && res.data) {
      toast.success(t('adminReviews.reply.deleted'))
      setText('')
      onSaved(res.data)
      setEditing(false)
    }
  }

  if (current && !editing) {
    return (
      <div className="mt-2 rounded-xl border border-orange-100 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            <MessageSquare size={10} /> {t('adminReviews.reply.from')}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/10 transition cursor-pointer">
              <Pencil size={9} /> {t('adminReviews.reply.edit')}
            </button>
            <button onClick={handleDelete} disabled={saving} className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50 cursor-pointer">
              <Trash2 size={9} /> {t('adminReviews.reply.delete')}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{current}</p>
      </div>
    )
  }

  if (editing || !current) {
    return (
      <div className="mt-2">
        {!editing && !current && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-200 dark:border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-orange-300 hover:text-orange-500 transition w-full cursor-pointer"
          >
            <MessageSquare size={11} /> {t('adminReviews.reply.addPrompt')}
          </button>
        )}
        {editing && (
          <div className="rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/60 dark:bg-orange-500/5 p-2.5">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder={t('adminReviews.reply.placeholder')}
              className="w-full resize-none rounded-lg bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none transition"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{text.length}/2000</span>
              <div className="flex gap-1.5">
                <button onClick={() => { setEditing(false); setText(current ?? '') }} className="rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer">
                  {t('adminReviews.reply.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
                >
                  <SendHorizonal size={10} />
                  {saving ? t('adminReviews.reply.sending') : t('adminReviews.reply.send')}
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50 dark:border-white/5 animate-pulse">
          <div className="h-5 w-5 rounded-md bg-gray-100 dark:bg-white/5 shrink-0 mt-0.5" />
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-3 w-64 rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/5" />
          </div>
          <div className="flex gap-1.5 shrink-0">
            <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
            <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </>
  )
}

// ── Review Row ─────────────────────────────────────────────────────────────────
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
  const { t } = useTranslation()
  return (
    <div className={cn(
      'flex gap-4 px-5 py-4 border-b border-gray-50 dark:border-white/5 transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]',
      selected && 'bg-orange-50/40 dark:bg-orange-500/5',
    )}>
      {/* Checkbox */}
      <div className="shrink-0 mt-0.5">
        <button
          id={`select-review-${review.id}`}
          onClick={() => onToggle(review.id)}
          aria-label={selected ? t('adminReviews.action.clearSelect') : t('adminReviews.action.approve')}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all cursor-pointer',
            selected
              ? 'border-orange-500 bg-orange-500 text-white'
              : 'border-gray-300 dark:border-white/20 hover:border-orange-400',
          )}
        >
          {selected && <CheckSquare size={12} />}
        </button>
      </div>

      {/* Product thumbnail */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
        {review.productThumbnail ? (
          <img src={review.productThumbnail} alt={review.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={16} className="text-gray-300 dark:text-white/20" />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate mb-1.5">
          {review.productName}
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {review.userAvatar ? (
            <img src={review.userAvatar} alt={review.userName} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-[10px] font-bold text-orange-500">
              {review.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{review.userName}</span>
          <StarRow rating={review.rating} />
          <StatusBadge status={review.status} />
          <span className="text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        {review.comment && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
            {review.comment}
          </p>
        )}
        {review.images && review.images.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {review.images.map((img, i) => (
              <img key={i} src={img} alt="review" className="h-10 w-10 rounded-lg object-cover border border-gray-100 dark:border-white/10" />
            ))}
          </div>
        )}
        <ReplyBox reviewId={review.id} current={review.adminReply} onSaved={onUpdate} />
      </div>

      {/* Actions */}
      {review.status === 'PENDING' && (
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            id={`approve-${review.id}`}
            disabled={loading}
            onClick={() => onApprove(review.id)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-200/50"
          >
            <CheckCircle2 size={12} /> {t('adminReviews.action.approve')}
          </button>
          <button
            id={`reject-${review.id}`}
            disabled={loading}
            onClick={() => onReject(review.id)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition disabled:opacity-50 cursor-pointer"
          >
            <XCircle size={12} /> {t('adminReviews.action.reject')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Bulk Action Floating Bar ──────────────────────────────────────────────────
interface BulkBarProps { count: number; loading: boolean; onApprove: () => void; onReject: () => void; onClear: () => void }

function BulkBar({ count, loading, onApprove, onReject, onClear }: BulkBarProps) {
  const { t } = useTranslation()
  if (count === 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900 dark:bg-[#1a1c23] px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <ListChecks size={16} className="text-orange-400" />
          {t('adminReviews.action.selected', { count })}
        </span>
        <div className="h-4 w-px bg-white/20" />
        <button
          id="bulk-approve-btn"
          disabled={loading}
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition disabled:opacity-60 shadow-sm cursor-pointer"
        >
          <CheckCircle2 size={12} />
          {loading ? t('adminReviews.action.processing') : t('adminReviews.action.approveAll')}
        </button>
        <button
          id="bulk-reject-btn"
          disabled={loading}
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition disabled:opacity-60 cursor-pointer"
        >
          <XCircle size={12} /> {loading ? '...' : t('adminReviews.action.rejectAll')}
        </button>
        <button
          onClick={onClear}
          disabled={loading}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white hover:border-white/30 transition disabled:opacity-60 cursor-pointer"
        >
          {t('adminReviews.action.clearSelect')}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AdminReviewsPage() {
  const { t } = useTranslation()
  const [reviews,       setReviews]       = useState<AdminReviewDto[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab,     setActiveTab]     = useState<ReviewStatus | 'ALL'>('PENDING')
  const [ratingFilter,  setRatingFilter]  = useState<number | undefined>(undefined)
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(0)
  const [totalPages,    setTotalPages]    = useState(1)
  const [pendingCount,  setPendingCount]  = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set())

  const STATUS_TABS: Array<{ label: string; value: ReviewStatus | 'ALL' }> = [
    { label: t('adminReviews.tab.ALL'),      value: 'ALL' },
    { label: t('adminReviews.tab.PENDING'),  value: 'PENDING' },
    { label: t('adminReviews.tab.APPROVED'), value: 'APPROVED' },
    { label: t('adminReviews.tab.REJECTED'), value: 'REJECTED' },
  ]

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setSelectedIds(new Set())
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

  const loadStats = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminReviewApi.pendingCount(),
        adminReviewApi.listAll({ status: 'APPROVED', page: 0, size: 1 }),
        adminReviewApi.listAll({ status: 'REJECTED', page: 0, size: 1 }),
      ])
      if (pendingRes.success  && pendingRes.data)           setPendingCount(pendingRes.data.count)
      if (approvedRes.success && approvedRes.data?.totalElements !== undefined) setApprovedCount(approvedRes.data.totalElements)
      if (rejectedRes.success && rejectedRes.data?.totalElements !== undefined) setRejectedCount(rejectedRes.data.totalElements)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  // ── Selection ─────────────────────────────────────────────────────────────
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

  // ── Single actions ────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(true)
    const res = await adminReviewApi.approve(id)
    setActionLoading(false)
    if (res.success) {
      toast.success(t('adminReviews.toast.approved'))
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      loadStats()
    } else {
      toast.error(res.error?.message ?? t('adminReviews.toast.error'))
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(true)
    const res = await adminReviewApi.reject(id)
    setActionLoading(false)
    if (res.success) {
      toast.success(t('adminReviews.toast.rejected'))
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      loadStats()
    } else {
      toast.error(res.error?.message ?? t('adminReviews.toast.error'))
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
          ? t('adminReviews.toast.bulkApproved', { count: processed.size })
          : t('adminReviews.toast.bulkRejected', { count: processed.size })
      )
      setReviews(prev => prev.map(r => processed.has(r.id) ? { ...r, status: targetStatus as ReviewStatus } : r))
      setSelectedIds(new Set())
      loadStats()
    } else {
      toast.error(res.error?.message ?? t('adminReviews.toast.bulkFailed'))
    }
  }

  const handleUpdate = (updated: AdminReviewDto) => {
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  const filtered = reviews.filter(r =>
    !search ||
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedPendingCount = [...selectedIds].filter(id =>
    reviews.find(r => r.id === id)?.status === 'PENDING'
  ).length

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('adminReviews.title')}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Clock}        label={t('adminReviews.statPending')}  value={pendingCount}  color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label={t('adminReviews.statApproved')} value={approvedCount} color="bg-emerald-500" />
        <StatCard icon={XCircle}      label={t('adminReviews.statRejected')} value={rejectedCount} color="bg-red-500" />
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          {/* Status tabs */}
          <div className="flex gap-0.5 rounded-lg bg-gray-100 dark:bg-white/5 p-0.5 mr-auto">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                id={`tab-${tab.value.toLowerCase()}`}
                onClick={() => { setActiveTab(tab.value); setRatingFilter(undefined); setPage(0) }}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
                  activeTab === tab.value
                    ? 'bg-white dark:bg-[#21232d] text-orange-500 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                )}
              >
                {tab.label}
                {tab.value === 'PENDING' && pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('adminReviews.searchPh')}
          />
        </div>

        {/* Rating filter + select-all row */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
            {t('adminReviews.filterStars')}
          </span>
          <button
            id="rating-all"
            onClick={() => { setRatingFilter(undefined); setPage(0) }}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
              !ratingFilter
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500',
            )}
          >
            {t('adminReviews.ratingAll')}
          </button>
          {[5, 4, 3, 2, 1].map(r => (
            <button
              key={r}
              id={`rating-${r}`}
              onClick={() => { setRatingFilter(ratingFilter === r ? undefined : r); setPage(0) }}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                ratingFilter === r
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-amber-300 hover:text-amber-500',
              )}
            >
              <Star size={10} className={cn('transition-colors', ratingFilter === r ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-white/20')} />
              {t('adminReviews.ratingStar', { n: r })}
            </button>
          ))}

          {/* Select-all (PENDING tab only) */}
          {activeTab === 'PENDING' && filteredPending.length > 0 && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1" />
              <button
                id="toggle-all-reviews"
                onClick={toggleAll}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                  allPendingSelected
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-300 hover:text-orange-500',
                )}
              >
                <CheckSquare size={10} />
                {allPendingSelected
                  ? t('adminReviews.deselectAll')
                  : t('adminReviews.selectAll', { count: filteredPending.length })}
              </button>
            </>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <ReviewSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
              <Star size={24} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              {t('adminReviews.emptyTitle')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
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
      </div>

      {/* Floating bulk bar */}
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

