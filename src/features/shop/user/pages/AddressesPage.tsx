import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MapPin, Star, Pencil, Trash2 } from 'lucide-react'
import { useAddresses } from '@/features/shop/user/hooks/use-addresses'
import { AddressFormModal } from '@/features/shop/user/components/AddressFormModal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import type { AddressDto } from '@/lib/types/user/user.types'

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
            /* ── Skeleton loading thay spinner ── */
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <MapPin size={26} className="text-orange-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">{t('address.empty')}</p>
              <p className="mt-1 text-xs text-gray-400">{t('address.emptyHint', 'Nhấn «Thêm địa chỉ» để thêm địa chỉ đầu tiên')}</p>
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
                          {addr.address}, {addr.city}
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
