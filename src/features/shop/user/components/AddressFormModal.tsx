import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Loader2 } from 'lucide-react'
import { useVietnamAddress } from '@/features/shop/user/hooks/use-vietnam-address'
import { cn } from '@/lib/utils'
import type { AddressDto, AddressRequest } from '@/lib/types/user/user.types'

const EMPTY_FORM = { recipientName: '', phoneNumber: '', address: '' }

interface Props {
  initial?: AddressDto
  onSubmit: (data: AddressRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}

function SelectField({
  label, value, onChange, options, disabled, loading, placeholder,
}: {
  label: string
  value: number | ''
  onChange: (code: number) => void
  options: { code: number; name: string }[]
  disabled?: boolean
  loading?: boolean
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-full appearance-none rounded-xl border px-4 py-2.5 pr-8 text-sm transition focus:outline-none focus:ring-2',
            disabled
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-white/5 dark:bg-white/5'
              : 'border-gray-200 bg-white text-gray-900 focus:border-orange-400 focus:ring-orange-100 dark:border-white/10 dark:bg-[#1a1c23] dark:text-gray-100',
          )}
        >
          <option value="">{loading ? 'Đang tải...' : placeholder}</option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>{o.name}</option>
          ))}
        </select>
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-400" />
        )}
      </div>
    </label>
  )
}

export function AddressFormModal({ initial, onSubmit, onClose, isSubmitting }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial ? { recipientName: initial.recipientName, phoneNumber: initial.phoneNumber, address: initial.address } : {}) })
  const addr = useVietnamAddress()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.selectedProvince) return

    const city     = addr.selectedProvince.name
    const district = addr.selectedDistrict?.name ?? ''

    const ok = await onSubmit({
      recipientName: form.recipientName,
      phoneNumber:   form.phoneNumber,
      address:       form.address,
      district,
      city,
    })
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-6 py-4 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {initial ? t('address.editTitle') : t('address.addTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-6">
          {/* Recipient & phone */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address.recipientName')}</span>
            <input
              type="text" required value={form.recipientName}
              onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c23] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address.phone')}</span>
            <input
              type="tel" required value={form.phoneNumber}
              onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c23] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {/* Province / District / Ward */}
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
            placeholder="Chọn phường / xã"
          />

          {/* Street address */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address.street')}</span>
            <input
              type="text" required value={form.address}
              placeholder="Số nhà, tên đường..."
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c23] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1 shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !addr.selectedProvince}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
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
