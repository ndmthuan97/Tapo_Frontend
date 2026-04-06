import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Eye, Trash2, Search, X, ImageOff,
  Globe, Clock, CheckCircle2, RefreshCw, EyeIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { blogApi, type BlogPostDto } from '@/lib/http/blog.api'
import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import { StatCard, AdminTablePagination } from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'

// ── Admin Blog API (CRUD) ──────────────────────────────────────────────────────

const blogAdminApi = {
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
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ── Blog Detail Modal ─────────────────────────────────────────────────────────

function BlogDetailModal({ post, onClose }: { post: BlogPostDto; onClose: () => void }) {
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chi tiết bài viết</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Thumbnail */}
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
            {/* Title (if no thumbnail shown above) */}
            {!post.thumbnailUrl && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{post.title}</h2>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                isPublished
                  ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
              )}>
                {isPublished ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
              {post.categoryName && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {post.categoryName}
                </span>
              )}
              {post.authorName && (
                <span className="text-xs text-gray-400">Tác giả: <span className="font-medium text-gray-600 dark:text-gray-300">{post.authorName}</span></span>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <EyeIcon size={12} /> {post.viewCount.toLocaleString()} lượt xem
              </span>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic border-l-2 border-orange-400 pl-3">
                {post.excerpt}
              </p>
            )}

            {/* Content */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Nội dung</p>
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-52 overflow-y-auto">
                {post.content || <span className="text-gray-300 italic">Không có nội dung</span>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Ngày tạo</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Ngày xuất bản</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>

            {/* SEO section */}
            {(post.metaTitle || post.metaDescription) && (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">SEO</p>
                {post.metaTitle && (
                  <div><p className="text-[10px] text-gray-400">Meta Title</p><p className="text-xs text-gray-600 dark:text-gray-300">{post.metaTitle}</p></div>
                )}
                {post.metaDescription && (
                  <div><p className="text-[10px] text-gray-400">Meta Description</p><p className="text-xs text-gray-600 dark:text-gray-300">{post.metaDescription}</p></div>
                )}
              </div>
            )}

            {/* Slug + ID */}
            <div className="flex flex-col gap-1 text-[11px] text-gray-400 font-mono">
              <span>Slug: <span className="text-gray-600 dark:text-gray-300">{post.slug}</span></span>
              <span>ID: <span className="text-gray-600 dark:text-gray-300">{post.id}</span></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          {post.slug && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 transition"
            >
              <Globe size={12} /> Xem trên website
            </a>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ publishedAt }: { publishedAt: string | null }) {
  if (publishedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 size={10} /> Đã đăng
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
      <Clock size={10} /> Nháp
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostDto[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [detailPost, setDetailPost] = useState<BlogPostDto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await blogApi.getPosts({ page, size: PAGE_SIZE })
    if (res.data) {
      setPosts(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalItems(res.data.totalElements)
    }
    setIsLoading(false)
  }, [page])

  useEffect(() => { loadData() }, [loadData])

  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.authorName ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : posts

  const published = filtered.filter(p => !!p.publishedAt)
  const drafts    = filtered.filter(p => !p.publishedAt)
  const totalViews = filtered.reduce((sum, p) => sum + p.viewCount, 0)

  async function handleDelete(post: BlogPostDto) {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return
    setDeletingId(post.id)
    const res = await blogAdminApi.deletePost(post.id)
    if (res.success) {
      toast.success('Đã xóa bài viết')
      setPosts(prev => prev.filter(p => p.id !== post.id))
    } else {
      toast.error('Xóa thất bại — kiểm tra quyền admin')
    }
    setDeletingId(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý Blog</h1>
          <p className="mt-0.5 text-sm text-gray-400">Xem và quản lý các bài viết trên blog</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tổng bài viết" value={totalItems}       icon={FileText}      color="bg-orange-500" />
        <StatCard label="Đã xuất bản"   value={published.length} icon={CheckCircle2}  color="bg-emerald-500" />
        <StatCard label="Bản nháp"       value={drafts.length}    icon={Clock}         color="bg-amber-500" />
        <StatCard label="Lượt xem"       value={totalViews}       icon={EyeIcon}       color="bg-blue-500" />
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
              placeholder="Tìm tiêu đề hoặc tác giả..."
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
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                {['Bài viết', 'Danh mục', 'Tác giả', 'Lượt xem', 'Trạng thái', 'Ngày đăng', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <BlogSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText size={28} className="mx-auto mb-2 text-gray-200 dark:text-white/10" />
                    <p className="text-sm text-gray-400">{search ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}</p>
                  </td>
                </tr>
              ) : filtered.map(post => (
                <tr key={post.id} className="group hover:bg-orange-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  {/* Post */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl} alt={post.title}
                          className="h-10 w-16 rounded-lg object-cover border border-gray-100 dark:border-white/5 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                          <ImageOff size={14} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[220px]">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[220px]">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    {post.categoryName ?? <span className="text-gray-300">—</span>}
                  </td>
                  {/* Author */}
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    {post.authorName ?? <span className="text-gray-300">—</span>}
                  </td>
                  {/* Views */}
                  <td className="px-5 py-3.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {post.viewCount.toLocaleString()}
                  </td>
                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusBadge publishedAt={post.publishedAt} />
                  </td>
                  {/* Date */}
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                      : <span className="text-gray-300">—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailPost(post)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition"
                        title="Xem chi tiết"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 transition disabled:opacity-50"
                        title="Xóa bài viết"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {detailPost && (
        <BlogDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      )}
    </div>
  )
}

export { AdminBlogPage }
