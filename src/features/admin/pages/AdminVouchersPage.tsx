import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus, ToggleLeft, ToggleRight, Tag, ChevronLeft, ChevronRight,
  Loader2, Percent, DollarSign, Calendar, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'
import { voucherApi, type VoucherDto, type CreateVoucherRequest, type DiscountType } from '@/lib/http/voucher.api'

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY_STATE = (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
      <Tag size={24} className="text-orange-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chưa có voucher nào</p>
    <p className="mt-1 text-xs text-gray-400">Nhấn "+ Tạo voucher" để thêm voucher mới</p>
  </div>
)

// ── Create Voucher Modal ──────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreated: () => void
}

const INITIAL_FORM: CreateVoucherRequest = {
  code: '',
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxDiscountAmount: null,
  minimumOrderValue: 0,
  usageLimit: null,
  startDate: '',
  endDate: '',
}

function CreateVoucherModal({ onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState<CreateVoucherRequest>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateVoucherRequest, string>>>({})

  function set<K extends keyof CreateVoucherRequest>(key: K, value: CreateVoucherRequest[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.code.trim()) e.code = 'Vui lòng nhập mã voucher'
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên voucher'
    if (form.discountValue <= 0) e.discountValue = 'Giá trị giảm phải > 0'
    if (form.discountType === 'PERCENTAGE' && form.discountValue > 100) e.discountValue = 'Phần trăm không vượt quá 100'
    if (!form.startDate) e.startDate = 'Vui lòng chọn ngày bắt đầu'
    if (!form.endDate) e.endDate = 'Vui lòng chọn ngày kết thúc'
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
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
    if (res.success) {
      toast.success('Tạo voucher thành công!')
      onCreated()
    } else {
      toast.error('Lỗi', { description: res.error?.message })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
              <Tag size={16} className="text-orange-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Tạo Voucher mới</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Code + Name */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã voucher *" error={errors.code}>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="VD: SUMMER20"
                className={inputCls(!!errors.code)}
              />
            </Field>
            <Field label="Tên voucher *" error={errors.name}>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="VD: Giảm giá mùa hè"
                className={inputCls(!!errors.name)}
              />
            </Field>
          </div>

          {/* Discount type */}
          <Field label="Loại giảm giá">
            <div className="grid grid-cols-2 gap-2">
              {(['PERCENTAGE', 'FIXED_AMOUNT'] as DiscountType[]).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => set('discountType', t)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    form.discountType === t
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400',
                  )}
                >
                  {t === 'PERCENTAGE' ? <Percent size={14} /> : <DollarSign size={14} />}
                  {t === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                </button>
              ))}
            </div>
          </Field>

          {/* Values */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={form.discountType === 'PERCENTAGE' ? 'Giảm (%) *' : 'Giảm (₫) *'} error={errors.discountValue}>
              <input
                type="number" min={0}
                value={form.discountValue || ''}
                onChange={e => set('discountValue', Number(e.target.value))}
                className={inputCls(!!errors.discountValue)}
              />
            </Field>
            {form.discountType === 'PERCENTAGE' && (
              <Field label="Giảm tối đa (₫)">
                <input
                  type="number" min={0}
                  value={form.maxDiscountAmount ?? ''}
                  onChange={e => set('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Không giới hạn"
                  className={inputCls(false)}
                />
              </Field>
            )}
          </div>

          {/* Min order + usage limit */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Đơn tối thiểu (₫)">
              <input
                type="number" min={0}
                value={form.minimumOrderValue || ''}
                onChange={e => set('minimumOrderValue', Number(e.target.value))}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Số lượt dùng tối đa">
              <input
                type="number" min={0}
                value={form.usageLimit ?? ''}
                onChange={e => set('usageLimit', e.target.value ? Number(e.target.value) : null)}
                placeholder="Không giới hạn"
                className={inputCls(false)}
              />
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày bắt đầu *" error={errors.startDate}>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className={inputCls(!!errors.startDate)}
              />
            </Field>
            <Field label="Ngày kết thúc *" error={errors.endDate}>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className={inputCls(!!errors.endDate)}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Tạo voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Helper sub-components ─────────────────────────────────────────────────────

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

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
      status === 'ACTIVE'
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400')} />
      {status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await voucherApi.adminListAll(page, PAGE_SIZE)
    setIsLoading(false)
    if (res.success && res.data) {
      setVouchers(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    }
  }, [page])

  useEffect(() => { loadData() }, [loadData])

  async function handleToggle(id: string) {
    setTogglingId(id)
    const res = await voucherApi.adminToggleStatus(id)
    setTogglingId(null)
    if (res.success) {
      toast.success('Đã cập nhật trạng thái voucher')
      setVouchers(vs => vs.map(v => v.id === id ? { ...v, status: res.data!.status } : v))
    } else {
      toast.error('Lỗi', { description: res.error?.message })
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Quản lý Voucher</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? '...' : `${totalElements} voucher`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Tạo voucher
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/3">
                {['Mã voucher', 'Tên', 'Giảm giá', 'Điều kiện', 'Thời hạn', 'Lượt dùng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Đang tải...</p>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={8}>{EMPTY_STATE}</td></tr>
              ) : (
                vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/60 dark:hover:bg-white/3 transition-colors">
                    {/* Code */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 font-mono">
                        <Tag size={10} />
                        {v.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[140px] truncate">{v.name}</p>
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {v.discountType === 'PERCENTAGE'
                          ? <Percent size={12} className="text-blue-500" />
                          : <DollarSign size={12} className="text-emerald-500" />
                        }
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {v.discountType === 'PERCENTAGE'
                            ? `${v.discountValue}%`
                            : formatCurrency(v.discountValue)
                          }
                        </span>
                      </div>
                      {v.maxDiscountAmount && (
                        <p className="text-[10px] text-gray-400 mt-0.5">tối đa {formatCurrency(v.maxDiscountAmount)}</p>
                      )}
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {v.minimumOrderValue > 0 ? `≥ ${formatCurrency(v.minimumOrderValue)}` : 'Không giới hạn'}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={11} />
                        <span>{formatDate(v.startDate)} – {formatDate(v.endDate)}</span>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Users size={11} />
                        <span>
                          {v.usageCount}
                          {v.usageLimit != null ? ` / ${v.usageLimit}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Toggle action */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggle(v.id)}
                        disabled={togglingId === v.id}
                        title={v.status === 'ACTIVE' ? 'Tạm dừng voucher' : 'Kích hoạt voucher'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 transition-colors disabled:opacity-40"
                      >
                        {togglingId === v.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : v.status === 'ACTIVE'
                            ? <ToggleRight size={18} className="text-emerald-500" />
                            : <ToggleLeft size={18} />
                        }
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3">
            <p className="text-xs text-gray-400">
              Trang {page + 1} / {totalPages} · {totalElements} voucher
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i} onClick={() => setPage(i)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all',
                    i === page ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500',
                  )}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateVoucherModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadData() }}
        />
      )}
    </div>
  )
}

export { AdminVouchersPage }
