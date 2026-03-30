import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Search, ChevronRight, Calendar, Eye, Tag, ArrowRight, TrendingUp, Bookmark, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { blogApi, type BlogPostDto, type BlogCategoryDto } from '@/lib/http/blog.api'

// ── Category badge ────────────────────────────────────────────────────────────

function CategoryBadge({ name, size = 'sm' }: { name: string; size?: 'sm' | 'xs' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400',
      size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
    )}>
      <Tag size={size === 'xs' ? 8 : 9} />
      {name}
    </span>
  )
}

// ── Featured card ─────────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPostDto }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group relative flex h-[420px] overflow-hidden rounded-3xl">
      {post.thumbnailUrl ? (
        <img src={post.thumbnailUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-900/40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative flex flex-col justify-end p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Featured</span>
          {post.categoryName && <CategoryBadge name={post.categoryName} size="xs" />}
        </div>
        <h2 className="mb-2 text-2xl font-bold leading-snug text-white group-hover:text-orange-300 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-white/70 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <span className="font-semibold text-white/80">{post.authorName}</span>
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />{new Date(post.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
          <span className="flex items-center gap-1"><Eye size={11} />{post.viewCount.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPostDto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all">
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden">
        {post.thumbnailUrl ? (
          <img src={post.thumbnailUrl} alt={post.title} loading="lazy"
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20" />
        )}
        {post.categoryName && (
          <div className="absolute left-3 top-3">
            <CategoryBadge name={post.categoryName} size="xs" />
          </div>
        )}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/40 text-gray-500 hover:text-orange-500 shadow opacity-0 group-hover:opacity-100 transition-all"
          onClick={e => e.preventDefault()}
        >
          <Bookmark size={13} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{post.excerpt}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{post.authorName}</span>
          <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={9} />{new Date(post.publishedAt).toLocaleDateString('vi-VN')}
              </span>
            )}
            <span className="flex items-center gap-1"><Eye size={9} />{post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function BlogPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<BlogCategoryDto[]>([])
  const [posts, setPosts] = useState<BlogPostDto[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    blogApi.getCategories().then(res => {
      if (res.success && res.data) setCategories(res.data)
    })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    blogApi.getPosts({ categorySlug: activeCategorySlug, page, size: 9 }).then(res => {
      setIsLoading(false)
      if (res.success && res.data) {
        setPosts(res.data.content)
        setTotal(res.data.totalElements)
      }
    })
  }, [activeCategorySlug, page])

  const featured = !activeCategorySlug ? posts[0] : undefined
  const grid = activeCategorySlug ? posts : posts.slice(1)

  const filtered = search
    ? grid.filter(p => {
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) || (p.excerpt ?? '').toLowerCase().includes(q)
      })
    : grid

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{t('blog.title')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('blog.title')}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('blog.subtitle')}</p>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-orange-500" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="min-w-0 flex-1">
              {!search && !activeCategorySlug && featured && (
                <div className="mb-8"><FeaturedCard post={featured} /></div>
              )}

              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveCategorySlug(undefined); setPage(0) }}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition-all',
                    !activeCategorySlug
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                      : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500',
                  )}
                >
                  Tất cả <span className="ml-1.5 text-[10px] opacity-60">{total}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategorySlug(cat.slug); setPage(0) }}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-semibold transition-all',
                      activeCategorySlug === cat.slug
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500',
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-orange-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <Search size={22} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('blog.noResults')}</p>
                  <button onClick={() => { setSearch(''); setActiveCategorySlug(undefined); setPage(0) }}
                    className="mt-3 text-xs text-orange-500 hover:underline">{t('blog.clearFilter')}</button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              )}

              {total > 9 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(total / 9) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all',
                        page === i
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500',
                      )}
                    >{i + 1}</button>
                  ))}
                </div>
              )}
            </div>

            <aside className="w-full lg:w-72 space-y-6 shrink-0">
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('blog.searchTitle')}</h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('blog.searchPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-9 pr-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
                  />
                </div>
              </div>

              {posts.length > 0 && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                    <TrendingUp size={14} className="text-orange-500" />{t('blog.trending')}
                  </h3>
                  <div className="space-y-4">
                    {[...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4).map((post, i) => (
                      <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                        <span className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                          i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
                        )}>{i + 1}</span>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">{post.title}</p>
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                            <Eye size={9} />{post.viewCount.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                  <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('blog.categories')}</h3>
                  <div className="space-y-1.5">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setActiveCategorySlug(cat.slug); setPage(0) }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                          activeCategorySlug === cat.slug
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
                        )}
                      >
                        <CategoryBadge name={cat.name} size="xs" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-center">
                <h3 className="mb-1 text-sm font-bold text-white">{t('blog.ctaTitle')}</h3>
                <p className="mb-4 text-xs text-orange-100">{t('blog.ctaDesc')}</p>
                <Link to="/contact"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors">
                  {t('blog.ctaButton')} <ArrowRight size={11} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { BlogPage }
export type { BlogPostDto as BlogPost }
