/**
 * AdminFlashSalesPage — Flash sale CRUD management for Admin.
 *
 * react skill §1: compound component (list + modal form)
 * react skill §4: loading/error/empty + skeleton + button disabled during async
 * react skill §5: useCallback for stable handlers
 * ui-ux-pro-max: đồng bộ design system với AdminUsersPage
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Zap, Plus, Edit2, Trash2, Clock,
  Loader2, AlertCircle, TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { flashSaleApi, type FlashSaleDto, type FlashSaleStatus, type FlashSaleRequest } from '@/lib/http/flash-sale.api'
import { cn } from '@/lib/utils'
import { StatCard, AdminFilterSelect } from '@/features/admin/components/AdminShared'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
function fmtVND(n: number) { return n.toLocaleString('vi-VN') + '₫' }
function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function toIso(local: string) { return new Date(local).toISOString() }

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<FlashSaleStatus, { dot: string; badge: string }> = {
  SCHEDULED: {
    dot:   'bg-blue-500',
    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  ACTIVE: {
    dot:   'bg-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  ENDED: {
    dot:   'bg-gray-400',
    badge: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
  },
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: FlashSaleStatus }) {
  const { t } = useTranslation()
  const cfg = STATUS_STYLE[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
      cfg.badge,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {t(`adminFlashSales.status.${status}`)}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function FlashSaleSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 shrink-0" />
              <div className="h-4 w-36 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5 text-right">
            <div className="inline-flex justify-end gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ── Form Modal ─────────────────────────────────────────────────────────────────
interface FormModalProps {
  initial?: FlashSaleDto | null
  onClose: () => void
  onSaved: () => void
}

const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition placeholder:text-gray-400'

function FlashSaleFormModal({ initial, onClose, onSaved }: FormModalProps) {
  const { t } = useTranslation()
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

  const handleSubmit = useCallback(async () => {
    const errs: string[] = []
    if (!form.productId.trim()) errs.push(t('adminFlashSales.validation.productIdRequired'))
    if (form.salePrice <= 0)    errs.push(t('adminFlashSales.validation.salePriceMin'))
    if (form.stockLimit < 1)    errs.push(t('adminFlashSales.validation.stockMin'))
    if (!form.startTime)        errs.push(t('adminFlashSales.validation.startRequired'))
    if (!form.endTime)          errs.push(t('adminFlashSales.validation.endRequired'))
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errs.push(t('adminFlashSales.validation.endAfterStart'))
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
        toast.success(t('adminFlashSales.toast.updated'))
      } else {
        await flashSaleApi.createFlashSale(payload)
        toast.success(t('adminFlashSales.toast.created'))
      }
      onSaved()
    } catch {
      toast.error(t('adminFlashSales.toast.error'))
    } finally {
      setSaving(false)
    }
  }, [form, isEdit, initial, onSaved, t])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
            <Zap size={15} className="text-orange-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('adminFlashSales.form.editTitle') : t('adminFlashSales.form.createTitle')}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {errors.length > 0 && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={11} />{e}
                </p>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminFlashSales.form.productId')}</label>
            <input
              value={form.productId}
              onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              placeholder={t('adminFlashSales.form.productIdPh')}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminFlashSales.form.salePrice')}</label>
              <input
                type="number" min={0}
                value={form.salePrice}
                onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminFlashSales.form.stockLimit')}</label>
              <input
                type="number" min={1}
                value={form.stockLimit}
                onChange={e => setForm(f => ({ ...f, stockLimit: +e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminFlashSales.form.startTime')}</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('adminFlashSales.form.endTime')}</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/5 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            {t('adminFlashSales.form.cancel')}
          </button>
          <button
            id="flash-sale-save-btn"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50 shadow-sm shadow-orange-500/20"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? t('adminFlashSales.form.updateBtn') : t('adminFlashSales.form.saveBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminFlashSalesPage() {
  const { t } = useTranslation()
  const [sales,        setSales]    = useState<FlashSaleDto[]>([])
  const [loading,      setLoading]  = useState(true)
  const [filterStatus, setFilter]   = useState<FlashSaleStatus | 'ALL'>('ALL')
  const [modal,        setModal]    = useState<{ mode: 'create' | 'edit'; target?: FlashSaleDto } | null>(null)
  const [deleting,     setDeleting] = useState<string | null>(null)

  const FILTER_OPTIONS = [
    { value: 'ALL',       label: t('adminFlashSales.filter.all') },
    { value: 'ACTIVE',    label: t('adminFlashSales.filter.ACTIVE') },
    { value: 'SCHEDULED', label: t('adminFlashSales.filter.SCHEDULED') },
    { value: 'ENDED',     label: t('adminFlashSales.filter.ENDED') },
  ]

  const loadSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await flashSaleApi.listFlashSales(filterStatus === 'ALL' ? undefined : filterStatus)
      setSales(res.data ?? [])
    } catch {
      toast.error(t('adminFlashSales.toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [filterStatus, t])

  useEffect(() => { loadSales() }, [loadSales])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t('adminFlashSales.deleteConfirm'))) return
    setDeleting(id)
    try {
      await flashSaleApi.deleteFlashSale(id)
      toast.success(t('adminFlashSales.toast.deleted'))
      setSales(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error(t('adminFlashSales.toast.deleteFailed'))
    } finally {
      setDeleting(null)
    }
  }, [t])

  // Computed stats
  const activeCount    = sales.filter(s => s.status === 'ACTIVE').length
  const scheduledCount = sales.filter(s => s.status === 'SCHEDULED').length
  const totalSold      = sales.reduce((a, s) => a + s.soldCount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('adminFlashSales.title')}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {t('adminFlashSales.subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Zap}        label={t('adminFlashSales.statActive')}    value={activeCount}    color="bg-emerald-500" />
        <StatCard icon={Clock}       label={t('adminFlashSales.statScheduled')} value={scheduledCount} color="bg-blue-500" />
        <StatCard icon={TrendingUp}  label={t('adminFlashSales.statSold')}      value={totalSold}      color="bg-orange-500" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">
            {t('adminFlashSales.tableTitle')}
          </p>
          <AdminFilterSelect
            value={filterStatus}
            onChange={v => setFilter(v as FlashSaleStatus | 'ALL')}
            options={FILTER_OPTIONS}
          />
          <button
            id="flash-sale-create-btn"
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            <Plus size={13} />
            {t('adminFlashSales.createBtn')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">{t('adminFlashSales.colProduct')}</th>
                <th className="px-5 py-3.5">{t('adminFlashSales.colSalePrice')}</th>
                <th className="px-5 py-3.5">{t('adminFlashSales.colDiscount')}</th>
                <th className="px-5 py-3.5">{t('adminFlashSales.colStock')}</th>
                <th className="px-5 py-3.5">{t('adminFlashSales.colTime')}</th>
                <th className="px-5 py-3.5">{t('adminFlashSales.colStatus')}</th>
                <th className="px-5 py-3.5 text-right">{t('adminFlashSales.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <FlashSaleSkeleton />
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                        <Zap size={24} className="text-gray-300 dark:text-white/20" />
                      </div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {t('adminFlashSales.emptyTitle')}
                      </p>
                      <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="text-xs text-orange-500 hover:underline cursor-pointer"
                      >
                        {t('adminFlashSales.emptyCreate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr
                    key={sale.id}
                    className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]"
                  >
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {sale.thumbnailUrl ? (
                          <img
                            src={sale.thumbnailUrl}
                            alt={sale.productName}
                            className="h-10 w-10 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-white/5"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 shrink-0 flex items-center justify-center">
                            <Zap size={14} className="text-gray-300 dark:text-white/20" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                          {sale.productName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {fmtVND(sale.salePrice)}
                      </span>
                      <p className="text-xs text-gray-400 line-through mt-0.5">
                        {fmtVND(sale.originalPrice)}
                      </p>
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[11px] font-bold px-2.5 py-0.5">
                        -{sale.discountPercent}%
                      </span>
                    </td>

                    {/* Stock progress */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('adminFlashSales.remaining', { remaining: sale.remaining, sold: sale.soldCount })}
                      </p>
                      <div className="mt-1.5 h-1.5 w-24 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-400 transition-all"
                          style={{ width: `${Math.min(100, (sale.soldCount / sale.stockLimit) * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={11} className="shrink-0" />{fmtDate(sale.startTime)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">→ {fmtDate(sale.endTime)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sale.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {sale.status === 'SCHEDULED' && (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModal({ mode: 'edit', target: sale })}
                            aria-label="Sửa flash sale"
                            title="Sửa"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            disabled={deleting === sale.id}
                            aria-label="Xóa flash sale"
                            title="Xóa"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                          >
                            {deleting === sale.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Trash2 size={13} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
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
