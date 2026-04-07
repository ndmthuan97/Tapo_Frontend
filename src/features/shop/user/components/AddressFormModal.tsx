import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Loader2, ChevronDown, Search, AlertCircle } from 'lucide-react'
import { useVietnamAddress } from '@/features/shop/user/hooks/use-vietnam-address'
import { cn } from '@/lib/utils'
import type { AddressDto, AddressRequest } from '@/lib/types/user/user.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initial?: AddressDto
  onSubmit: (data: AddressRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}

interface ComboboxOption { code: number; name: string }

interface ComboboxProps {
  label: string
  value: number | null
  onChange: (code: number) => void
  options: ComboboxOption[]
  disabled?: boolean
  loading?: boolean
  placeholder: string
  required?: boolean
}

// ─── LocationCombobox ─────────────────────────────────────────────────────────

function LocationCombobox({
  label, value, onChange, options,
  disabled, loading, placeholder, required,
}: ComboboxProps) {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const containerRef        = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.code === value)
  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  /* Close when clicking outside */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  /* Focus search input when open */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function handleSelect(code: number) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  const isDisabled = disabled || loading

  return (
    <div ref={containerRef} className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-orange-500">*</span>}
      </span>

      {/* Trigger button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition',
          'focus:outline-none focus:ring-2',
          isDisabled
            ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 dark:border-white/5 dark:bg-white/5 dark:text-white/20'
            : open
            ? 'border-orange-400 bg-white text-gray-900 ring-2 ring-orange-100 dark:bg-[#1a1c23] dark:text-white dark:ring-orange-500/20'
            : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:border-white/20',
        )}
      >
        <span className={cn('truncate', !selected && 'text-gray-400 dark:text-gray-500')}>
          {selected ? selected.name : placeholder}
        </span>
        <span className="ml-2 shrink-0">
          {loading
            ? <Loader2 size={14} className="animate-spin text-orange-400" />
            : <ChevronDown size={14} className={cn('transition-transform text-gray-400', open && 'rotate-180')} />
          }
        </span>
      </button>

      {/* Floating dropdown */}
      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border shadow-2xl',
          'border-gray-200 bg-white dark:border-white/10 dark:bg-[#21232d]',
        )}>
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-white/5">
            <Search size={13} className="shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-center text-sm text-gray-400">Không tìm thấy</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => handleSelect(o.code)}
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-left text-sm transition',
                    o.code === value
                      ? 'bg-orange-50 font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5',
                  )}
                >
                  {o.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── InputField ───────────────────────────────────────────────────────────────

function InputField({
  label, type = 'text', value, onChange, placeholder, required = true,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-orange-500">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl border px-4 py-2.5 text-sm transition',
          'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400',
          'dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500',
          'focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100',
          'dark:focus:bg-[#1a1c23] dark:focus:ring-orange-500/20',
        )}
      />
    </label>
  )
}

// ─── AddressFormModal ─────────────────────────────────────────────────────────
// Cấu trúc địa chỉ 2 cấp (sau sát nhập VN 2025):
//   Tên → SĐT → Địa chỉ (số nhà + đường + phường/xã) → Tỉnh/TP

export function AddressFormModal({ initial, onSubmit, onClose, isSubmitting }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    recipientName: initial?.recipientName ?? '',
    phoneNumber:   initial?.phoneNumber   ?? '',
    address:       initial?.address       ?? '',
  })
  const addr = useVietnamAddress()

  // Pre-fill province when editing an existing address (runs once on provinces loaded)
  const initialized = useRef(false)
  useEffect(() => {
    if (!initial || initialized.current || addr.provinces.length === 0) return
    initialized.current = true
    addr.initAddress(initial.city)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr.provinces.length])  // fire when province list becomes available

  const patch = (key: keyof typeof form) => (value: string) =>
    setForm((p) => ({ ...p, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.selectedProvince) return

    // Compose full address: user-typed street + ward name + province
    const wardSuffix = addr.selectedWard ? `, ${addr.selectedWard.name}` : ''
    const fullAddress = form.address.trim() + wardSuffix

    const ok = await onSubmit({
      recipientName: form.recipientName,
      phoneNumber:   form.phoneNumber,
      address:       fullAddress,
      city:          addr.selectedProvince.name,
    })
    if (ok) onClose()
  }

  const canSubmit = !isSubmitting && !!addr.selectedProvince && form.recipientName.trim() && form.phoneNumber.trim() && form.address.trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-[#21232d]">

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {initial ? t('address.editTitle') : t('address.addTitle')}
          </h3>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 overflow-y-auto p-6">

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('address.recipientName')}
              value={form.recipientName}
              onChange={patch('recipientName')}
              placeholder="Họ và tên người nhận"
            />

            <InputField
              label={t('address.phone')}
              type="tel"
              value={form.phoneNumber}
              onChange={patch('phoneNumber')}
              placeholder="0912 345 678"
            />
          </div>

          {/* Province / City */}
          {addr.errorProvinces && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>Không tải được danh sách tỉnh thành. Vui lòng thử lại.</span>
            </div>
          )}

          <div className="relative">
            <LocationCombobox
              label={t('address.city')}
              value={addr.selectedProvince?.code ?? null}
              onChange={addr.pickProvince}
              options={addr.provinces}
              loading={addr.loadingProvinces}
              placeholder="Chọn tỉnh / thành phố"
              required
            />
          </div>

          {/* Ward / Commune — directly under province (no district level) */}
          <div className="relative">
            <LocationCombobox
              label={t('address.ward')}
              value={addr.selectedWard?.code ?? null}
              onChange={addr.pickWard}
              options={addr.wards}
              disabled={!addr.selectedProvince}
              loading={addr.loadingWards}
              placeholder="Chọn phường / xã (tuỳ chọn)"
            />
          </div>

          {/* Street address — số nhà + tên đường */}
          <InputField
            label={t('address.street')}
            value={form.address}
            onChange={patch('address')}
            placeholder="Số nhà, tên đường..."
          />

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
