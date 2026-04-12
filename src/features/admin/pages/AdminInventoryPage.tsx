/**
 * AdminInventoryPage — Stock receipt management (IMPORT / EXPORT).
 *
 * react skill §1: compound component (list + detail drawer + create dialog)
 * react skill §4: all UI states handled + skeleton
 * react skill §5: useCallback + memo for stable handlers
 * ui-ux-pro-max: đồng bộ design system với AdminUsersPage
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package, Plus, ArrowDownToLine, ArrowUpFromLine,
  Loader2, X, Trash2, AlertCircle, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  inventoryApi,
  type InventoryReceiptDto,
  type ReceiptType,
  type CreateReceiptRequest,
} from '@/lib/http/inventory.api'
import type { PageResponse } from '@/lib/types/common/api.types'
import { cn } from '@/lib/utils'
import { StatCard, AdminFilterSelect, AdminTablePagination } from '@/features/admin/components/AdminShared'

type FilterType = ReceiptType | 'ALL'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtVND(n: number) { return n.toLocaleString('vi-VN') + '₫' }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ReceiptType }) {
  const { t } = useTranslation()
  return type === 'IMPORT' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t('adminInventory.type.IMPORT')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[11px] font-semibold px-2.5 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{t('adminInventory.type.EXPORT')}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function InventorySkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5 font-mono" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5 text-right"><div className="inline-flex justify-end"><div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" /></div></td>
        </tr>
      ))}
    </>
  )
}

// ── Item Entry Row (in create form) ──────────────────────────────────────────
interface ItemEntry { productId: string; quantity: number; unitPrice: number }

const inputCls = 'rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition w-full placeholder:text-gray-400'

function ItemEntryRow({
  item, index, onChange, onRemove, canRemove,
}: {
  item: ItemEntry
  index: number
  onChange: (i: number, field: keyof ItemEntry, value: string | number) => void
  onRemove: (i: number) => void
  canRemove: boolean
}) {
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
        className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 transition cursor-pointer"
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
  const { t } = useTranslation()
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
    if (items.length === 0) errs.push(t('adminInventory.validation.minOneItem'))
    items.forEach((it, i) => {
      if (!it.productId.trim()) errs.push(t('adminInventory.validation.productIdRequired', { n: i + 1 }))
      if (it.quantity < 1)      errs.push(t('adminInventory.validation.quantityMin', { n: i + 1 }))
      if (it.unitPrice < 0)     errs.push(t('adminInventory.validation.unitPriceInvalid', { n: i + 1 }))
    })
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setSaving(true)

    const payload: CreateReceiptRequest = { type: receiptType, note: note || undefined, items }
    try {
      const res = await inventoryApi.createReceipt(payload)
      toast.success(t('adminInventory.toast.createSuccess', { code: res.data!.receiptCode }))
      onSaved()
    } catch {
      toast.error(t('adminInventory.toast.createFailed'))
    } finally {
      setSaving(false)
    }
  }, [receiptType, note, items, onSaved, t])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
            <Package size={15} className="text-orange-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">{t('adminInventory.form.title')}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 overflow-y-auto flex-1">
          {errors.length > 0 && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={11} />{e}
                </p>
              ))}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('adminInventory.form.typeLabel')}</label>
            <div className="flex gap-3">
              {(['IMPORT', 'EXPORT'] as ReceiptType[]).map(rcpType => (
                <button
                  key={rcpType}
                  onClick={() => setType(rcpType)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border cursor-pointer',
                    receiptType === rcpType
                      ? rcpType === 'IMPORT'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                  )}
                >
                  {rcpType === 'IMPORT' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                  {t(`adminInventory.type.${rcpType}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminInventory.form.noteLabel')}</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('adminInventory.form.notePh')}
              className={cn(inputCls, 'w-full')}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('adminInventory.form.itemsLabel')}</label>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                <Plus size={12} />{t('adminInventory.form.addLine')}
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
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
          >
            {t('adminInventory.form.cancel')}
          </button>
          <button
            id="inventory-create-btn"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />}
            {t('adminInventory.form.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function ReceiptDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation()
  const [receipt, setReceipt] = useState<InventoryReceiptDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    inventoryApi.getReceipt(id)
      .then(res => setReceipt(res.data))
      .catch(() => toast.error(t('adminInventory.toast.detailFailed')))
      .finally(() => setLoading(false))
  }, [id, t])

  const total = receipt?.items.reduce((sum, i) => sum + i.lineTotal, 0) ?? 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-white dark:bg-[#21232d] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
            <Package size={15} className="text-orange-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">
            {receipt?.receiptCode ?? t('adminInventory.detail.title')}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          ) : !receipt ? (
            <p className="text-center text-gray-400 text-sm py-8">{t('adminInventory.detail.notFound')}</p>
          ) : (
            <>
              {/* Meta */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 space-y-3 text-sm">
                {[
                  { label: t('adminInventory.detail.type'),      value: <TypeBadge type={receipt.type} /> },
                  { label: t('adminInventory.detail.createdBy'), value: <span className="font-medium text-gray-700 dark:text-gray-200">{receipt.createdByName}</span> },
                  { label: t('adminInventory.detail.createdAt'), value: <span className="text-gray-600 dark:text-gray-300">{fmtDate(receipt.createdAt)}</span> },
                  ...(receipt.orderCode ? [{ label: t('adminInventory.detail.order'), value: <span className="font-mono text-xs text-gray-700 dark:text-gray-200">{receipt.orderCode}</span> }] : []),
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{row.label}</span>
                    {row.value}
                  </div>
                ))}
                {receipt.note && (
                  <div className="pt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">{t('adminInventory.detail.note')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{receipt.note}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('adminInventory.detail.items')}</h3>
                <div className="divide-y divide-gray-100 dark:divide-white/5 rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                  {receipt.items.map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 items-center hover:bg-gray-50 dark:hover:bg-white/[0.03] transition">
                      {item.thumbnailUrl && (
                        <img src={item.thumbnailUrl} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-white/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.quantity} × {fmtVND(item.unitPrice)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 shrink-0">
                        {fmtVND(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-white/5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('adminInventory.detail.total')}</span>
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
  const { t } = useTranslation()
  const filterOptions = [
    { value: 'ALL',    label: t('adminInventory.filter.all') },
    { value: 'IMPORT', label: t('adminInventory.filter.IMPORT') },
    { value: 'EXPORT', label: t('adminInventory.filter.EXPORT') },
  ]
  const [data,       setData]       = useState<PageResponse<InventoryReceiptDto> | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState<FilterType>('ALL')
  const [page,       setPage]       = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [detailId,   setDetailId]   = useState<string | null>(null)
  // ── Global totals (independent of current filter/page) ─────────────────────
  const [totalImport, setTotalImport] = useState(0)
  const [totalExport, setTotalExport] = useState(0)
  const [totalAll,    setTotalAll]    = useState(0)

  const loadStats = useCallback(async () => {
    try {
      const [all, imp, exp] = await Promise.all([
        inventoryApi.listReceipts(undefined,  0, 1),
        inventoryApi.listReceipts('IMPORT',   0, 1),
        inventoryApi.listReceipts('EXPORT',   0, 1),
      ])
      if (all.data) setTotalAll(all.data.totalElements)
      if (imp.data) setTotalImport(imp.data.totalElements)
      if (exp.data) setTotalExport(exp.data.totalElements)
    } catch { /* ignore */ }
  }, [])

  const loadReceipts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.listReceipts(filter === 'ALL' ? undefined : filter, page - 1, 20)
      if (res.data) setData(res.data)
    } catch {
      toast.error(t('adminInventory.toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [filter, page, t])

  // Load global stats once on mount
  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadReceipts() }, [loadReceipts])
  useEffect(() => { setPage(1) }, [filter])

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('adminInventory.title')}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {t('adminInventory.subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Package}         label={t('adminInventory.statTotal')}  value={totalAll}    color="bg-orange-500" />
        <StatCard icon={ArrowDownToLine} label={t('adminInventory.statImport')} value={totalImport} color="bg-emerald-500" />
        <StatCard icon={ArrowUpFromLine} label={t('adminInventory.statExport')} value={totalExport} color="bg-rose-500" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">
            {t('adminInventory.tableTitle')}
            {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalElements})</span>}
          </p>
          <AdminFilterSelect
            value={filter}
            onChange={v => setFilter(v as FilterType)}
            options={filterOptions}
          />
          <button
            id="inventory-new-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            <Plus size={13} />
            {t('adminInventory.createBtn')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">{t('adminInventory.colCode')}</th>
                <th className="px-5 py-3.5">{t('adminInventory.colType')}</th>
                <th className="px-5 py-3.5">{t('adminInventory.colCreatedBy')}</th>
                <th className="px-5 py-3.5">{t('adminInventory.colItems')}</th>
                <th className="px-5 py-3.5">{t('adminInventory.colNote')}</th>
                <th className="px-5 py-3.5">{t('adminInventory.colDate')}</th>
                <th className="px-5 py-3.5 text-right">{t('adminInventory.colDetail')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <InventorySkeleton />
              ) : !(data?.content?.length) ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                        <Package size={24} className="text-gray-300 dark:text-white/20" />
                      </div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t('adminInventory.emptyTitle')}</p>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="text-xs text-orange-500 hover:underline cursor-pointer"
                      >
                        {t('adminInventory.emptyCreate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                (data?.content ?? []).map(r => (
                  <tr
                    key={r.id}
                    className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03] cursor-pointer"
                    onClick={() => setDetailId(r.id)}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-gray-100">
                      {r.receiptCode}
                    </td>
                    <td className="px-5 py-3.5"><TypeBadge type={r.type} /></td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{r.createdByName}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{t('adminInventory.itemsCount', { count: r.items.length })}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[140px] truncate">{r.note ?? t('adminInventory.noNote')}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={e => { e.stopPropagation(); setDetailId(r.id) }}
                        aria-label="Xem chi tiết phiếu"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <AdminTablePagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateReceiptModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); loadReceipts(); loadStats() }}
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
