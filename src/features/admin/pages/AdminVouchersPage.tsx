import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Plus, ToggleLeft, ToggleRight, Tag,
  Loader2, Percent, DollarSign, Calendar, Users, X,
  CheckCircle, PauseCircle, Pencil, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { voucherApi, type VoucherDto, type CreateVoucherRequest, type DiscountType } from '@/lib/http/voucher.api'
import { StatCard, AdminSearchInput, AdminFilterSelect, AdminTablePagination } from '@/features/admin/components/AdminShared'

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ── Skeleton ──────────────────────────────────────────────────────────────────

function VoucherSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-4 py-3.5"><div className="h-6 w-20 rounded-lg bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-4 w-12 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-4 py-3.5"><div className="ml-auto h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" /></td>
        </tr>
      ))}
    </>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  const { t } = useTranslation()
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
      status === 'ACTIVE'
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400')} />
      {status === 'ACTIVE' ? t('adminVouchers.status.ACTIVE') : t('adminVouchers.status.INACTIVE')}
    </span>
  )
}

// ── Field + input helpers ─────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all bg-white dark:bg-[#1a1c24]',
    'text-gray-800 dark:text-gray-200 placeholder:text-gray-400',
    hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 dark:border-white/10 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/20',
  )
}

// ── Create modal ──────────────────────────────────────────────────────────────

const INITIAL_FORM: CreateVoucherRequest = {
  code: '', name: '', discountType: 'PERCENTAGE',
  discountValue: 0, maxDiscountAmount: null,
  minimumOrderValue: 0, usageLimit: null,
  startDate: '', endDate: '',
}

function CreateVoucherModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useTranslation()
  const [form, setForm] = useState<CreateVoucherRequest>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateVoucherRequest, string>>>({})

  function set<K extends keyof CreateVoucherRequest>(key: K, value: CreateVoucherRequest[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.code.trim()) e.code = t('adminVouchers.validation.codeRequired')
    if (!form.name.trim()) e.name = t('adminVouchers.validation.nameRequired')
    if (form.discountValue <= 0) e.discountValue = t('adminVouchers.validation.valueMin')
    if (form.discountType === 'PERCENTAGE' && form.discountValue > 100) e.discountValue = t('adminVouchers.validation.valuePctMax')
    if (!form.startDate) e.startDate = t('adminVouchers.validation.startRequired')
    if (!form.endDate) e.endDate = t('adminVouchers.validation.endRequired')
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = t('adminVouchers.validation.endAfterStart')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload: CreateVoucherRequest = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    }
    const res = await voucherApi.adminCreate(payload)
    setSaving(false)
    if (res.success) { toast.success(t('adminVouchers.toast.created')); onCreated() }
    else toast.error(t('adminVouchers.toast.error'), { description: res.error?.message })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
              <Tag size={16} className="text-orange-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('adminVouchers.form.createTitle')}</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã voucher *" error={errors.code}>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="VD: SUMMER20" className={inputCls(!!errors.code)} />
            </Field>
            <Field label="Tên voucher *" error={errors.name}>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Giảm giá mùa hè" className={inputCls(!!errors.name)} />
            </Field>
          </div>

          <Field label={t('adminVouchers.form.discountType')}>
            <div className="grid grid-cols-2 gap-2">
              {(['PERCENTAGE', 'FIXED_AMOUNT'] as DiscountType[]).map(discType => (
                <button key={discType} type="button" onClick={() => set('discountType', discType)}
                  className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    form.discountType === discType
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400')}>
                  {discType === 'PERCENTAGE' ? <Percent size={14} /> : <DollarSign size={14} />}
                  {discType === 'PERCENTAGE' ? t('adminVouchers.form.pct') : t('adminVouchers.form.fixed')}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={form.discountType === 'PERCENTAGE' ? t('adminVouchers.form.valuePct') : t('adminVouchers.form.valueFixed')} error={errors.discountValue}>
              <input type="number" min={0} value={form.discountValue || ''} onChange={e => set('discountValue', Number(e.target.value))} className={inputCls(!!errors.discountValue)} />
            </Field>
            {form.discountType === 'PERCENTAGE' && (
              <Field label={t('adminVouchers.form.maxAmount')}>
                <input type="number" min={0} value={form.maxDiscountAmount ?? ''} onChange={e => set('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)} placeholder={t('adminVouchers.form.maxAmountPh')} className={inputCls(false)} />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('adminVouchers.form.minOrder')}>
              <input type="number" min={0} value={form.minimumOrderValue || ''} onChange={e => set('minimumOrderValue', Number(e.target.value))} className={inputCls(false)} />
            </Field>
            <Field label={t('adminVouchers.form.usageLimit')}>
              <input type="number" min={0} value={form.usageLimit ?? ''} onChange={e => set('usageLimit', e.target.value ? Number(e.target.value) : null)} placeholder={t('adminVouchers.form.usageLimitPh')} className={inputCls(false)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('adminVouchers.form.startDate')} error={errors.startDate}>
              <input type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls(!!errors.startDate)} />
            </Field>
            <Field label={t('adminVouchers.form.endDate')} error={errors.endDate}>
              <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls(!!errors.endDate)} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t('adminVouchers.form.cancel')}</button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {t('adminVouchers.form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditVoucherModal({
  voucher, onClose, onUpdated,
}: {
  voucher: VoucherDto
  onClose: () => void
  onUpdated: () => void
}) {
  const { t } = useTranslation()
  const toLocalDT = (iso: string) => iso ? iso.slice(0, 16) : ''

  const [form, setForm] = useState<CreateVoucherRequest>({
    code: voucher.code,
    name: voucher.name,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount,
    minimumOrderValue: voucher.minimumOrderValue,
    usageLimit: voucher.usageLimit,
    startDate: toLocalDT(voucher.startDate),
    endDate: toLocalDT(voucher.endDate),
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateVoucherRequest, string>>>({})

  function set<K extends keyof CreateVoucherRequest>(key: K, value: CreateVoucherRequest[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.code.trim()) e.code = t('adminVouchers.validation.codeRequired')
    if (!form.name.trim()) e.name = t('adminVouchers.validation.nameRequired')
    if (form.discountValue <= 0) e.discountValue = t('adminVouchers.validation.valueMin')
    if (form.discountType === 'PERCENTAGE' && form.discountValue > 100) e.discountValue = t('adminVouchers.validation.valuePctMax')
    if (!form.startDate) e.startDate = t('adminVouchers.validation.startRequired')
    if (!form.endDate) e.endDate = t('adminVouchers.validation.endRequired')
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = t('adminVouchers.validation.endAfterStart')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload: CreateVoucherRequest = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    }
    const res = await voucherApi.adminUpdate(voucher.id, payload)
    setSaving(false)
    if (res.success) { toast.success(t('adminVouchers.toast.updated')); onUpdated() }
    else toast.error(t('adminVouchers.toast.error'), { description: res.error?.message })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <Pencil size={16} className="text-blue-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('adminVouchers.form.editTitle')}</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã voucher *" error={errors.code}>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="VD: SUMMER20" className={inputCls(!!errors.code)} />
            </Field>
            <Field label="Tên voucher *" error={errors.name}>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Giảm giá mùa hè" className={inputCls(!!errors.name)} />
            </Field>
          </div>

          <Field label="Loại giảm giá">
            <div className="grid grid-cols-2 gap-2">
              {(['PERCENTAGE', 'FIXED_AMOUNT'] as DiscountType[]).map(t => (
                <button key={t} type="button" onClick={() => set('discountType', t)}
                  className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    form.discountType === t
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400')}>
                  {t === 'PERCENTAGE' ? <Percent size={14} /> : <DollarSign size={14} />}
                  {t === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={form.discountType === 'PERCENTAGE' ? 'Giảm (%) *' : 'Giảm (₫) *'} error={errors.discountValue}>
              <input type="number" min={0} value={form.discountValue || ''} onChange={e => set('discountValue', Number(e.target.value))} className={inputCls(!!errors.discountValue)} />
            </Field>
            {form.discountType === 'PERCENTAGE' && (
              <Field label="Giảm tối đa (₫)">
                <input type="number" min={0} value={form.maxDiscountAmount ?? ''} onChange={e => set('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)} placeholder="Không giới hạn" className={inputCls(false)} />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Đơn tối thiểu (₫)">
              <input type="number" min={0} value={form.minimumOrderValue || ''} onChange={e => set('minimumOrderValue', Number(e.target.value))} className={inputCls(false)} />
            </Field>
            <Field label="Số lượt dùng tối đa">
              <input type="number" min={0} value={form.usageLimit ?? ''} onChange={e => set('usageLimit', e.target.value ? Number(e.target.value) : null)} placeholder="Không giới hạn" className={inputCls(false)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày bắt đầu *" error={errors.startDate}>
              <input type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls(!!errors.startDate)} />
            </Field>
            <Field label="Ngày kết thúc *" error={errors.endDate}>
              <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls(!!errors.endDate)} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t('adminVouchers.form.cancel')}</button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
              {t('adminVouchers.form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────


function AdminVouchersPage() {
  const { t } = useTranslation()
  const [vouchers, setVouchers]         = useState<VoucherDto[]>([])
  const [totalPages, setTotalPages]     = useState(0)
  const [page, setPage]                 = useState(0)
  const [isLoading, setIsLoading]       = useState(true)
  const [showCreate, setShowCreate]     = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<VoucherDto | null>(null)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [togglingId, setTogglingId]     = useState<string | null>(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  // ── Global stat totals (not from page data) ───────────────────────────────
  const [statTotal,    setStatTotal]    = useState(0)
  const [statActive,   setStatActive]   = useState(0)
  const [statInactive, setStatInactive] = useState(0)

  const STATUS_FILTER_OPTIONS = useMemo(() => [
    { value: 'ALL',      label: t('adminVouchers.filter.ALL')      },
    { value: 'ACTIVE',   label: t('adminVouchers.filter.ACTIVE')   },
    { value: 'INACTIVE', label: t('adminVouchers.filter.INACTIVE') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t])

  const loadStats = useCallback(async () => {
    try {
      const [total, active, inactive] = await Promise.all([
        voucherApi.adminListAll(0, 1),
        voucherApi.adminListAll(0, 1, 'ACTIVE'),
        voucherApi.adminListAll(0, 1, 'INACTIVE'),
      ])
      if (total.data)    setStatTotal(total.data.totalElements)
      if (active.data)   setStatActive(active.data.totalElements)
      if (inactive.data) setStatInactive(inactive.data.totalElements)
    } catch { /* ignore */ }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await voucherApi.adminListAll(page, PAGE_SIZE)
    setIsLoading(false)
    if (res.success && res.data) {
      setVouchers(res.data.content)
      setTotalPages(res.data.totalPages)
    }
  }, [page])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadData()  }, [loadData])

  async function handleToggle(id: string) {
    setTogglingId(id)
    const res = await voucherApi.adminToggleStatus(id)
    setTogglingId(null)
    if (res.success) {
      toast.success(t('adminVouchers.toast.toggled'))
      loadStats()
      setVouchers(vs => vs.map(v => v.id === id ? { ...v, status: res.data!.status } : v))
    } else {
      toast.error(t('adminVouchers.toast.error'), { description: res.error?.message })
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('adminVouchers.deleteConfirm'))) return
    setDeletingId(id)
    const res = await voucherApi.adminDelete(id)
    setDeletingId(null)
    if (res.success) {
      toast.success(t('adminVouchers.toast.deleted'))
      loadData(); loadStats()
    } else {
      toast.error(t('adminVouchers.toast.errorDel'), { description: res.error?.message })
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const q = searchQuery.trim().toLowerCase()
  const filteredVouchers = vouchers
    .filter(v => statusFilter === 'ALL' || v.status === statusFilter)
    .filter(v => !q || v.code.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('adminVouchers.title')}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Tag}         label={t('adminVouchers.statTotal')}    value={statTotal}    color="bg-orange-500"  />
        <StatCard icon={CheckCircle} label={t('adminVouchers.statActive')}   value={statActive}   color="bg-emerald-500" />
        <StatCard icon={PauseCircle} label={t('adminVouchers.statInactive')} value={statInactive} color="bg-gray-400"    />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">{t('adminVouchers.tableTitle')}</p>
          <AdminSearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t('adminVouchers.searchPh')} />
          <AdminFilterSelect value={statusFilter} onChange={v => setStatusFilter(v as 'ALL' | 'ACTIVE' | 'INACTIVE')} options={STATUS_FILTER_OPTIONS} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus size={15} /> {t('adminVouchers.createBtn')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-4 py-3.5">{t('adminVouchers.col.code')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.name')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.discount')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.condition')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.validity')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.usage')}</th>
                <th className="px-4 py-3.5">{t('adminVouchers.col.status')}</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (<VoucherSkeleton />) : filteredVouchers.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
                      <Tag size={24} className="text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('adminVouchers.empty.title')}</p>
                    <p className="mt-1 text-xs text-gray-400">{t('adminVouchers.empty.desc')}</p>
                  </div>
                </td></tr>
              ) : filteredVouchers.map(v => (
                <tr key={v.id} className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 font-mono">
                      <Tag size={10} /> {v.code}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[140px] truncate">{v.name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {v.discountType === 'PERCENTAGE' ? <Percent size={12} className="text-blue-500" /> : <DollarSign size={12} className="text-emerald-500" />}
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                      </span>
                    </div>
                    {v.maxDiscountAmount && <p className="text-[10px] text-gray-400 mt-0.5">{t('adminVouchers.maxAmount', { amount: formatCurrency(v.maxDiscountAmount) })}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                    {v.minimumOrderValue > 0 ? `≥ ${formatCurrency(v.minimumOrderValue)}` : t('adminVouchers.noLimit')}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={11} />
                      <span>{formatDate(v.startDate)} – {formatDate(v.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Users size={11} />
                      <span>{v.usageCount}{v.usageLimit != null ? ` / ${v.usageLimit}` : ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => setEditingVoucher(v)}
                        title="Chỉnh sửa"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 transition"
                      >
                        <Pencil size={13} />
                      </button>
                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggle(v.id)}
                        disabled={togglingId === v.id}
                        title={v.status === 'ACTIVE' ? 'Tạm dừng voucher' : 'Kích hoạt voucher'}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg border transition',
                          v.status === 'ACTIVE'
                            ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 hover:bg-amber-100'
                            : 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-100',
                          togglingId === v.id && 'opacity-50',
                        )}
                      >
                        {togglingId === v.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : v.status === 'ACTIVE' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        title="Xóa voucher"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {deletingId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminTablePagination page={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
      </div>

      {showCreate && (
        <CreateVoucherModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData() }} />
      )}
      {editingVoucher && (
        <EditVoucherModal
          voucher={editingVoucher}
          onClose={() => setEditingVoucher(null)}
          onUpdated={() => { setEditingVoucher(null); loadData() }}
        />
      )}
    </div>
  )
}

export { AdminVouchersPage }
