/**
 * AdminInventoryPage — Stock receipt management (IMPORT / EXPORT).
 *
 * react skill §1: compound component (list + detail drawer + create dialog)
 * react skill §4: all UI states handled
 * react skill §5: useCallback + memo for stable handlers
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Package, Plus, ArrowDownToLine, ArrowUpFromLine,
  Loader2, X, Trash2, AlertCircle, ChevronLeft, ChevronRight,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  inventoryApi,
  type InventoryReceiptDto,
  type ReceiptType,
  type CreateReceiptRequest,
} from '@/lib/http/inventory.api'
import { cn } from '@/lib/utils'

type FilterType = ReceiptType | 'ALL'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtVND(n: number) { return n.toLocaleString('vi-VN') + '₫' }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Receipt Badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ReceiptType }) {
  return type === 'IMPORT' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2 py-0.5">
      <ArrowDownToLine size={10} />IMPORT
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-medium px-2 py-0.5">
      <ArrowUpFromLine size={10} />EXPORT
    </span>
  )
}

// ── Item Entry Row (in create form) ──────────────────────────────────────────
interface ItemEntry { productId: string; quantity: number; unitPrice: number }

function ItemEntryRow({
  item, index, onChange, onRemove, canRemove,
}: {
  item: ItemEntry
  index: number
  onChange: (i: number, field: keyof ItemEntry, value: string | number) => void
  onRemove: (i: number) => void
  canRemove: boolean
}) {
  const inputCls = 'rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400 w-full'
  return (
    <div className="flex gap-2 items-center">
      <input
        value={item.productId}
        onChange={e => onChange(index, 'productId', e.target.value)}
        placeholder="Product ID (UUID)"
        className={cn(inputCls, 'flex-1 min-w-0')}
      />
      <input
        type="number" min={1}
        value={item.quantity}
        onChange={e => onChange(index, 'quantity', +e.target.value)}
        placeholder="SL"
        className={cn(inputCls, 'w-20')}
      />
      <input
        type="number" min={0}
        value={item.unitPrice}
        onChange={e => onChange(index, 'unitPrice', +e.target.value)}
        placeholder="Đơn giá"
        className={cn(inputCls, 'w-28')}
      />
      <button
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ── Create Modal ──────────────────────────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void
  onSaved: () => void
}

function CreateReceiptModal({ onClose, onSaved }: CreateModalProps) {
  const [receiptType, setType]   = useState<ReceiptType>('IMPORT')
  const [note,        setNote]   = useState('')
  const [items,       setItems]  = useState<ItemEntry[]>([{ productId: '', quantity: 1, unitPrice: 0 }])
  const [saving,      setSaving] = useState(false)
  const [errors,      setErrors] = useState<string[]>([])

  const updateItem = useCallback((i: number, field: keyof ItemEntry, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }, [])

  const removeItem = useCallback((i: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }, [])

  const addItem = useCallback(() => {
    setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0 }])
  }, [])

  const handleSubmit = useCallback(async () => {
    const errs: string[] = []
    if (items.length === 0) errs.push('Phải có ít nhất 1 sản phẩm')
    items.forEach((it, i) => {
      if (!it.productId.trim()) errs.push(`Dòng ${i + 1}: Product ID bắt buộc`)
      if (it.quantity < 1)     errs.push(`Dòng ${i + 1}: Số lượng tối thiểu 1`)
      if (it.unitPrice < 0)    errs.push(`Dòng ${i + 1}: Đơn giá không hợp lệ`)
    })
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setSaving(true)

    const payload: CreateReceiptRequest = { type: receiptType, note: note || undefined, items }
    try {
      const receipt = await inventoryApi.createReceipt(payload)
      toast.success(`Phiếu ${receipt.receiptCode} đã được tạo — stock đã cập nhật`)
      onSaved()
    } catch {
      toast.error('Không thể tạo phiếu kho. Kiểm tra lại Product ID và tồn kho.')
    } finally {
      setSaving(false)
    }
  }, [receiptType, note, items, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <Package size={18} className="text-orange-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex-1">Tạo Phiếu Kho</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {errors.length > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} />{e}
                </p>
              ))}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Loại phiếu *</label>
            <div className="flex gap-3">
              {(['IMPORT', 'EXPORT'] as ReceiptType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border',
                    receiptType === t
                      ? t === 'IMPORT'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                  )}
                >
                  {t === 'IMPORT' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                  {t === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ghi chú</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nhập ghi chú (không bắt buộc)"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Danh sách sản phẩm *</label>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline"
              >
                <Plus size={12} />Thêm dòng
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_112px_32px] gap-2 text-xs text-gray-400 dark:text-gray-500 px-1">
                <span>Product ID</span><span>Số lượng</span><span>Đơn giá (₫)</span><span/>
              </div>
              {items.map((item, i) => (
                <ItemEntryRow
                  key={i}
                  item={item}
                  index={i}
                  onChange={updateItem}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-zinc-800 shrink-0">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            Huỷ
          </button>
          <button
            id="inventory-create-btn"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
            Tạo phiếu kho
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function ReceiptDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [receipt, setReceipt] = useState<InventoryReceiptDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    inventoryApi.getReceipt(id)
      .then(setReceipt)
      .catch(() => toast.error('Không thể tải chi tiết phiếu'))
      .finally(() => setLoading(false))
  }, [id])

  const total = receipt?.items.reduce((sum, i) => sum + i.lineTotal, 0) ?? 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <Package size={16} className="text-orange-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex-1 truncate">
            {receipt?.receiptCode ?? 'Chi tiết phiếu'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-orange-400" /></div>
          ) : !receipt ? (
            <p className="text-center text-gray-400 text-sm py-8">Không tìm thấy phiếu</p>
          ) : (
            <>
              {/* Meta */}
              <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Loại</span>
                  <TypeBadge type={receipt.type} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Người tạo</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{receipt.createdByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ngày tạo</span>
                  <span className="text-gray-700 dark:text-gray-200">{fmtDate(receipt.createdAt)}</span>
                </div>
                {receipt.orderCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Đơn hàng</span>
                    <span className="font-mono text-gray-700 dark:text-gray-200">{receipt.orderCode}</span>
                  </div>
                )}
                {receipt.note && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Ghi chú</span>
                    <p className="text-gray-700 dark:text-gray-200 text-xs">{receipt.note}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Chi tiết sản phẩm</h3>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                  {receipt.items.map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 items-center">
                      {item.thumbnailUrl && (
                        <img src={item.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.quantity} × {fmtVND(item.unitPrice)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 shrink-0">{fmtVND(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tổng giá trị</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{fmtVND(total)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminInventoryPage() {
  // react skill §4: all UI states
  type PageData = { content: InventoryReceiptDto[]; totalPages: number; totalElements: number }
  const [data,    setData]    = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<FilterType>('ALL')
  const [page,    setPage]    = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [detailId,   setDetailId]   = useState<string | null>(null)

  const loadReceipts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.listReceipts(filter === 'ALL' ? undefined : filter, page, 20)
      setData(res as unknown as PageData)
    } catch {
      toast.error('Không thể tải danh sách phiếu kho')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { loadReceipts() }, [loadReceipts])
  // Reset page on filter change
  useEffect(() => { setPage(0) }, [filter])

  const receipts = data?.content ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Package size={22} className="text-orange-500" />
            Quản lý kho
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Phiếu nhập / xuất kho — stock cập nhật ngay lập tức
          </p>
        </div>
        <button
          id="inventory-new-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Tạo phiếu mới
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['ALL', 'IMPORT', 'EXPORT'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1',
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
            )}
          >
            {f === 'IMPORT' && <ArrowDownToLine size={11} />}
            {f === 'EXPORT' && <ArrowUpFromLine size={11} />}
            {f === 'ALL' ? 'Tất cả' : f === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
          </button>
        ))}
        {data && (
          <span className="ml-2 self-center text-xs text-gray-400">{data.totalElements} phiếu</span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-orange-400" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={40} className="mb-3 text-gray-200 dark:text-zinc-700" />
            <p className="text-sm">Chưa có phiếu kho nào</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-orange-500 hover:underline">
              Tạo phiếu đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    {['Mã phiếu', 'Loại', 'Người tạo', 'Sản phẩm', 'Ghi chú', 'Ngày tạo', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {receipts.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setDetailId(r.id)}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800 dark:text-gray-100">{r.receiptCode}</td>
                      <td className="px-4 py-3"><TypeBadge type={r.type} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.createdByName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.items.length} sản phẩm</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate">{r.note ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setDetailId(r.id) }}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-zinc-800">
                <p className="text-xs text-gray-500">
                  Trang {page + 1} / {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-lg p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                    disabled={page >= data.totalPages - 1}
                    className="rounded-lg p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateReceiptModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); loadReceipts() }}
        />
      )}

      {/* Detail drawer */}
      {detailId && (
        <ReceiptDetailDrawer
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}
