import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { useVietnamAddress } from '@/features/shop/user/hooks/use-vietnam-address'
import { cn } from '@/lib/utils'
import type { AddressDto, AddressRequest } from '@/lib/types/user/user.types'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Props {
  initial?: AddressDto
  onSubmit: (data: AddressRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}

interface SelectFieldProps {
  label: string
  value: number | ''
  onChange: (code: number) => void
  options: { code: number; name: string }[]
  disabled?: boolean
  loading?: boolean
  placeholder: string
}

/* ─────────────────────────────────────────
   Sub-components (Single Responsibility)
───────────────────────────────────────── */

/** Text / Tel input field */
function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
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

/** Vietnam address dropdown (province / district / ward) */
function SelectField({ label, value, onChange, options, disabled, loading, placeholder }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-full appearance-none rounded-xl border px-4 py-2.5 pr-9 text-sm transition focus:outline-none focus:ring-2',
            disabled || loading
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'
              : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-orange-400 focus:bg-white focus:ring-orange-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-100',
          )}
        >
          <option value="" className="text-gray-400">
            {loading ? 'Đang tải...' : placeholder}
          </option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>{o.name}</option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading
            ? <Loader2 size={14} className="animate-spin text-orange-400" />
            : <ChevronDown size={14} />
          }
        </span>
      </div>
    </label>
  )
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export function AddressFormModal({ initial, onSubmit, onClose, isSubmitting }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    recipientName: initial?.recipientName ?? '',
    phoneNumber:   initial?.phoneNumber   ?? '',
    address:       initial?.address       ?? '',
  })
  const addr = useVietnamAddress()

  const patch = (key: keyof typeof form) => (value: string) =>
    setForm((p) => ({ ...p, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.selectedProvince) return

    const ok = await onSubmit({
      recipientName: form.recipientName,
      phoneNumber:   form.phoneNumber,
      address:       form.address,
      district:      addr.selectedDistrict?.name ?? '',
      city:          addr.selectedProvince.name,
    })
    if (ok) onClose()
  }

  const canSubmit = !isSubmitting && !!addr.selectedProvince && !!addr.selectedDistrict

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-[#21232d]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {initial ? t('address.editTitle') : t('address.addTitle')}
          </h3>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-6">

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

          <SelectField
            label={t('address.city')}
            value={addr.selectedProvince?.code ?? ''}
            onChange={addr.pickProvince}
            options={addr.provinces}
            loading={addr.loadingProvinces}
            placeholder="Chọn tỉnh / thành phố"
          />

          <SelectField
            label={t('address.district')}
            value={addr.selectedDistrict?.code ?? ''}
            onChange={addr.pickDistrict}
            options={addr.districts}
            disabled={!addr.selectedProvince}
            loading={addr.loadingDistricts}
            placeholder="Chọn quận / huyện"
          />

          <SelectField
            label={t('address.ward')}
            value={addr.selectedWard?.code ?? ''}
            onChange={addr.pickWard}
            options={addr.wards}
            disabled={!addr.selectedDistrict}
            loading={addr.loadingWards}
            placeholder="Chọn phường / xã (tuỳ chọn)"
          />

          <InputField
            label={t('address.street')}
            value={form.address}
            onChange={patch('address')}
            placeholder="Số nhà, tên đường..."
          />

          {/* Actions */}
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
