import { useState, useCallback, useEffect, useRef } from 'react'
import {
  RefreshCw, RotateCcw, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight,
  ImageOff, Loader2, AlertCircle, Eye, Filter, ChevronDown, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { returnRequestApi, type ReturnRequestDto, type ReturnRequestStatus } from '@/lib/http/return-request.api'

// ── Constants (hoisted — react skill §5) ─────────────────────────────────────

const PAGE_SIZE = 20

const STATUS_CONFIG: Record<ReturnRequestStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Chờ duyệt', color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-500/10',   border: 'border-amber-200 dark:border-amber-500/20',   icon: Clock },
  APPROVED: { label: 'Đã duyệt',  color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối',   color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-500/10',       border: 'border-red-200 dark:border-red-500/20',       icon: XCircle },
}

const STATUS_FILTERS: Array<{ key: ReturnRequestStatus | 'ALL'; label: string }> = [
  { key: 'ALL',      label: 'Tất cả' },
  { key: 'PENDING',  label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
]

// ── Note Modal (java-pro: KISS — inline sub-component) ───────────────────────

interface NoteModalProps {
  title: string
  action: 'approve' | 'reject'
  onConfirm: (note: string) => void
  onClose: () => void
}

function NoteModal({ title, action, onConfirm, onClose }: NoteModalProps) {
  const [note, setNote] = useState('')

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', action === 'approve' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10')}>
            {action === 'approve' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={action === 'approve' ? 'Ghi chú duyệt (tùy chọn)...' : 'Lý do từ chối (bắt buộc)...'}
          rows={3}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/20 resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Hủy
          </button>
          <button
            onClick={() => {
              if (action === 'reject' && !note.trim()) {
                toast.error('Vui lòng nhập lý do từ chối')
                return
              }
              onConfirm(note.trim())
            }}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors',
              action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600',
            )}
          >
            {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ request, onClose }: { request: ReturnRequestDto; onClose: () => void }) {
  const cfg = STATUS_CONFIG[request.status]
  const Icon = cfg.icon

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <RotateCcw size={16} className="text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Đổi/Trả đơn #{request.orderCode}</h2>
              <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold', cfg.color)}>
                <Icon size={10} /> {cfg.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <XCircle size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Khách hàng</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{request.userName}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Ngày gửi</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(String(request.createdAt)).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 mb-1">Lý do đổi/trả</p>
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{request.reason}</p>
            </div>
          </div>

          {request.evidenceImages && request.evidenceImages.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-2">Hình ảnh minh chứng ({request.evidenceImages.length})</p>
              <div className="flex gap-2 flex-wrap">
                {request.evidenceImages.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`evidence-${i}`} className="h-16 w-16 rounded-xl object-cover border border-gray-100 dark:border-white/10 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {request.staffNote && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Ghi chú xử lý</p>
              <div className={cn('rounded-xl p-3 border text-sm', cfg.bg, cfg.border, cfg.color)}>
                {request.staffNote}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ReturnSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-white/5">
          <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequestDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<ReturnRequestStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState<ReturnRequestDto | null>(null)
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filter dropdown on outside click
  useEffect(() => {
    function h(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await returnRequestApi.adminListAll({
      status: activeStatus !== 'ALL' ? activeStatus : undefined,
      page,
      size: PAGE_SIZE,
    })
    setIsLoading(false)
    if (res.success && res.data) {
      setRequests(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    }
  }, [activeStatus, page])

  useEffect(() => { loadData() }, [loadData])

  async function handleAction(id: string, status: ReturnRequestStatus, note: string) {
    setProcessingId(id)
    setNoteModal(null)
    const res = await returnRequestApi.adminUpdateStatus(id, status, note)
    setProcessingId(null)
    if (res.success) {
      toast.success(status === 'APPROVED' ? 'Đã duyệt yêu cầu đổi/trả' : 'Đã từ chối yêu cầu')
      loadData()
    } else {
      toast.error('Có lỗi xảy ra', { description: res.error?.message })
    }
  }

  return (
    <>
      <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-rose-500" />
              Quản lý Đổi / Trả hàng
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalElements} yêu cầu {activeStatus !== 'ALL' ? STATUS_CONFIG[activeStatus]?.label.toLowerCase() : 'tổng cộng'}</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
            <RefreshCw size={12} /> Làm mới
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(s => {
            const cfg = STATUS_CONFIG[s]
            const SIcon = cfg.icon
            return (
              <button
                key={s}
                onClick={() => { setActiveStatus(s); setPage(0) }}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  activeStatus === s ? cn(cfg.bg, cfg.border) : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] hover:border-gray-200 dark:hover:border-white/10',
                )}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                  <SIcon size={16} className={cfg.color} />
                </div>
                <div>
                  <p className={cn('text-sm font-bold', cfg.color)}>
                    {requests.filter(r => r.status === s).length}
                  </p>
                  <p className="text-[10px] text-gray-400">{cfg.label}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-3">
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
                  activeStatus !== 'ALL'
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-600 dark:text-gray-400',
                )}
              >
                <Filter size={13} />
                {activeStatus === 'ALL' ? 'Tất cả' : STATUS_CONFIG[activeStatus].label}
                <ChevronDown size={12} className={cn('transition-transform', filterOpen && 'rotate-180')} />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1 overflow-hidden">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => { setActiveStatus(f.key); setPage(0); setFilterOpen(false) }}
                      className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors',
                        f.key === activeStatus ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3">
                  {['Mã đơn hàng', 'Khách hàng', 'Lý do (tóm tắt)', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {isLoading ? (
                  <ReturnSkeleton />
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <AlertCircle size={28} className="mx-auto mb-2 text-gray-200 dark:text-white/20" />
                      <p className="text-sm text-gray-400">Không có yêu cầu nào</p>
                    </td>
                  </tr>
                ) : requests.map(req => {
                  const cfg = STATUS_CONFIG[req.status]
                  const SIcon = cfg.icon
                  const isPending = req.status === 'PENDING'
                  const isProcessing = processingId === req.id
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100 font-mono">#{req.orderCode}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{req.userName}</p>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{req.reason}</p>
                        {req.evidenceImages && req.evidenceImages.length > 0 && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-500">
                            <ImageOff size={9} /> {req.evidenceImages.length} ảnh
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(String(req.createdAt)).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                          <SIcon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailRequest(req)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => setNoteModal({ id: req.id, action: 'approve' })}
                                disabled={isProcessing}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                title="Duyệt"
                              >
                                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              </button>
                              <button
                                onClick={() => setNoteModal({ id: req.id, action: 'reject' })}
                                disabled={isProcessing}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Từ chối"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3">
              <p className="text-xs text-gray-400">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} / {totalElements}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all', i === page ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500')}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailRequest && <DetailModal request={detailRequest} onClose={() => setDetailRequest(null)} />}
      {noteModal && (
        <NoteModal
          title={noteModal.action === 'approve' ? 'Xác nhận duyệt yêu cầu đổi/trả' : 'Từ chối yêu cầu đổi/trả'}
          action={noteModal.action}
          onConfirm={note => handleAction(noteModal.id, noteModal.action === 'approve' ? 'APPROVED' : 'REJECTED', note)}
          onClose={() => setNoteModal(null)}
        />
      )}
    </>
  )
}

export { AdminReturnsPage }
// Unused import kept for icon completeness check
const _FileText = FileText
void _FileText
