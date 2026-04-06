import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Package,
  ImageOff,
  X,
  Eye,
  Search,
  ChevronDown,
  Check,
  Link,
  Upload,
  CheckSquare,
  Square,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import { toast } from 'sonner'
import { useAdminProducts } from '@/features/admin/hooks/use-admin-products'
import {
  StatCard,
  AdminSearchInput,
  AdminFilterSelect,
  AdminTablePagination,
} from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'
import { apiCall } from '@/lib/http/http-client'
import { categoryAdminApi, brandAdminApi } from '@/features/admin/api/catalog.api'
import { uploadImage } from '@/lib/upload'
import { BUCKET_PRODUCTS } from '@/lib/supabase'
import type {
  ProductDto,
  ProductRequest,
  ProductStatus,
  SimpleRefDto,
} from '@/lib/types/product/product.types'

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProductStatus, { label: string; dot: string; cls: string }> = {
  ACTIVE:   { label: 'Active',   dot: 'bg-emerald-500', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  INACTIVE: { label: 'Inactive', dot: 'bg-gray-400',    cls: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400' },
  DRAFT:    { label: 'Draft',    dot: 'bg-amber-400',   cls: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' },
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ── SearchableSelect ──────────────────────────────────────────────────────────

interface SearchableSelectProps {
  label: string
  required?: boolean
  value: string
  onChange: (id: string) => void
  options: SimpleRefDto[]
  /** If provided, shows a quick-create button when query has no match */
  onCreate?: (name: string) => Promise<SimpleRefDto | null>
}

function SearchableSelect({ label, required, value, onChange, options, onCreate }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.id === value)
  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 40)
  }

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  async function handleCreate() {
    if (!onCreate || !query.trim()) return
    setIsCreating(true)
    const created = await onCreate(query.trim())
    setIsCreating(false)
    if (created) {
      onChange(created.id)
      setOpen(false)
      setQuery('')
    }
  }

  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'
  const triggerCls =
    'flex-1 flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition cursor-pointer'

  return (
    <div ref={containerRef} className="relative">
      <label className={labelCls}>{label}{required && ' *'}</label>

      <div className="flex gap-1.5">
        <button type="button" className={triggerCls} onClick={handleOpen}>
          <span className={selected ? '' : 'text-gray-400'}>{selected?.name ?? 'Chọn…'}</span>
          <ChevronDown size={12} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
        </button>
        {onCreate && (
          <button
            type="button"
            title="Tạo mới"
            onClick={() => {
              setOpen(true)
              setTimeout(() => inputRef.current?.focus(), 40)
            }}
            className="flex shrink-0 items-center justify-center h-[30px] w-[30px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition"
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-3 py-2">
            <Search size={11} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && filtered.length === 0) handleCreate() }}
            />
          </div>

          {/* Options */}
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400 text-center">Không tìm thấy</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {opt.id === value && <Check size={11} className="text-orange-500" />}
                  </span>
                  {opt.name}
                </button>
              ))
            )}
          </div>

          {/* Quick-create */}
          {onCreate && query.trim() && !options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase()) && (
            <div className="border-t border-gray-100 dark:border-white/5 p-2">
              <button
                type="button"
                disabled={isCreating}
                onClick={handleCreate}
                className="flex w-full items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 disabled:opacity-60 transition"
              >
                {isCreating ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Tạo mới &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── ImageUploader ─────────────────────────────────────────────────────────────
// Lazy-upload: file selections create local object URL previews immediately.
// Actual Supabase upload happens only when the parent form submits successfully.

const MAX_IMAGES = 5

/** Represents one image slot: either a pending local File or a confirmed remote URL */
export type ImageEntry =
  | { kind: 'file'; file: File; previewUrl: string }
  | { kind: 'url';  url: string }

/** Upload all pending file entries to Supabase. Returns resolved entries (all kind:'url'). */
export async function resolveImageEntries(entries: ImageEntry[]): Promise<string[]> {
  const results = await Promise.all(
    entries.map(async (e) => {
      if (e.kind === 'url') return e.url
      const r = await uploadImage(e.file, BUCKET_PRODUCTS, 'products')
      if (r.error) throw new Error(r.error)
      return r.url!
    })
  )
  return results
}

interface ImageUploaderProps {
  entries: ImageEntry[]
  onChange: (entries: ImageEntry[]) => void
}

function ImageUploader({ entries, onChange }: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const available = MAX_IMAGES - entries.length
    const toAdd = files.slice(0, available).map<ImageEntry>((file) => ({
      kind: 'file',
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    onChange([...entries, ...toAdd])
    e.target.value = ''
  }

  function handleAddUrl() {
    const url = urlInput.trim()
    if (!url) return
    const alreadyAdded = entries.some((e) => e.kind === 'url' && e.url === url)
    if (alreadyAdded) { toast.error('URL này đã được thêm'); return }
    if (entries.length >= MAX_IMAGES) { toast.error(`Tối đa ${MAX_IMAGES} ảnh`); return }
    onChange([...entries, { kind: 'url', url }])
    setUrlInput('')
  }

  function handleRemove(idx: number) {
    const removed = entries[idx]
    // Revoke object URL to free memory
    if (removed.kind === 'file') URL.revokeObjectURL(removed.previewUrl)
    onChange(entries.filter((_, i) => i !== idx))
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls}>
          Ảnh sản phẩm
          <span className="ml-1.5 text-gray-400">({entries.length}/{MAX_IMAGES})</span>
          {entries.length > 0 && <span className="ml-1.5 text-orange-400 font-normal">• ảnh đầu là thumbnail</span>}
          {entries.some((e) => e.kind === 'file') && (
            <span className="ml-1.5 text-gray-400 font-normal">• ảnh từ máy sẽ upload khi lưu</span>
          )}
        </label>
        <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden text-[11px]">
          {(['upload', 'url'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={cn('flex items-center gap-1 px-2.5 py-1 transition',
                mode === m ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5')}>
              {m === 'upload' ? <><Upload size={10} /> Từ máy</> : <><Link size={10} /> URL</>}
            </button>
          ))}
        </div>
      </div>

      {mode === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          <button type="button" disabled={entries.length >= MAX_IMAGES}
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-white/10 py-3 text-xs text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <Upload size={13} />
            {entries.length >= MAX_IMAGES ? 'Đã đủ ảnh' : 'Chọn ảnh từ máy — xem trước ngay, upload khi lưu'}
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <input className={inputCls} value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl() } }} />
          <button type="button" disabled={!urlInput.trim() || entries.length >= MAX_IMAGES} onClick={handleAddUrl}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition">
            <Plus size={11} /> Thêm
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {entries.map((entry, idx) => {
            const previewSrc = entry.kind === 'file' ? entry.previewUrl : entry.url
            const isPending  = entry.kind === 'file'
            return (
              <div key={idx} className="relative group">
                <img src={previewSrc} alt="" className={cn('h-16 w-16 rounded-lg object-cover border-2 transition',
                  idx === 0 ? 'border-orange-400' : 'border-gray-200 dark:border-white/10')} />
                {idx === 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-1.5 py-px text-[9px] font-bold text-white whitespace-nowrap">
                    Thumbnail
                  </span>
                )}
                {isPending && (
                  <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 py-px text-center text-[8px] text-white">
                    Chờ upload
                  </span>
                )}
                <button type="button" onClick={() => handleRemove(idx)}
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition">
                  <X size={9} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Product Form Modal ────────────────────────────────────────────────────────

interface FormModalProps {
  initial?: ProductDto
  categories: SimpleRefDto[]
  brands: SimpleRefDto[]
  onSubmit: (data: ProductRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}

function toSlug(s: string) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-')
}

function ProductFormModal({ initial, categories: initialCats, brands: initialBrands, onSubmit, onClose, isSubmitting }: FormModalProps) {
  const { t } = useTranslation()

  // Local mutable copies so newly created items appear immediately
  const [categories, setCategories] = useState<SimpleRefDto[]>(initialCats)
  const [brands, setBrands] = useState<SimpleRefDto[]>(initialBrands)

  // Multi-image: lazy upload — files stored as ImageEntry until form submit
  const [entries, setEntries] = useState<ImageEntry[]>(() => {
    if (!initial?.thumbnailUrl) return []
    return [{ kind: 'url' as const, url: initial.thumbnailUrl }]
  })

  const [form, setForm] = useState<ProductRequest>(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description ?? '',
          categoryId: initial.categoryId,
          brandId: initial.brandId,
          price: initial.price,
          originalPrice: initial.originalPrice ?? undefined,
          stock: initial.stock,
          thumbnailUrl: initial.thumbnailUrl ?? '',
          status: initial.status,
        }
      : {
          name: '', description: '', price: 0, stock: 0, status: 'DRAFT',
          thumbnailUrl: '',
          categoryId: initialCats[0]?.id ?? '',
          brandId: initialBrands[0]?.id ?? '',
        }
  )

  function handleEntriesChange(next: ImageEntry[]) {
    setEntries(next)
    // Sync first entry preview as thumbnailUrl so backend gets something on save
    const first = next[0]
    const previewUrl = first
      ? first.kind === 'url' ? first.url : first.previewUrl
      : ''
    setForm((p) => ({ ...p, thumbnailUrl: previewUrl }))
  }

  const slugManualRef = useRef(!!initial?.slug)

  function handleNameChange(name: string) {
    setForm((p) => ({ ...p, name, slug: slugManualRef.current ? p.slug : toSlug(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Resolve entries: upload pending files to Supabase, get real URLs
    let resolvedUrls: string[] = []
    const hasPendingFiles = entries.some((en) => en.kind === 'file')
    if (hasPendingFiles) {
      try {
        resolvedUrls = await resolveImageEntries(entries)
      } catch (err) {
        toast.error((err as Error).message ?? 'Upload ảnh thất bại')
        return
      }
    } else {
      resolvedUrls = entries.map((en) => (en.kind === 'url' ? en.url : en.previewUrl))
    }
    const thumbnailUrl = resolvedUrls[0] ?? form.thumbnailUrl
    const ok = await onSubmit({ ...form, thumbnailUrl, slug: form.slug || undefined })
    if (ok) onClose()
  }

  async function handleCreateCategory(name: string): Promise<SimpleRefDto | null> {
    const { data, error } = await apiCall(categoryAdminApi.create({ name }))
    if (!data) { toast.error(error?.message ?? 'Tạo danh mục thất bại'); return null }
    const ref: SimpleRefDto = { id: data.id, name: data.name }
    setCategories((prev) => [...prev, ref])
    toast.success(`Đã tạo danh mục "${name}"`)
    return ref
  }

  async function handleCreateBrand(name: string): Promise<SimpleRefDto | null> {
    const { data, error } = await apiCall(brandAdminApi.create({ name }))
    if (!data) { toast.error(error?.message ?? 'Tạo thương hiệu thất bại'); return null }
    const ref: SimpleRefDto = { id: data.id, name: data.name }
    setBrands((prev) => [...prev, ref])
    toast.success(`Đã tạo thương hiệu "${name}"`)
    return ref
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {initial ? t('adminProducts.editTitle') : t('adminProducts.createTitle')}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 flex flex-col gap-3.5">
          {/* Name + Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>{t('adminProducts.fieldName')} *</label>
              <input required className={inputCls} value={form.name}
                onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t('adminProducts.fieldStatus')}</label>
              <select className={inputCls} value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>{t('adminProducts.fieldSlug')}</label>
            <input className={inputCls} value={form.slug ?? ''}
              onChange={(e) => { slugManualRef.current = true; setForm((p) => ({ ...p, slug: e.target.value })) }}
              placeholder="auto-generated from name" />
          </div>

          {/* Category + Brand — searchable with inline quick-create */}
          <div className="grid grid-cols-2 gap-3">
            <SearchableSelect
              label={t('adminProducts.fieldCategory')}
              required
              value={form.categoryId ?? ''}
              onChange={(id) => setForm((p) => ({ ...p, categoryId: id }))}
              options={categories}
              onCreate={handleCreateCategory}
            />
            <SearchableSelect
              label={t('adminProducts.fieldBrand')}
              required
              value={form.brandId ?? ''}
              onChange={(id) => setForm((p) => ({ ...p, brandId: id }))}
              options={brands}
              onCreate={handleCreateBrand}
            />
          </div>

          {/* Price + Original + Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>{t('adminProducts.fieldPrice')} *</label>
              <input required type="number" min={0} className={inputCls} value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div>
              <label className={labelCls}>{t('adminProducts.fieldOriginalPrice')}</label>
              <input type="number" min={0} className={inputCls} value={form.originalPrice ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div>
              <label className={labelCls}>{t('adminProducts.fieldStock')} *</label>
              <input required type="number" min={0} className={inputCls} value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Images — lazy preview, upload to Supabase only on form submit */}
          <ImageUploader entries={entries} onChange={handleEntriesChange} />

          {/* Description */}
          <div>
            <label className={labelCls}>{t('adminProducts.fieldDescription')}</label>
            <textarea rows={3} className={cn(inputCls, 'resize-none')} value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Actions */}
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

// ── Product Detail Modal ──────────────────────────────────────────────────────

function ProductDetailModal({ product, onClose }: { product: ProductDto; onClose: () => void }) {
  const { t } = useTranslation()
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0
  const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:   { label: t('adminProducts.statusActive'),   color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    INACTIVE: { label: t('adminProducts.statusInactive'), color: 'text-gray-500 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-white/10' },
    DRAFT:    { label: t('adminProducts.statusDraft'),    color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-500/15' },
  }
  const badge = STATUS_CFG[product.status] ?? STATUS_CFG.DRAFT
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chi tiết sản phẩm</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex gap-4">
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.name} className="h-24 w-24 rounded-xl object-cover border border-gray-100 dark:border-white/5 shrink-0" />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5"><ImageOff size={24} className="text-gray-300" /></div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 dark:text-white leading-snug">{product.name}</p>
              <p className="mt-0.5 text-[11px] text-gray-400 font-mono truncate">{product.slug}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.color, badge.bg)}>{badge.label}</span>
                <span className="text-xs text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-2 py-0.5">{product.categoryName}</span>
                <span className="text-xs text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-2 py-0.5">{product.brandName}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[{ label: 'Giá bán', value: `${product.price.toLocaleString('vi-VN')}₫`, sub: hasDiscount ? product.originalPrice!.toLocaleString('vi-VN') + '₫' : undefined, cls: 'text-orange-500' },
              { label: 'Tồn kho', value: product.stock.toLocaleString(), cls: product.stock === 0 ? 'text-red-500' : 'text-gray-900 dark:text-white' },
              { label: 'Đã bán', value: (product.soldCount ?? 0).toLocaleString(), cls: 'text-gray-900 dark:text-white' }].map(s => (
              <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-center">
                <p className="text-[10px] text-gray-400 mb-1">{s.label}</p>
                <p className={cn('text-sm font-bold', s.cls)}>{s.value}</p>
                {s.sub && <p className="text-[10px] text-gray-400 line-through">{s.sub}</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-2.5 flex-wrap">
            <div><p className="text-[10px] text-gray-400">Rating</p><p className="text-sm font-bold text-gray-900 dark:text-white">⭐ {product.avgRating?.toFixed(1) ?? '—'}</p></div>
            <div><p className="text-[10px] text-gray-400">Reviews</p><p className="text-sm font-bold text-gray-900 dark:text-white">{(product.reviewCount ?? 0).toLocaleString()}</p></div>
            {hasDiscount && <div><p className="text-[10px] text-gray-400">Giảm</p><p className="text-sm font-bold text-emerald-500">-{discountPct}%</p></div>}
            <div className="ml-auto"><p className="text-[10px] text-gray-400 text-right">Tạo</p><p className="text-[11px] text-gray-500">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</p></div>
          </div>
          {product.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Mô tả</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 rounded-xl p-3">{product.description}</p>
            </div>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Thông số kỹ thuật</p>
              <div className="rounded-xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-3 py-2">
                    <span className="text-xs text-gray-500 shrink-0">{k}</span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right ml-3">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-100 dark:border-white/5 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Đóng</button>
        </div>
      </div>
    </div>
  )
}

// ── Product Skeleton ───────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-4 py-3.5"><div className="h-4 w-4 rounded bg-gray-100 dark:bg-white/5 mx-auto" /></td>
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/5 shrink-0" />
              <div className="space-y-1.5"><div className="h-4 w-36 rounded bg-gray-100 dark:bg-white/5" /><div className="h-3 w-24 rounded bg-gray-100 dark:bg-white/5" /></div>
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5 text-right"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-white/5 ml-auto" /></td>
          <td className="px-5 py-3.5 text-right"><div className="h-4 w-10 rounded bg-gray-100 dark:bg-white/5 ml-auto" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="flex items-center justify-end gap-1"><div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" /><div className="h-7 w-12 rounded-lg bg-gray-100 dark:bg-white/5" /><div className="h-7 w-12 rounded-lg bg-gray-100 dark:bg-white/5" /></div></td>
        </tr>
      ))}
    </>
  )
}


// ── Admin Products Page ────────────────────────────────────────────────────────

function AdminProductsPage() {
  const { t } = useTranslation()
  const {
    products, meta, totalPages, totalItems, isLoading, isSubmitting, params,
    setPage, setSearch, setStatus,
    createProduct, updateProduct, deleteProduct,
    bulkDelete, bulkUpdateStatus,
  } = useAdminProducts()

  const [modal, setModal] = useState<{ open: boolean; editing?: ProductDto }>({ open: false })
  const [searchInput, setSearchInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ProductDto | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  function handleSearch(val: string) {
    setSearchInput(val)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setSearch(val), 350)
  }

  useEffect(() => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }, [])

  async function handleDelete(id: string) {
    if (!window.confirm(t('adminProducts.deleteConfirm'))) return
    await deleteProduct(id)
  }

  // ── Bulk selection helpers ────────────────────────────────────────────────
  const allPageIds = products.map(p => p.id)
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.has(id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(prev => { const next = new Set(prev); allPageIds.forEach(id => next.delete(id)); return next })
    } else {
      setSelectedIds(prev => new Set([...prev, ...allPageIds]))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Xóa ${selectedIds.size} sản phẩm đã chọn?`)) return
    setIsBulkProcessing(true)
    await bulkDelete([...selectedIds])
    setSelectedIds(new Set())
    setIsBulkProcessing(false)
  }

  async function handleBulkStatus(status: ProductStatus) {
    setIsBulkProcessing(true)
    await bulkUpdateStatus([...selectedIds], status)
    setSelectedIds(new Set())
    setIsBulkProcessing(false)
  }

  const currentPage = (params.page ?? 0) + 1

  const STAT_CARDS = [
    { label: t('adminProducts.statAll'),    value: totalItems,                                                           color: 'bg-orange-500', icon: Package },
    { label: t('adminProducts.statActive'), value: products.filter((p) => p.status === 'ACTIVE').length, color: 'bg-emerald-500',  icon: Package },
    { label: t('adminProducts.statDraft'),  value: products.filter((p) => p.status === 'DRAFT').length,  color: 'bg-amber-500',    icon: Package },
  ]

  const STATUS_OPTIONS = [
    { value: '',         label: t('adminProducts.filterAll') },
    { value: 'ACTIVE',   label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DRAFT',    label: 'Draft' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('adminProducts.title')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-auto">{t('adminProducts.title')}</p>
          <AdminSearchInput value={searchInput} onChange={handleSearch} placeholder={t('adminProducts.searchPlaceholder')} />
          <AdminFilterSelect value={params.status ?? ''} onChange={setStatus} options={STATUS_OPTIONS} />
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200/50 hover:bg-orange-600 transition"
          >
            <Plus size={12} />
            {t('adminProducts.addButton')}
          </button>
        </div>

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="flex items-center gap-2 border-b border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 px-5 py-2.5 animate-in slide-in-from-top-1 duration-150">
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 mr-auto">
              Đã chọn {selectedIds.size} sản phẩm
            </span>
            <button
              onClick={() => handleBulkStatus('ACTIVE')}
              disabled={isBulkProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              <ToggleRight size={12} /> Kích hoạt
            </button>
            <button
              onClick={() => handleBulkStatus('INACTIVE')}
              disabled={isBulkProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-50 transition"
            >
              <ToggleLeft size={12} /> Ẩn
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition"
            >
              {isBulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Xóa hàng loạt
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="flex h-7 w-7 items-center justify-center rounded-lg text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition">
              <X size={13} />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                {/* Checkbox select-all */}
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleAll} className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition">
                    {allSelected
                      ? <CheckSquare size={15} className="text-orange-500" />
                      : <Square size={15} />}
                  </button>
                </th>
                <th className="px-5 py-3.5">{t('adminProducts.colProduct')}</th>
                <th className="px-5 py-3.5">{t('adminProducts.colCategory')}</th>
                <th className="px-5 py-3.5">{t('adminProducts.colBrand')}</th>
                <th className="px-5 py-3.5 text-right">{t('adminProducts.colPrice')}</th>
                <th className="px-5 py-3.5 text-right">{t('adminProducts.colStock')}</th>
                <th className="px-5 py-3.5">{t('adminProducts.colStatus')}</th>
                <th className="px-5 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <ProductSkeleton />
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">{t('adminProducts.empty')}</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className={cn('group transition-colors hover:bg-orange-50/60 dark:hover:bg-white/[0.03]', selectedIds.has(p.id) && 'bg-orange-50/40 dark:bg-orange-500/5')}>
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleOne(p.id)} className="flex items-center justify-center text-gray-300 hover:text-orange-500 transition">
                        {selectedIds.has(p.id)
                          ? <CheckSquare size={15} className="text-orange-500" />
                          : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt={p.name}
                            className="h-9 w-9 rounded-lg object-cover border border-gray-100 dark:border-white/5 shrink-0" />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                            <ImageOff size={13} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.categoryName}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.brandName}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 dark:text-gray-100">
                      {p.price.toLocaleString('vi-VN')}₫
                    </td>
                    <td className={cn('px-5 py-3.5 text-right font-medium', p.stock === 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100')}>
                      {p.stock.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailProduct(p)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => setModal({ open: true, editing: p })}

                          className="flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">
                          <Pencil size={11} />{t('common.edit')}
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition">
                          <Trash2 size={11} />{t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminTablePagination page={currentPage} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
      </div>

      {modal.open && (
        <ProductFormModal
          initial={modal.editing}
          categories={meta.categories}
          brands={meta.brands}
          isSubmitting={isSubmitting}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.editing ? (data) => updateProduct(modal.editing!.id, data) : createProduct}
        />
      )}
      {detailProduct && (
        <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />
      )}
    </div>
  )
}

export { AdminProductsPage }
