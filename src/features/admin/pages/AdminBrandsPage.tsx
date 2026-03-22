import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2, Bookmark, Eye, EyeOff, X, ImageOff } from 'lucide-react'
import { useAdminBrands } from '@/features/admin/hooks/use-admin-brands'
import { StatCard, AdminSearchInput, AdminTablePagination } from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'
import type { BrandDto, BrandRequest } from '@/lib/types/catalog/catalog.types'

// ── slug helper ───────────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-')
}

// ── Brand Form Modal ──────────────────────────────────────────────────────────
function BrandFormModal({
  initial, onSubmit, onClose, isSubmitting,
}: {
  initial?: BrandDto
  onSubmit: (data: BrandRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<BrandRequest>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    logoUrl: initial?.logoUrl ?? '',
    isVisible: initial?.isVisible ?? true,
  })
  const [slugManual, setSlugManual] = useState(!!initial)

  function handleName(name: string) {
    setForm((p) => ({ ...p, name, slug: slugManual ? p.slug : toSlug(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await onSubmit({ ...form, slug: form.slug || undefined })
    if (ok) onClose()
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-md rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {initial ? t('adminBrands.editTitle') : t('adminBrands.createTitle')}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          <div>
            <label className={labelCls}>{t('adminBrands.fieldName')} *</label>
            <input required className={inputCls} value={form.name} onChange={(e) => handleName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('adminBrands.fieldSlug')}</label>
            <input className={inputCls} value={form.slug ?? ''}
              onChange={(e) => { setSlugManual(true); setForm((p) => ({ ...p, slug: e.target.value })) }}
              placeholder="auto-generated from name" />
          </div>
          <div>
            <label className={labelCls}>{t('adminBrands.fieldLogo')}</label>
            <input type="url" className={inputCls} value={form.logoUrl ?? ''} placeholder="https://..."
              onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.isVisible ?? true}
              onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.checked }))}
              className="h-3.5 w-3.5 accent-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300">{t('adminBrands.fieldVisible')}</span>
          </label>
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition">
              {isSubmitting && <Loader2 size={12} className="animate-spin" />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

function AdminBrandsPage() {
  const { t } = useTranslation()
  const { brands, isLoading, isSubmitting, load, createBrand, updateBrand, deleteBrand } = useAdminBrands()
  const [modal, setModal] = useState<{ open: boolean; editing?: BrandDto }>({ open: false })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.includes(search))
    : brands

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const visibleCount = brands.filter((b) => b.isVisible).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('adminBrands.title')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Bookmark} label={t('adminBrands.statAll')} value={brands.length} color="bg-orange-500" />
        <StatCard icon={Eye} label={t('adminBrands.statVisible')} value={visibleCount} color="bg-emerald-500" />
        <StatCard icon={EyeOff} label={t('adminBrands.statHidden')} value={brands.length - visibleCount} color="bg-gray-500" />
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">{t('adminBrands.title')}</p>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder={t('adminBrands.searchPlaceholder')} />
          <button onClick={() => setModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200/50 hover:bg-orange-600 transition">
            <Plus size={12} />
            {t('adminBrands.addButton')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">{t('adminBrands.colName')}</th>
                <th className="px-5 py-3.5">{t('adminBrands.colSlug')}</th>
                <th className="px-5 py-3.5">{t('adminBrands.colVisible')}</th>
                <th className="px-5 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-orange-500" size={28} /></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-400 text-sm">{t('adminBrands.empty')}</td></tr>
              ) : visible.map((brand) => (
                <tr key={brand.id} className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 rounded-lg object-contain border border-gray-100 dark:border-white/5 shrink-0 bg-white" />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                          <ImageOff size={13} className="text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-gray-100">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{brand.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      brand.isVisible ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', brand.isVisible ? 'bg-emerald-500' : 'bg-gray-400')} />
                      {brand.isVisible ? t('adminBrands.visible') : t('adminBrands.hidden')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal({ open: true, editing: brand })}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">
                        <Pencil size={11} />{t('common.edit')}
                      </button>
                      <button onClick={async () => { if (window.confirm(t('adminBrands.deleteConfirm'))) await deleteBrand(brand.id) }}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition">
                        <Trash2 size={11} />{t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {modal.open && (
        <BrandFormModal
          initial={modal.editing}
          isSubmitting={isSubmitting}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.editing
            ? (data) => updateBrand(modal.editing!.id, data)
            : createBrand}
        />
      )}
    </div>
  )
}

export { AdminBrandsPage }
