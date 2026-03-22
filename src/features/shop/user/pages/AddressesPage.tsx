import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MapPin, Star, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { useAddresses } from '@/features/shop/user/hooks/use-addresses'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import type { AddressDto, AddressRequest } from '@/lib/types/user/user.types'

const EMPTY_FORM: AddressRequest = {
  recipientName: '',
  phoneNumber: '',
  address: '',
  district: '',
  city: '',
}

function AddressFormModal({
  initial,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  initial?: AddressDto
  onSubmit: (data: AddressRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<AddressRequest>(
    initial
      ? { recipientName: initial.recipientName, phoneNumber: initial.phoneNumber, address: initial.address, district: initial.district, city: initial.city }
      : EMPTY_FORM,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await onSubmit(form)
    if (ok) onClose()
  }

  const fields: { key: keyof AddressRequest; label: string; type?: string }[] = [
    { key: 'recipientName', label: t('address.recipientName') },
    { key: 'phoneNumber', label: t('address.phone'), type: 'tel' },
    { key: 'address', label: t('address.street') },
    { key: 'district', label: t('address.district') },
    { key: 'city', label: t('address.city') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            {initial ? t('address.editTitle') : t('address.addTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {fields.map(({ key, label, type }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
              <input
                type={type ?? 'text'}
                required
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
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

function AddressesPage() {
  const { t } = useTranslation()
  const { addresses, isLoading, isSubmitting, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses()
  const [modal, setModal] = useState<{ open: boolean; editing?: AddressDto }>({ open: false })

  async function handleDelete(id: string) {
    if (!window.confirm(t('address.deleteConfirm'))) return
    await deleteAddress(id)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-white py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('address.pageTitle')}</h1>
              <p className="text-sm text-gray-500">{t('address.pageSubtitle')}</p>
            </div>
            <button
              onClick={() => setModal({ open: true })}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
            >
              <Plus size={16} /> {t('address.addButton')}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-orange-400" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
              <MapPin size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t('address.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={cn(
                    'rounded-2xl border bg-white p-5 shadow-sm transition',
                    addr.isDefault ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className={cn('mt-0.5 shrink-0', addr.isDefault ? 'text-orange-500' : 'text-gray-400')} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">{addr.recipientName}</span>
                          <span className="text-sm text-gray-500">• {addr.phoneNumber}</span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                              <Star size={10} fill="currentColor" /> {t('address.default')}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {addr.address}, {addr.district}, {addr.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefault(addr.id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-50"
                        >
                          {t('address.setDefault')}
                        </button>
                      )}
                      <button
                        onClick={() => setModal({ open: true, editing: addr })}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {modal.open && (
        <AddressFormModal
          initial={modal.editing}
          isSubmitting={isSubmitting}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.editing
            ? (data) => updateAddress(modal.editing!.id, data)
            : addAddress
          }
        />
      )}
    </>
  )
}

export { AddressesPage }
