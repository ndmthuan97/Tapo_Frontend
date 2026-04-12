import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText, Eye, Trash2, Search, X, ImageOff,
  Globe, Clock, CheckCircle2,
  EyeIcon, Plus, Pencil, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { blogApi, type BlogPostDto, type BlogCategoryDto } from '@/lib/http/blog.api'
import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import { StatCard, AdminTablePagination } from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogPostRequest {
  title: string
  slug: string
  thumbnailUrl: string
  excerpt: string
  content: string
  categoryId: string
  metaTitle: string
  metaDescription: string
  publish: boolean
}

// ── Admin Blog API ────────────────────────────────────────────────────────────

const blogAdminApi = {
  getAllAdmin(page: number, size: number) {
    return apiCall<{ content: BlogPostDto[]; totalPages: number; totalElements: number }>(
      httpClient.get<ApiResponse<{ content: BlogPostDto[]; totalPages: number; totalElements: number }>>(
        '/api/blog/admin', { params: { page, size } }
      )
    )
  },
  createPost(data: BlogPostRequest) {
    return apiCall<BlogPostDto>(httpClient.post<ApiResponse<BlogPostDto>>('/api/blog', data))
  },
  updatePost(id: string, data: BlogPostRequest) {
    return apiCall<BlogPostDto>(httpClient.put<ApiResponse<BlogPostDto>>(`/api/blog/${id}`, data))
  },
  togglePublish(id: string) {
    return apiCall<BlogPostDto>(httpClient.patch<ApiResponse<BlogPostDto>>(`/api/blog/${id}/publish`, {}))
  },
  deletePost(id: string) {
    return apiCall<void>(httpClient.delete<ApiResponse<void>>(`/api/blog/${id}`))
  },
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BlogSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-16 rounded-lg bg-gray-100 dark:bg-white/5 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-48 rounded bg-gray-100 dark:bg-white/5" />
                <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-14 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5">
            <div className="flex justify-end gap-1">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ── Blog Form Modal ───────────────────────────────────────────────────────────

function BlogFormModal({
  initial, categories, onSubmit, onClose, isSubmitting,
}: {
  initial?: BlogPostDto
  categories: BlogCategoryDto[]
  onSubmit: (data: BlogPostRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<BlogPostRequest>({
    title:           initial?.title           ?? '',
    slug:            initial?.slug            ?? '',
    thumbnailUrl:    initial?.thumbnailUrl     ?? '',
    excerpt:         initial?.excerpt          ?? '',
    content:         initial?.content          ?? '',
    categoryId:      '',
    metaTitle:       initial?.metaTitle        ?? '',
    metaDescription: initial?.metaDescription  ?? '',
    publish:         !!initial?.publishedAt,
  })

  // auto-generate slug from title (only when creating)
  function handleTitleChange(title: string) {
    setForm(p => ({
      ...p,
      title,
      ...(initial ? {} : {
        slug: title.toLowerCase()
          .replace(/[àáạảãăắặẳẵâấậẩẫ]/g, 'a')
          .replace(/[èéẹẻẽêếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôốộổỗơớợởỡ]/g, 'o')
          .replace(/[ùúụủũưứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim().replace(/\s+/g, '-'),
      }),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await onSubmit(form)
    if (ok) onClose()
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {initial ? t('adminBlog.form.editTitle') : t('adminBlog.form.createTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            {/* Title */}
            <div className="col-span-2">
              <label className={labelCls}>{t('adminBlog.form.titleLabel')}</label>
              <input required className={inputCls} value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder={t('adminBlog.form.titlePh')} />
            </div>

            {/* Slug */}
            <div className="col-span-2">
              <label className={labelCls}>{t('adminBlog.form.slug')}</label>
              <input required className={cn(inputCls, 'font-mono text-[11px]')} value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder={t('adminBlog.form.slugPh')} />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>{t('adminBlog.form.category')}</label>
              <select required className={inputCls} value={form.categoryId}
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">{t('adminBlog.form.selectCat')}</option>
                {categories.map(c => (
                  <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className={labelCls}>{t('adminBlog.form.thumbnail')}</label>
              <input type="url" className={inputCls} value={form.thumbnailUrl}
                onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder={t('adminBlog.form.thumbnailPh')} />
            </div>

            {/* Excerpt */}
            <div className="col-span-2">
              <label className={labelCls}>{t('adminBlog.form.excerpt')}</label>
              <textarea rows={2} className={cn(inputCls, 'resize-none')} value={form.excerpt}
                onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                placeholder={t('adminBlog.form.excerptPh')} />
            </div>

            {/* Content */}
            <div className="col-span-2">
              <label className={labelCls}>{t('adminBlog.form.content')}</label>
              <textarea required rows={6} className={cn(inputCls, 'resize-y')} value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder={t('adminBlog.form.contentPh')} />
            </div>

            {/* Meta Title */}
            <div>
              <label className={labelCls}>{t('adminBlog.form.metaTitle')}</label>
              <input className={inputCls} value={form.metaTitle}
                onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
                placeholder={t('adminBlog.form.metaTitlePh')} />
            </div>

            {/* Meta Desc */}
            <div>
              <label className={labelCls}>{t('adminBlog.form.metaDesc')}</label>
              <input className={inputCls} value={form.metaDescription}
                onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                placeholder={t('adminBlog.form.metaDescPh')} />
            </div>

            {/* Publish toggle */}
            <div className="col-span-2 flex items-center gap-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-4 py-3">
              <div
                onClick={() => setForm(p => ({ ...p, publish: !p.publish }))}
                className={cn('relative h-5 w-9 rounded-full transition-colors cursor-pointer shrink-0',
                  form.publish ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10')}
              >
                <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  form.publish && 'translate-x-4')} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {form.publish ? t('adminBlog.form.publishNow') : t('adminBlog.form.saveDraft')}
                </p>
                <p className="text-[10px] text-gray-400">
                  {form.publish ? t('adminBlog.form.pubDesc') : t('adminBlog.form.draftDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 pt-1 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              {t('adminBlog.form.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition">
              {isSubmitting && <Loader2 size={12} className="animate-spin" />}
              {initial ? t('adminBlog.form.save') : t('adminBlog.form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Blog Detail Modal ─────────────────────────────────────────────────────────

function BlogDetailModal({ post, onClose }: { post: BlogPostDto; onClose: () => void }) {
  const { t } = useTranslation()
  const isPublished = !!post.publishedAt
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('adminBlog.detail.title')}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {post.thumbnailUrl ? (
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-white/5">
              <img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h2 className="text-lg font-bold text-white leading-snug line-clamp-2">{post.title}</h2>
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
              <ImageOff size={32} className="text-gray-200 dark:text-white/10" />
            </div>
          )}
          <div className="p-5 space-y-4">
            {!post.thumbnailUrl && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{post.title}</h2>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                isPublished
                  ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
              )}>
                {isPublished ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                {isPublished ? t('adminBlog.detail.published') : t('adminBlog.detail.draft')}
              </span>
              {post.categoryName && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {post.categoryName}
                </span>
              )}
              {post.authorName && (
                <span className="text-xs text-gray-400">{t('adminBlog.detail.author')}<span className="font-medium text-gray-600 dark:text-gray-300">{post.authorName}</span></span>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <EyeIcon size={12} /> {t('adminBlog.detail.views', { count: post.viewCount.toLocaleString() })}
              </span>
            </div>
            {post.excerpt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic border-l-2 border-orange-400 pl-3">{post.excerpt}</p>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">{t('adminBlog.detail.content')}</p>
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-52 overflow-y-auto">
                {post.content || <span className="text-gray-300 italic">{t('adminBlog.detail.noContent')}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-gray-400 font-mono">
              <span>Slug: <span className="text-gray-600 dark:text-gray-300">{post.slug}</span></span>
              <span>ID: <span className="text-gray-600 dark:text-gray-300">{String(post.id)}</span></span>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          {post.slug && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 transition">
              <Globe size={12} /> {t('adminBlog.detail.viewSite')}
            </a>
          )}
          <button onClick={onClose}
            className="ml-auto rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            {t('adminBlog.detail.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ publishedAt }: { publishedAt: string | null }) {
  const { t } = useTranslation()
  if (publishedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 size={10} /> {t('adminBlog.status.published')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
      <Clock size={10} /> {t('adminBlog.status.draft')}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function AdminBlogPage() {
  const { t } = useTranslation()
  const [posts, setPosts]           = useState<BlogPostDto[]>([])
  const [categories, setCategories] = useState<BlogCategoryDto[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage]             = useState(0)
  const [search, setSearch]         = useState('')
  const [isLoading, setIsLoading]   = useState(true)
  // ── Global stat totals ──────────────────────────────────────────────────
  const [statPublished, setStatPublished] = useState(0)
  const [statDrafts,    setStatDrafts]    = useState(0)
  const [statViews,     setStatViews]     = useState(0)

  const [detailPost,   setDetailPost]   = useState<BlogPostDto | null>(null)
  const [editingPost,  setEditingPost]  = useState<BlogPostDto | undefined>(undefined)
  const [showForm,     setShowForm]     = useState(false)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      // Fetch published and draft counts in one page-1 call each
      // Blog API supports ?published=true filter if available; otherwise fetch all
      const [publishedRes, draftRes] = await Promise.all([
        blogAdminApi.getAllAdmin(0, 1000), // fetch up to 1000 for now; replace with dedicated endpoint if available
        Promise.resolve(null),
      ])
      if (publishedRes.data) {
        const allPosts   = publishedRes.data.content
        setStatPublished(allPosts.filter(p => !!p.publishedAt).length)
        setStatDrafts(allPosts.filter(p => !p.publishedAt).length)
        setStatViews(allPosts.reduce((sum, p) => sum + p.viewCount, 0))
      }
      void draftRes
    } catch { /* ignore */ }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [postsRes, catsRes] = await Promise.all([
      blogAdminApi.getAllAdmin(page, PAGE_SIZE),
      blogApi.getCategories(),
    ])
    if (postsRes.data) {
      setPosts(postsRes.data.content)
      setTotalPages(postsRes.data.totalPages)
      setTotalItems(postsRes.data.totalElements)
    }
    if (catsRes.data) setCategories(catsRes.data)
    setIsLoading(false)
  }, [page])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadData()  }, [loadData])

  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.authorName ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : posts

  async function handleSubmit(data: BlogPostRequest): Promise<boolean> {
    setIsSubmitting(true)
    let success = false
    if (editingPost) {
      const res = await blogAdminApi.updatePost(String(editingPost.id), data)
      if (res.success && res.data) {
        setPosts(prev => prev.map(p => String(p.id) === String(editingPost.id) ? res.data! : p))
        toast.success(t('adminBlog.toast.updated'))
        success = true
      } else {
        toast.error(t('adminBlog.toast.updateFailed'))
      }
    } else {
      const res = await blogAdminApi.createPost(data)
      if (res.success && res.data) {
        setPosts(prev => [res.data!, ...prev])
        setTotalItems(n => n + 1)
        toast.success(t('adminBlog.toast.created'))
        loadStats()
        success = true
      } else {
        toast.error(t('adminBlog.toast.createFailed'))
      }
    }
    setIsSubmitting(false)
    return success
  }

  async function handleTogglePublish(post: BlogPostDto) {
    const res = await blogAdminApi.togglePublish(String(post.id))
    if (res.success && res.data) {
      setPosts(prev => prev.map(p => String(p.id) === String(post.id) ? res.data! : p))
      toast.success(post.publishedAt ? t('adminBlog.toast.drafted') : t('adminBlog.toast.published'))
      loadStats()
    }
  }

  async function handleDelete(post: BlogPostDto) {
    if (!window.confirm(t('adminBlog.confirm.delete', { title: post.title }))) return
    setDeletingId(String(post.id))
    const res = await blogAdminApi.deletePost(String(post.id))
    if (res.success) {
      toast.success(t('adminBlog.toast.deleted'))
      setPosts(prev => prev.filter(p => String(p.id) !== String(post.id)))
      setTotalItems(n => n - 1)
      loadStats()
    } else {
      toast.error(t('adminBlog.toast.deleteFailed'))
    }
    setDeletingId(null)
  }

  function openCreate() { setEditingPost(undefined); setShowForm(true) }
  function openEdit(post: BlogPostDto) { setEditingPost(post); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditingPost(undefined) }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminBlog.title')}</h1>
          <p className="mt-0.5 text-sm text-gray-400">{t('adminBlog.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 shadow-sm shadow-orange-200/50 transition">
            <Plus size={14} /> {t('adminBlog.addBtn')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t('adminBlog.statTotal')}     value={totalItems}    icon={FileText}     color="bg-orange-500" />
        <StatCard label={t('adminBlog.statPublished')} value={statPublished} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label={t('adminBlog.statDrafts')}    value={statDrafts}    icon={Clock}        color="bg-amber-500" />
        <StatCard label={t('adminBlog.statViews')}     value={statViews}    icon={EyeIcon}      color="bg-blue-500" />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1e2028] shadow-sm">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('adminBlog.searchPh')}
              className="h-9 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-9 pr-9 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
                 <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.post')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.category')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.author')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.views')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.status')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('adminBlog.col.publishedAt')}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <BlogSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText size={28} className="mx-auto mb-2 text-gray-200 dark:text-white/10" />
                    <p className="text-sm text-gray-400">{search ? t('adminBlog.empty.noMatch') : t('adminBlog.empty.noPosts')}</p>
                    {!search && (
                      <button onClick={openCreate}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition">
                        <Plus size={13} /> {t('adminBlog.addFirst')}
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map(post => (
                <tr key={String(post.id)} className="group hover:bg-orange-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  {/* Post */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {post.thumbnailUrl ? (
                        <img src={post.thumbnailUrl} alt={post.title}
                          className="h-10 w-16 rounded-lg object-cover border border-gray-100 dark:border-white/5 shrink-0" />
                      ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                          <ImageOff size={14} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[200px]">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{post.categoryName ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{post.authorName ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-xs font-medium text-gray-700 dark:text-gray-300">{post.viewCount.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><StatusBadge publishedAt={post.publishedAt as unknown as string | null} /></td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt as unknown as string).toLocaleDateString('vi-VN')
                      : <span className="text-gray-300">—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailPost(post)} title="Xem chi tiết"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => handleTogglePublish(post)} title={post.publishedAt ? 'Chuyển về nháp' : 'Xuất bản'}
                        className={cn('flex h-7 w-7 items-center justify-center rounded-lg border transition',
                          post.publishedAt
                            ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 hover:bg-amber-100'
                            : 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-100'
                        )}>
                        {post.publishedAt ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                      </button>
                      <button onClick={() => openEdit(post)} title="Chỉnh sửa"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(post)} disabled={deletingId === String(post.id)} title="Xóa bài viết"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {detailPost && <BlogDetailModal post={detailPost} onClose={() => setDetailPost(null)} />}

      {/* Form Modal */}
      {showForm && (
        <BlogFormModal
          initial={editingPost}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={closeForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export { AdminBlogPage }
