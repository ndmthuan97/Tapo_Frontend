import { useState, useCallback, useEffect } from 'react'
import {
  ImageIcon, Plus, Pencil, Trash2, Eye, EyeOff,
  X, Loader2, Link as LinkIcon, RefreshCw, Monitor,
} from 'lucide-react'
import { toast } from 'sonner'
import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import { StatCard, AdminTablePagination } from '@/features/admin/components/AdminShared'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BannerDto {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  position: number
  isActive: boolean
  createdAt: string
}

export interface BannerRequest {
  title: string
  imageUrl: string
  linkUrl?: string
  position: number
  isActive: boolean
}

// ── API ───────────────────────────────────────────────────────────────────────

const bannerApi = {
  list: () =>
    apiCall<BannerDto[]>(httpClient.get<ApiResponse<BannerDto[]>>('/api/banners/admin')),
  create: (data: BannerRequest) =>
    apiCall<BannerDto>(httpClient.post<ApiResponse<BannerDto>>('/api/banners', data)),
  update: (id: string, data: BannerRequest) =>
    apiCall<BannerDto>(httpClient.put<ApiResponse<BannerDto>>(`/api/banners/${id}`, data)),
  delete: (id: string) =>
    apiCall<void>(httpClient.delete<ApiResponse<void>>(`/api/banners/${id}`)),
  toggleActive: (id: string, isActive: boolean) =>
    apiCall<BannerDto>(httpClient.patch<ApiResponse<BannerDto>>(`/api/banners/${id}/active`, { isActive })),
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BannerSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-white/5">
          <td className="px-5 py-3.5">
            <div className="h-12 w-20 rounded-lg bg-gray-100 dark:bg-white/5" />
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-36 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-48 rounded bg-gray-100 dark:bg-white/5" /></td>
          <td className="px-5 py-3.5"><div className="h-4 w-12 rounded bg-gray-100 dark:bg-white/5 mx-auto" /></td>
          <td className="px-5 py-3.5"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
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

// ── Form Modal ────────────────────────────────────────────────────────────────

function BannerFormModal({
  initial, onSubmit, onClose, isSubmitting,
}: {
  initial?: BannerDto
  onSubmit: (data: BannerRequest) => Promise<boolean>
  onClose: () => void
  isSubmitting: boolean
}) {
  const [form, setForm] = useState<BannerRequest>({
    title: initial?.title ?? '',
    imageUrl: initial?.imageUrl ?? '',
    linkUrl: initial?.linkUrl ?? '',
    position: initial?.position ?? 0,
    isActive: initial?.isActive ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await onSubmit({ ...form, linkUrl: form.linkUrl || undefined })
    if (ok) onClose()
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col w-full max-w-lg rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {initial ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          {/* Title */}
          <div>
            <label className={labelCls}>Tiêu đề *</label>
            <input
              required
              className={inputCls}
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ví dụ: Banner khuyến mãi hè"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className={labelCls}>URL hình ảnh *</label>
            <input
              required
              type="url"
              className={inputCls}
              value={form.imageUrl}
              onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="mt-2 h-28 w-full rounded-lg object-cover border border-gray-100 dark:border-white/5"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className={labelCls}>Đường dẫn khi click (tuỳ chọn)</label>
            <input
              type="url"
              className={inputCls}
              value={form.linkUrl}
              onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Position */}
            <div>
              <label className={labelCls}>Thứ tự hiển thị</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.position}
                onChange={e => setForm(p => ({ ...p, position: Number(e.target.value) }))}
              />
            </div>

            {/* Active */}
            <div>
              <label className={labelCls}>Trạng thái</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                <div
                  onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors cursor-pointer',
                    form.isActive ? 'bg-orange-500' : 'bg-gray-200 dark:bg-white/10',
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                    form.isActive && 'translate-x-4',
                  )} />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {form.isActive ? 'Hiển thị' : 'Ẩn'}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition">
              {isSubmitting && <Loader2 size={12} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function BannerPreviewModal({ banner, onClose }: { banner: BannerDto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#21232d] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{banner.title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"><X size={15} /></button>
        </div>
        <img src={banner.imageUrl} alt={banner.title} className="w-full object-cover max-h-80" />
        <div className="px-5 py-4 space-y-2">
          {banner.linkUrl && (
            <div className="flex items-center gap-2 text-xs">
              <LinkIcon size={12} className="text-orange-500 shrink-0" />
              <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline truncate">{banner.linkUrl}</a>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Thứ tự: <span className="font-semibold text-gray-600 dark:text-gray-300">{banner.position}</span></span>
            <span className={cn('rounded-full px-2 py-0.5 font-semibold', banner.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-white/10')}>
              {banner.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const [modal, setModal] = useState<{ open: boolean; editing?: BannerDto }>({ open: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewBanner, setPreviewBanner] = useState<BannerDto | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const res = await bannerApi.list()
    if (res.data) setBanners(res.data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(banners.length / PAGE_SIZE)
  const paged = banners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeCount = banners.filter(b => b.isActive).length

  async function handleSubmit(data: BannerRequest): Promise<boolean> {
    setIsSubmitting(true)
    let res: Awaited<ReturnType<typeof bannerApi.update>> | Awaited<ReturnType<typeof bannerApi.create>>
    if (modal.editing) {
      res = await bannerApi.update(modal.editing.id, data)
      if (res.success && res.data) {
        setBanners(prev => prev.map(b => b.id === modal.editing!.id ? res.data! : b))
        toast.success('Đã cập nhật banner')
      } else {
        toast.error('Cập nhật thất bại')
      }
    } else {
      res = await bannerApi.create(data)
      if (res.success && res.data) {
        setBanners(prev => [...prev, res.data!])
        toast.success('Đã thêm banner mới')
      } else {
        toast.error('Thêm banner thất bại')
      }
    }
    setIsSubmitting(false)
    return !!res.success
  }

  async function handleToggle(banner: BannerDto) {
    const res = await bannerApi.toggleActive(banner.id, !banner.isActive)
    if (res.success && res.data) {
      setBanners(prev => prev.map(b => b.id === banner.id ? res.data! : b))
      toast.success(banner.isActive ? 'Đã ẩn banner' : 'Đã hiển thị banner')
    }
  }

  async function handleDelete(banner: BannerDto) {
    if (!window.confirm(`Xóa banner "${banner.title}"?`)) return
    const res = await bannerApi.delete(banner.id)
    if (res.success) {
      setBanners(prev => prev.filter(b => b.id !== banner.id))
      toast.success('Đã xóa banner')
    } else {
      toast.error('Xóa thất bại')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Quản lý Banner</h1>
          <p className="mt-0.5 text-sm text-gray-400">Điều chỉnh hình ảnh banner trên trang chủ shop</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition">
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button onClick={() => setModal({ open: true })}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 shadow-sm shadow-orange-200/50 transition">
            <Plus size={14} />
            Thêm banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={ImageIcon} label="Tổng banner" value={banners.length} color="bg-orange-500" />
        <StatCard icon={Monitor} label="Đang hiển thị" value={activeCount} color="bg-emerald-500" />
        <StatCard icon={EyeOff} label="Đã ẩn" value={banners.length - activeCount} color="bg-gray-400" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3.5">Hình ảnh</th>
                <th className="px-5 py-3.5">Tiêu đề</th>
                <th className="px-5 py-3.5">Link</th>
                <th className="px-5 py-3.5 text-center">Thứ tự</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <BannerSkeleton />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ImageIcon size={28} className="mx-auto mb-2 text-gray-200 dark:text-white/10" />
                    <p className="text-sm text-gray-400">Chưa có banner nào</p>
                    <button onClick={() => setModal({ open: true })}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition">
                      <Plus size={13} /> Thêm banner đầu tiên
                    </button>
                  </td>
                </tr>
              ) : (
                paged.map(banner => (
                  <tr key={banner.id} className="group hover:bg-orange-50/60 dark:hover:bg-white/[0.03] transition-colors">
                    {/* Image */}
                    <td className="px-5 py-3.5">
                      <div className="relative h-12 w-20 rounded-lg overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{banner.title}</p>
                    </td>

                    {/* Link */}
                    <td className="px-5 py-3.5">
                      {banner.linkUrl ? (
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-orange-500 hover:underline truncate max-w-[180px]">
                          <LinkIcon size={10} />
                          {banner.linkUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-white/20">—</span>
                      )}
                    </td>

                    {/* Position */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {banner.position}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        banner.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', banner.isActive ? 'bg-emerald-500' : 'bg-gray-400')} />
                        {banner.isActive ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewBanner(banner)}
                          title="Xem trước"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-300 transition"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleToggle(banner)}
                          title={banner.isActive ? 'Ẩn banner' : 'Hiển thị banner'}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border transition',
                            banner.isActive
                              ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 hover:bg-amber-100'
                              : 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-100',
                          )}
                        >
                          {banner.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          onClick={() => setModal({ open: true, editing: banner })}
                          title="Chỉnh sửa"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          title="Xóa"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Form Modal */}
      {modal.open && (
        <BannerFormModal
          initial={modal.editing}
          onSubmit={handleSubmit}
          onClose={() => setModal({ open: false })}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview Modal */}
      {previewBanner && (
        <BannerPreviewModal banner={previewBanner} onClose={() => setPreviewBanner(null)} />
      )}
    </div>
  )
}

export { AdminBannersPage }
