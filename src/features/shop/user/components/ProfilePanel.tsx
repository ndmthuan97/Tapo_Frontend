import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Lock, MapPin, Phone, Mail, Camera, Loader2, Pencil, X, Check, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useProfile } from '@/features/shop/user/hooks/use-profile'
import { useAddresses } from '@/features/shop/user/hooks/use-addresses'
import { AddressFormModal } from '@/features/shop/user/components/AddressFormModal'
import { cn } from '@/lib/utils'
import { DEFAULT_AVATAR } from '@/lib/context/auth-context'
import { uploadImage } from '@/lib/upload'
import { BUCKET_AVATARS } from '@/lib/supabase'
import type { AddressDto } from '@/lib/types/user/user.types'

type Tab = 'profile' | 'security' | 'address'

// ── Shared sub-components ────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="w-40 shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex-1 text-sm text-gray-900 dark:text-gray-100">{children}</div>
    </div>
  )
}

function FieldInput({ value, onChange, type = 'text', placeholder, readOnly, required }: {
  value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean; required?: boolean
}) {
  return (
    <input
      type={type} value={value} placeholder={placeholder} readOnly={readOnly} required={required}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        'w-full max-w-xs rounded-lg border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2',
        readOnly
          ? 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400 cursor-not-allowed'
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c23] text-gray-900 dark:text-gray-100 focus:border-orange-400 focus:ring-orange-400/20',
      )}
    />
  )
}

// ── ProfilePanel ─────────────────────────────────────────────────────────────

