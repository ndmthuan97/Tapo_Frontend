/**
 * AdminFlashSalesPage — Flash sale CRUD management for Admin.
 *
 * react skill §1: compound component (list + modal form)
 * react skill §4: loading/error/empty + button disabled during async
 * react skill §5: useCallback for stable handlers
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Zap, Plus, Edit2, Trash2, Clock, Circle,
  Loader2, AlertCircle, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { flashSaleApi, type FlashSaleDto, type FlashSaleStatus, type FlashSaleRequest } from '@/lib/http/flash-sale.api'
import { cn } from '@/lib/utils'

// ── Config ─────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<FlashSaleStatus, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Chờ mở',    color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ACTIVE:    { label: 'Đang diễn', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ENDED:     { label: 'Đã kết thúc', color: 'text-gray-500',                        bg: 'bg-gray-100 dark:bg-white/10' },
}

const STATUS_FILTERS: Array<{ key: FlashSaleStatus | 'ALL'; label: string }> = [
  { key: 'ALL',       label: 'Tất cả' },
  { key: 'ACTIVE',    label: 'Đang diễn' },
  { key: 'SCHEDULED', label: 'Chờ mở' },
  { key: 'ENDED',     label: 'Đã kết thúc' },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
function fmtVND(n: number) { return n.toLocaleString('vi-VN') + '₫' }

// ── Status Badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: FlashSaleStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg.color, cfg.bg)}>
      <Circle size={6} fill="currentColor" />
      {cfg.label}
    </span>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
interface FormModalProps {
  initial?: FlashSaleDto | null
  onClose: () => void
  onSaved: () => void
}

function FlashSaleFormModal({ initial, onClose, onSaved }: FormModalProps) {
  const isEdit = !!initial
  const [form, setForm] = useState<FlashSaleRequest>({
    productId:  initial?.productId  ?? '',
    salePrice:  initial?.salePrice  ?? 0,
    stockLimit: initial?.stockLimit ?? 1,
    startTime:  initial?.startTime  ? toLocalInput(initial.startTime) : '',
    endTime:    initial?.endTime    ? toLocalInput(initial.endTime)   : '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function toLocalInput(iso: string) {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  function toIso(local: string) { return new Date(local).toISOString() }

  const handleSubmit = useCallback(async () => {
    const errs: string[] = []
    if (!form.productId.trim()) errs.push('Product ID là bắt buộc')
    if (form.salePrice <= 0)    errs.push('Giá sale phải > 0')
    if (form.stockLimit < 1)    errs.push('Tồn kho tối thiểu 1')
    if (!form.startTime)        errs.push('Thời gian bắt đầu bắt buộc')
    if (!form.endTime)          errs.push('Thời gian kết thúc bắt buộc')
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errs.push('Thời gian kết thúc phải sau thời gian bắt đầu')
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setSaving(true)

    const payload: FlashSaleRequest = {
      ...form,
      startTime: toIso(form.startTime),
      endTime:   toIso(form.endTime),
    }

    try {
      if (isEdit && initial) {
        await flashSaleApi.updateFlashSale(initial.id, payload)
        toast.success('Flash sale đã được cập nhật')
      } else {
        await flashSaleApi.createFlashSale(payload)
        toast.success('Flash sale đã được tạo')
      }
      onSaved()
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }, [form, isEdit, initial, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <Zap size={18} className="text-orange-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            {isEdit ? 'Cập nhật Flash Sale' : 'Tạo Flash Sale mới'}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          {errors.length > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 p-3">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />{e}
                </p>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Product ID *</label>
            <input
              value={form.productId}
              onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              placeholder="UUID của sản phẩm"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Giá sale (₫) *</label>
              <input
                type="number" min={0}
                value={form.salePrice}
                onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Giới hạn tồn *</label>
              <input
                type="number" min={1}
                value={form.stockLimit}
                onChange={e => setForm(f => ({ ...f, stockLimit: +e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bắt đầu *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kết thúc *</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Huỷ</button>
          <button
            id="flash-sale-save-btn"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {isEdit ? 'Cập nhật' : 'Tạo Flash Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export function AdminFlashSalesPage() {
  const [sales,       setSales]       = useState<FlashSaleDto[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filterStatus, setFilter]     = useState<FlashSaleStatus | 'ALL'>('ALL')
  const [modal,        setModal]      = useState<{ mode: 'create' | 'edit'; target?: FlashSaleDto } | null>(null)
  const [deleting,     setDeleting]   = useState<string | null>(null)

  const loadSales = useCallback(async () => {
    setLoading(true)
    try {
      const data = await flashSaleApi.listFlashSales(filterStatus === 'ALL' ? undefined : filterStatus)
      setSales(data)
    } catch {
      toast.error('Không thể tải danh sách flash sale')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadSales() }, [loadSales])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Xóa flash sale này?')) return
    setDeleting(id)
    try {
      await flashSaleApi.deleteFlashSale(id)
      toast.success('Đã xóa flash sale')
      setSales(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Chỉ có thể xóa flash sale ở trạng thái SCHEDULED')
    } finally {
      setDeleting(null)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Zap size={22} className="text-orange-500" />
            Flash Sales
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý khuyến mãi thời hạn — tự động kích hoạt theo lịch
          </p>
        </div>
        <button
          id="flash-sale-create-btn"
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Tạo Flash Sale
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              filterStatus === f.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-orange-400" />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Zap size={40} className="mb-3 text-gray-200 dark:text-zinc-700" />
            <p className="text-sm">Chưa có flash sale nào</p>
            <button onClick={() => setModal({ mode: 'create' })} className="mt-3 text-sm text-orange-500 hover:underline">
              Tạo flash sale đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  {['Sản phẩm', 'Giá sale', 'Giảm', 'Tồn / Bán', 'Thời gian', 'Trạng thái', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {sale.thumbnailUrl && (
                          <img src={sale.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[180px]">{sale.productName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{fmtVND(sale.salePrice)}</span>
                      <p className="text-xs text-gray-400 line-through">{fmtVND(sale.originalPrice)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-0.5">
                        -{sale.discountPercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <span>{sale.remaining} còn / {sale.soldCount} bán</span>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-orange-400"
                          style={{ width: `${Math.min(100, (sale.soldCount / sale.stockLimit) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-1"><Clock size={11} /> {fmtDate(sale.startTime)}</p>
                      <p className="text-gray-400">→ {fmtDate(sale.endTime)}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={sale.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {sale.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => setModal({ mode: 'edit', target: sale })}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              title="Sửa"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sale.id)}
                              disabled={deleting === sale.id}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                              title="Xóa"
                            >
                              {deleting === sale.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <FlashSaleFormModal
          initial={modal.target ?? null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadSales() }}
        />
      )}
    </div>
  )
}
