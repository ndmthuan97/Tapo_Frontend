import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  ChevronRight, Calendar, Eye, Tag, ArrowLeft,
  ThumbsUp, Share2, Bookmark, Facebook, Twitter, Link2, MessageSquare, ImageOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { blogApi, type BlogPostDto } from '@/lib/http/blog.api'

// ── Markdown-lite renderer ────────────────────────────────────────────────────

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

export function renderBold(text: string, boldClassName?: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className={boldClassName ?? ''}>{part}</strong>
      : part
  )
}

function MarkdownContent({ content }: { content: string }) {
  const lines = stripHtml(content).trim().split('\n')
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return (
          <h2 key={i} className="mt-6 mb-3 text-lg font-bold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">
            {line.replace('## ', '')}
          </h2>
        )
        if (line.startsWith('### ')) return (
          <h3 key={i} className="mt-4 mb-2 text-base font-bold text-gray-800 dark:text-gray-100">
            {line.replace('### ', '')}
          </h3>
        )
        if (line.startsWith('- ')) return (
          <li key={i} className="ml-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {renderBold(line.replace('- ', ''))}
          </li>
        )
        if (line.startsWith('```')) return <div key={i} className="h-0" />
        if (line === '') return <div key={i} className="h-3" />
        return (
          <p key={i} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {renderBold(line, 'text-gray-800 dark:text-gray-100')}
          </p>
        )
      })}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="h-72 rounded-3xl bg-gray-100 dark:bg-white/5" />
      <div className="h-6 w-3/4 rounded-full bg-gray-100 dark:bg-white/5" />
      <div className="h-4 w-1/2 rounded-full bg-gray-100 dark:bg-white/5" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-3 rounded-full bg-gray-100 dark:bg-white/5" />)}
      </div>
    </div>
  )
}

// ── Share dropdown ────────────────────────────────────────────────────────────

function ShareDropdown({ open, url }: { open: boolean; url: string }) {
  if (!open) return null
  return (
    <div className="absolute right-0 top-full mt-2 z-20 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#21232d] shadow-xl p-2 min-w-[160px]">
      {[
        { icon: Facebook, label: 'Facebook',  href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
        { icon: Twitter,  label: 'Twitter/X', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
        { icon: Link2,    label: 'Sao chép link', href: null },
      ].map(({ icon: Icon, label, href }) => (
        <button
          key={label}
          onClick={() => href ? window.open(href, '_blank') : navigator.clipboard.writeText(url)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <Icon size={13} className="text-gray-400" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function BlogDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [post, setPost] = useState<BlogPostDto | null>(null)
  const [related, setRelated] = useState<BlogPostDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  // Load post by slug
  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    setNotFound(false)
    blogApi.getPostBySlug(slug).then(res => {
      setIsLoading(false)
      if (res.success && res.data) {
        setPost(res.data)
        setLikeCount(res.data.viewCount ?? 0)
        // Load related posts from same category
        blogApi.getPosts({ categorySlug: res.data.categorySlug ?? undefined, size: 4 }).then(r => {
          if (r.success && r.data) {
            setRelated(r.data.content.filter(p => p.id !== res.data!.id).slice(0, 3))
          }
        })
      } else {
        setNotFound(true)
      }
    })
  }, [slug])

  function handleLike() {
    setLiked(l => {
      setLikeCount(c => l ? c - 1 : c + 1)
      return !l
    })
  }

  const pageUrl = window.location.href

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
          <BlogDetailSkeleton />
        </main>
        <Footer />
      </>
    )
  }

  if (notFound || !post) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#191b22] gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
            <ImageOff size={28} className="text-orange-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Bài viết không tồn tại</h1>
          <button onClick={() => navigate('/blog')}
            className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
            <ArrowLeft size={14} /> Về trang Blog
          </button>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/blog" className="hover:text-orange-500 transition-colors">{t('blog.title')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium line-clamp-1">{post.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero thumbnail */}
          <div className="relative mb-8 overflow-hidden rounded-3xl">
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt={post.title}
                className="h-72 w-full object-cover sm:h-96" />
            ) : (
              <div className="h-72 w-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 sm:h-96" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {post.categoryName && (
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
                <Tag size={9} />{post.categoryName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Article */}
            <article className="min-w-0 flex-1">
              {/* Title */}
              <h1 className="mb-4 text-2xl font-extrabold leading-snug text-gray-900 dark:text-white sm:text-3xl">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-sm font-bold text-orange-500">
                    {post.authorName?.charAt(0).toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{post.authorName ?? 'Tapo Editorial'}</p>
                    <p className="text-[10px] text-gray-400">Tác giả</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 ml-auto">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />{new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Eye size={11} />{post.viewCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="mb-6 rounded-2xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 px-5 py-4 text-sm font-medium italic text-gray-600 dark:text-gray-300 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <MarkdownContent content={post.content} />

              {/* Action bar */}
              <div className="mt-10 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                      liked
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200/50'
                        : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500',
                    )}
                  >
                    <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
                    {likeCount.toLocaleString()}
                  </button>
                  <button
                    onClick={() => setBookmarked(b => !b)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                      bookmarked
                        ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                        : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500',
                    )}
                  >
                    <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
                    Lưu
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShareOpen(o => !o)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] px-4 py-2 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                  >
                    <Share2 size={14} /> Chia sẻ
                  </button>
                  <ShareDropdown open={shareOpen} url={pageUrl} />
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {post.categoryName && (
                  <Link to={`/blog?category=${post.categorySlug}`}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
                    <Tag size={10} />{post.categoryName}
                  </Link>
                )}
              </div>

              {/* Back to blog */}
              <div className="mt-8">
                <Link to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                  <ArrowLeft size={14} /> Về danh sách bài viết
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-6">
              {/* Author card */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-xl font-bold text-orange-500">
                  {post.authorName?.charAt(0).toUpperCase() ?? 'A'}
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{post.authorName ?? 'Tapo Editorial'}</p>
                <p className="mt-1 text-[11px] text-gray-400">Tác giả tại Tapo Blog</p>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                    <MessageSquare size={14} className="text-orange-500" />
                    Bài viết liên quan
                  </h3>
                  <div className="space-y-4">
                    {related.map(rel => (
                      <Link key={rel.id} to={`/blog/${rel.slug}`} className="group flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                          {rel.thumbnailUrl ? (
                            <img src={rel.thumbnailUrl} alt={rel.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/10" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors leading-snug">{rel.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Eye size={9} />{rel.viewCount.toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { BlogDetailPage }
