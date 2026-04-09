import { useState, useCallback, useEffect, useRef } from 'react'
import {
  RefreshCw, RotateCcw, CheckCircle2, XCircle, Clock,
  ImageOff, Loader2, AlertCircle, Eye, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { returnRequestApi, type ReturnRequestDto, type ReturnRequestStatus } from '@/lib/http/return-request.api'
import { StatCard, AdminSearchInput, AdminFilterSelect, AdminTablePagination } from '@/features/admin/components/AdminShared'
import * as XLSX from 'xlsx'

// ── Excel Export helper ───────────────────────────────────────────────────────

function exportReturnsToExcel(requests: ReturnRequestDto[]) {
  const rows = requests.map(r => ({
    'Mã đơn hàng': r.orderCode ?? '',
    'Khách hàng':  r.userName  ?? '',
    'Lý do':       r.reason    ?? '',
    'Trạng thái':  r.status    ?? '',
    'Ghi chú':     r.staffNote ?? '',
    'Ngày gửi':    new Date(String(r.createdAt)).toLocaleString('vi-VN'),
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 40 }, { wch: 12 }, { wch: 30 }, { wch: 20 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Đổi trả')
  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `tapo-returns-${date}.xlsx`)
  toast.success('Đã xuất file Excel Đổi/Trả')
}


const PAGE_SIZE = 20

const STATUS_CONFIG: Record<ReturnRequestStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Chờ duyệt', color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-50 dark:bg-amber-500/10',    border: 'border-amber-200 dark:border-amber-500/20',    icon: Clock       },
  APPROVED: { label: 'Đã duyệt',  color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối',   color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-500/10',         border: 'border-red-200 dark:border-red-500/20',         icon: XCircle     },
}

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL',      label: 'Tất cả trạng thái' },
  { value: 'PENDING',  label: 'Chờ duyệt'         },
  { value: 'APPROVED', label: 'Đã duyệt'          },
  { value: 'REJECTED', label: 'Từ chối'           },
]

// ── Note modal ────────────────────────────────────────────────────────────────

function NoteModal({ title, action, onConfirm, onClose }: {
  title: string; action: 'approve' | 'reject'
  onConfirm: (note: string) => void; onClose: () => void
}) {
  const [note, setNote] = useState('')

  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', action === 'approve' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10')}>
            {action === 'approve' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder={action === 'approve' ? 'Ghi chú duyệt (tùy chọn)...' : 'Lý do từ chối (bắt buộc)...'}
          rows={3}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/20 resize-none" />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Hủy</button>
          <button onClick={() => {
            if (action === 'reject' && !note.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return }
            onConfirm(note.trim())
          }} className={cn('rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors', action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600')}>
            {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ request, onClose }: { request: ReturnRequestDto; onClose: () => void }) {
  const cfg = STATUS_CONFIG[request.status]
  const Icon = cfg.icon

  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
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
              <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(String(request.createdAt)).toLocaleDateString('vi-VN')}</p>
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
              <div className={cn('rounded-xl p-3 border text-sm', cfg.bg, cfg.border, cfg.color)}>{request.staffNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReturnSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-white/5">
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-40 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5">
            <div className="flex justify-end items-center gap-1">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

// suppress unused-ref warning — kept for possible future use
void useRef

function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequestDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<ReturnRequestStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [detailRequest, setDetailRequest] = useState<ReturnRequestDto | null>(null)
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await returnRequestApi.adminListAll({
      status: activeStatus !== 'ALL' ? activeStatus : undefined,
      page, size: PAGE_SIZE,
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

  const q = searchQuery.trim().toLowerCase()
  const filteredRequests = q
    ? requests.filter(r => r.orderCode?.toLowerCase().includes(q) || r.userName?.toLowerCase().includes(q))
    : requests

  const pendingCount  = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý Đổi / Trả hàng</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={RotateCcw}    label="Tổng yêu cầu" value={totalElements} color="bg-rose-500"    />
          <StatCard icon={Clock}        label="Chờ duyệt"    value={pendingCount}   color="bg-amber-500"   />
          <StatCard icon={CheckCircle2} label="Đã duyệt"     value={approvedCount}  color="bg-emerald-500" />
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">Danh sách yêu cầu</p>
            <AdminSearchInput value={searchQuery} onChange={v => { setSearchQuery(v); setPage(0) }} placeholder="Tìm theo mã đơn, khách hàng..." />
            <AdminFilterSelect value={activeStatus} onChange={v => { setActiveStatus(v as ReturnRequestStatus | 'ALL'); setPage(0) }} options={STATUS_FILTER_OPTIONS} />
            <button
              onClick={() => exportReturnsToExcel(filteredRequests)}
              disabled={filteredRequests.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={12} /> Export Excel
            </button>
            <button onClick={loadData} className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
              <RefreshCw size={12} /> Làm mới
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                  <th className="px-5 py-3.5">Mã đơn hàng</th>
                  <th className="px-5 py-3.5">Khách hàng</th>
                  <th className="px-5 py-3.5">Lý do (tóm tắt)</th>
                  <th className="px-5 py-3.5">Ngày gửi</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {isLoading ? (<ReturnSkeleton />) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <AlertCircle size={28} className="mx-auto mb-2 text-gray-200 dark:text-white/20" />
                      <p className="text-sm text-gray-400">Không có yêu cầu nào</p>
                    </td>
                  </tr>
                ) : filteredRequests.map(req => {
                  const cfg = STATUS_CONFIG[req.status]
                  const SIcon = cfg.icon
                  const isPending = req.status === 'PENDING'
                  const isProcessing = processingId === req.id
                  return (
                    <tr key={req.id} className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100 font-mono">#{req.orderCode}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{req.userName}</p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{req.reason}</p>
                        {req.evidenceImages && req.evidenceImages.length > 0 && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-500">
                            <ImageOff size={9} /> {req.evidenceImages.length} ảnh
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(String(req.createdAt)).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                          <SIcon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button onClick={() => setDetailRequest(req)} title="Xem chi tiết"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition">
                            <Eye size={12} />
                          </button>
                          {isPending && (
                            <>
                              <button onClick={() => setNoteModal({ id: req.id, action: 'approve' })} disabled={isProcessing} title="Duyệt"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition disabled:opacity-50">
                                {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                              </button>
                              <button onClick={() => setNoteModal({ id: req.id, action: 'reject' })} disabled={isProcessing} title="Từ chối"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50">
                                <XCircle size={12} />
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

          <AdminTablePagination page={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
        </div>
      </div>

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