function ProfilePanel({
  initialTab = 'profile',
  onTabChange,
}: {
  initialTab?: Tab
  onTabChange?: (t: Tab) => void
} = {}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [isEditing, setIsEditing] = useState(false)

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    onTabChange?.(newTab)
  }

  // Profile
  const { profile, isLoading, isSaving, updateProfile, changePassword } = useProfile()
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  if (profile && !profileForm.fullName) {
    setProfileForm({ fullName: profile.fullName, phoneNumber: profile.phoneNumber ?? '' })
  }

  // Addresses
  const { addresses, isLoading: loadingAddr, isSubmitting, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses()
  const [modal, setModal] = useState<{ open: boolean; editing?: AddressDto }>({ open: false })

  // ── Avatar upload ────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const result = await uploadImage(file, BUCKET_AVATARS, 'avatars')
    setAvatarUploading(false)
    if (result.error) { toast.error(result.error); return }
    const ok = await updateProfile({
      fullName: profile?.fullName ?? '',
      avatarUrl: result.url ?? undefined,
    })
    if (ok) toast.success('Ảnh đại diện đã được cập nhật!')
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  // ── handlers ────────────────────────────────────────────────────────────────

  function handleCancelEdit() {
    setProfileForm({ fullName: profile?.fullName ?? '', phoneNumber: profile?.phoneNumber ?? '' })
    setIsEditing(false)
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await updateProfile({ fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber || undefined })
    if (ok) setIsEditing(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await changePassword(passwordForm)
    if (ok) setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('address.deleteConfirm'))) return
    await deleteAddress(id)
  }

  // ── nav tabs ─────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('profile.tabProfile'), icon: User },
    { id: 'address', label: t('profile.tabAddress'), icon: MapPin },
    { id: 'security', label: t('profile.tabSecurity'), icon: Lock },
  ]

  return (
    <>
      <div className="flex overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm">

        {/* ── Left sidebar ── */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-gray-100 dark:border-white/5">
          <div className="flex flex-col items-center gap-3 px-6 py-8">
            <div className="relative">
              <img
                src={profile?.avatarUrl ?? DEFAULT_AVATAR} alt={profile?.fullName ?? ''}
                className={cn('h-20 w-20 rounded-full object-cover ring-4 ring-orange-100 dark:ring-orange-500/20 transition', avatarUploading && 'opacity-50')}
              />
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600 disabled:opacity-60 transition"
              >
                {avatarUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{profile?.fullName ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5 break-all">{profile?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col border-t border-gray-100 dark:border-white/5 py-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { handleTabChange(id); setIsEditing(false) }}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left',
                  tab === id
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Right content ── */}
        <section className="flex-1 p-8 min-w-0">

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            isLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-orange-400" /></div>
            ) : isEditing ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('profile.infoTitle')}</h2>
                  <button type="button" onClick={handleCancelEdit} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                    <X size={13} /> {t('common.cancel')}
                  </button>
                </div>
                <FieldRow label={t('profile.fullName')}>
                  <FieldInput value={profileForm.fullName} onChange={(v) => setProfileForm((p) => ({ ...p, fullName: v }))} required />
                </FieldRow>
                <FieldRow label={t('profile.email')}><FieldInput value={profile?.email ?? ''} readOnly /></FieldRow>
                <FieldRow label={t('profile.phone')}>
                  <FieldInput type="tel" value={profileForm.phoneNumber} onChange={(v) => setProfileForm((p) => ({ ...p, phoneNumber: v }))} placeholder="0901234567" />
                </FieldRow>
                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:bg-orange-600 disabled:opacity-60">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {t('profile.saveButton')}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('profile.infoTitle')}</h2>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <Pencil size={12} /> {t('profile.editButton')}
                  </button>
                </div>
                <FieldRow label={t('profile.fullName')}><span>{profile?.fullName ?? '—'}</span></FieldRow>
                <FieldRow label={t('profile.email')}>
                  <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{profile?.email ?? '—'}</span>
                </FieldRow>
                <FieldRow label={t('profile.phone')}>
                  <span className={cn('flex items-center gap-1.5', !profile?.phoneNumber && 'text-gray-400 dark:text-gray-500')}>
                    <Phone size={13} className="text-gray-400" />{profile?.phoneNumber ?? '—'}
                  </span>
                </FieldRow>
              </div>
            )
          )}

          {/* ── Addresses tab ── */}
          {tab === 'address' && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('address.pageTitle')}</h2>
                <button
                  onClick={() => setModal({ open: true })}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
                >
                  <Plus size={13} /> {t('address.addButton')}
                </button>
              </div>

              {loadingAddr ? (
                <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-orange-400" /></div>
              ) : addresses.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 py-14 text-center text-gray-400">
                  <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{t('address.empty')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={cn(
                        'rounded-xl border p-4 transition',
                        addr.isDefault
                          ? 'border-orange-300 dark:border-orange-500/40 bg-orange-50/40 dark:bg-orange-500/5'
                          : 'border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-white/2',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <MapPin size={16} className={cn('mt-0.5 shrink-0', addr.isDefault ? 'text-orange-500' : 'text-gray-400')} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">{addr.recipientName}</span>
                              <span className="text-xs text-gray-500">• {addr.phoneNumber}</span>
                              {addr.isDefault && (
                                <span className="flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                                  <Star size={9} fill="currentColor" /> {t('address.default')}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                              {addr.address}, {addr.city}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!addr.isDefault && (
                            <button onClick={() => setDefault(addr.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
                              {t('address.setDefault')}
                            </button>
                          )}
                          <button onClick={() => setModal({ open: true, editing: addr })} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(addr.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('profile.securityTitle')}</h2>
              </div>
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
                <FieldRow key={field} label={t(`profile.${field}`)}>
                  <FieldInput type="password" value={passwordForm[field]} onChange={(v) => setPasswordForm((p) => ({ ...p, [field]: v }))} required />
                </FieldRow>
              ))}
              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:bg-orange-600 disabled:opacity-60">
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  {t('profile.changePasswordButton')}
                </button>
              </div>
            </form>
          )}

        </section>
      </div>

      {/* Address modal */}
      {modal.open && (
        <AddressFormModal
          initial={modal.editing}
          isSubmitting={isSubmitting}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.editing ? (data) => updateAddress(modal.editing!.id, data) : addAddress}
        />
      )}
    </>
  )
}

export { ProfilePanel }
