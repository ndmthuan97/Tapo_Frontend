import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2, Tag, Eye, EyeOff, X } from 'lucide-react'
import { useAdminCategories } from '@/features/admin/hooks/use-admin-categories'
import { StatCard, AdminSearchInput, AdminTablePagination } from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'
import type { CategoryDto, CategoryRequest } from '@/lib/types/catalog/catalog.types'

// ── slug helper ───────────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-')
}

// ── Category Form Modal ───────────────────────────────────────────────────────
function CategoryFormModal({
  initial, onSubmit, onClose, isSubmitting,
}: {
  initial?: CategoryDto
  onSubmit: (data: CategoryRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<CategoryRequest>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    imageUrl: initial?.imageUrl ?? '',
    sortOrder: initial?.sortOrder ?? 0,
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
      <div className="flex flex-col w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {initial ? t('adminCategories.editTitle') : t('adminCategories.createTitle')}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 flex flex-col gap-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>{t('adminCategories.fieldName')} *</label>
              <input required className={inputCls} value={form.name} onChange={(e) => handleName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t('adminCategories.fieldSortOrder')}</label>
              <input type="number" min={0} className={inputCls} value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('adminCategories.fieldSlug')}</label>
            <input className={inputCls} value={form.slug ?? ''}
              onChange={(e) => { setSlugManual(true); setForm((p) => ({ ...p, slug: e.target.value })) }}
              placeholder="auto-generated from name" />
          </div>
          <div>
            <label className={labelCls}>{t('adminCategories.fieldImage')}</label>
            <input type="url" className={inputCls} value={form.imageUrl ?? ''} placeholder="https://..."
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>{t('adminCategories.fieldDescription')}</label>
            <textarea rows={3} className={cn(inputCls, 'resize-none')} value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.isVisible ?? true}
              onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.checked }))}
              className="h-3.5 w-3.5 accent-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300">{t('adminCategories.fieldVisible')}</span>
          </label>
          <div className="flex gap-2.5 shrink-0 pt-1">
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

function AdminCategoriesPage() {
  const { t } = useTranslation()
  const { categories, isLoading, isSubmitting, load, createCategory, updateCategory, deleteCategory } = useAdminCategories()
  const [modal, setModal] = useState<{ open: boolean; editing?: CategoryDto }>({ open: false })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search))
    : categories

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const visible_count = categories.filter((c) => c.isVisible).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('adminCategories.title')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Tag} label={t('adminCategories.statAll')} value={categories.length} color="bg-orange-500" />
        <StatCard icon={Eye} label={t('adminCategories.statVisible')} value={visible_count} color="bg-emerald-500" />
        <StatCard icon={EyeOff} label={t('adminCategories.statHidden')} value={categories.length - visible_count} color="bg-gray-500" />
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">{t('adminCategories.title')}</p>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder={t('adminCategories.searchPlaceholder')} />
          <button onClick={() => setModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200/50 hover:bg-orange-600 transition">
            <Plus size={12} />
            {t('adminCategories.addButton')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">{t('adminCategories.colName')}</th>
                <th className="px-5 py-3.5">{t('adminCategories.colSlug')}</th>
                <th className="px-5 py-3.5 text-center">{t('adminCategories.colOrder')}</th>
                <th className="px-5 py-3.5">{t('adminCategories.colVisible')}</th>
                <th className="px-5 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-orange-500" size={28} /></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-gray-400 text-sm">{t('adminCategories.empty')}</td></tr>
              ) : visible.map((cat) => (
                <tr key={cat.id} className="group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="h-8 w-8 rounded-lg object-cover border border-gray-100 dark:border-white/5 shrink-0" />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15">
                          <Tag size={13} className="text-orange-500" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-center text-gray-500 dark:text-gray-400">{cat.sortOrder}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      cat.isVisible ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', cat.isVisible ? 'bg-emerald-500' : 'bg-gray-400')} />
                      {cat.isVisible ? t('adminCategories.visible') : t('adminCategories.hidden')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal({ open: true, editing: cat })}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">
                        <Pencil size={11} />{t('common.edit')}
                      </button>
                      <button onClick={async () => { if (window.confirm(t('adminCategories.deleteConfirm'))) await deleteCategory(cat.id) }}
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
        <CategoryFormModal
          initial={modal.editing}
          isSubmitting={isSubmitting}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.editing
            ? (data) => updateCategory(modal.editing!.id, data)
            : createCategory}
        />
      )}
    </div>
  )
}

export { AdminCategoriesPage }
