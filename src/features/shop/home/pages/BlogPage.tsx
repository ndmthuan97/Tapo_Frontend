import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Search, ChevronRight, Calendar, Clock, Eye, Tag, ArrowRight, TrendingUp, Bookmark
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mock data ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['all', 'news', 'review', 'tips', 'gaming', 'deals'] as const
type BlogCategory = typeof CATEGORIES[number]

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  category: BlogCategory
  author: { name: string; avatar: string; role: string }
  publishedAt: string
  readTime: number
  views: number
  thumbnail: string
  tags: string[]
  featured?: boolean
}

const THUMBNAIL = 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1', slug: 'top-laptop-gaming-2025',
    title: 'Top 10 Laptop Gaming Tốt Nhất 2025 – Trải Nghiệm Thực Chiến',
    excerpt: 'Chúng tôi đã thử nghiệm hơn 30 mẫu laptop gaming trong 6 tháng. Đây là danh sách đáng tiền nhất cho mọi mức ngân sách.',
    category: 'review', publishedAt: '2025-03-28', readTime: 8, views: 12450,
    thumbnail: THUMBNAIL, tags: ['Gaming', 'RTX 4080', 'ASUS ROG', 'Lenovo Legion'],
    author: { name: 'Minh Trí', avatar: 'https://ui-avatars.com/api/?name=Minh+Tri&background=f97316&color=fff', role: 'Tech Reviewer' },
    featured: true,
  },
  {
    id: '2', slug: 'chon-laptop-cho-sinh-vien',
    title: 'Hướng Dẫn Chọn Laptop Sinh Viên 2025 Ngân Sách Dưới 15 Triệu',
    excerpt: 'Là sinh viên năm nhất, bạn cần laptop có pin trâu, nhẹ, đủ mạnh để code và làm báo cáo. Bài viết này sẽ giúp bạn ra quyết định đúng.',
    category: 'tips', publishedAt: '2025-03-26', readTime: 5, views: 9870,
    thumbnail: THUMBNAIL, tags: ['Sinh viên', 'Budget', 'Acer', 'Dell'],
    author: { name: 'Phương Linh', avatar: 'https://ui-avatars.com/api/?name=Phuong+Linh&background=8b5cf6&color=fff', role: 'Editor' },
  },
  {
    id: '3', slug: 'tai-sao-ssd-quan-trong',
    title: 'Tại Sao SSD Lại Quan Trọng Hơn RAM Với Hiệu Năng Tổng Thể?',
    excerpt: 'Nhiều người nghĩ RAM là yếu tố quyết định tốc độ. Nhưng thực tế, SSD mới là thứ thay đổi trải nghiệm hàng ngày của bạn.',
    category: 'tips', publishedAt: '2025-03-24', readTime: 6, views: 7320,
    thumbnail: THUMBNAIL, tags: ['SSD', 'RAM', 'Hiệu năng', 'Upgrade'],
    author: { name: 'Minh Trí', avatar: 'https://ui-avatars.com/api/?name=Minh+Tri&background=f97316&color=fff', role: 'Tech Reviewer' },
  },
  {
    id: '4', slug: 'asus-rog-zephyrus-g16-review',
    title: 'ASUS ROG Zephyrus G16 2025 – Siêu Phẩm Mỏng Nhẹ Cho Gamer Chuyên Nghiệp',
    excerpt: 'Màn hình OLED 240Hz, chip Snapdragon X Elite mạnh nhất, nhưng pin lại gây bất ngờ. Đọc bài review chi tiết của chúng tôi.',
    category: 'review', publishedAt: '2025-03-22', readTime: 12, views: 15200,
    thumbnail: THUMBNAIL, tags: ['ASUS ROG', 'Gaming', 'OLED', 'Review'],
    author: { name: 'Đức Anh', avatar: 'https://ui-avatars.com/api/?name=Duc+Anh&background=06b6d4&color=fff', role: 'Hardware Specialist' },
  },
  {
    id: '5', slug: 'deal-cuoi-thang-3-2025',
    title: 'Deal Công Nghệ Cuối Tháng 3/2025 – Giảm Sâu 30% Laptop Gaming',
    excerpt: 'Tổng hợp những deal công nghệ hấp dẫn nhất tuần này từ Tapo. Cơ hội vàng sở hữu laptop cao cấp với giá tốt nhất trong năm.',
    category: 'deals', publishedAt: '2025-03-20', readTime: 3, views: 21000,
    thumbnail: THUMBNAIL, tags: ['Deal', 'Giảm giá', 'Flash Sale'],
    author: { name: 'Phương Linh', avatar: 'https://ui-avatars.com/api/?name=Phuong+Linh&background=8b5cf6&color=fff', role: 'Editor' },
  },
  {
    id: '6', slug: 'tapo-mo-rong-showroom',
    title: 'Tapo Khai Trương Showroom Thứ 5 Tại TP.HCM – Trải Nghiệm Thực Tế 200+ Sản Phẩm',
    excerpt: 'Showroom mới của Tapo tại Quận 1 chính thức mở cửa với không gian 500m², cho phép khách hàng trải nghiệm trực tiếp hơn 200 sản phẩm công nghệ.',
    category: 'news', publishedAt: '2025-03-18', readTime: 2, views: 5430,
    thumbnail: THUMBNAIL, tags: ['Tapo', 'Showroom', 'TP.HCM'],
    author: { name: 'Lan Phương', avatar: 'https://ui-avatars.com/api/?name=Lan+Phuong&background=10b981&color=fff', role: 'Marketing' },
  },
]

const TRENDING_POSTS = MOCK_POSTS.sort((a, b) => b.views - a.views).slice(0, 4)

// ── Category label ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<BlogCategory, { label: string; color: string; bg: string }> = {
  all:    { label: 'Tất cả',     color: 'text-gray-700 dark:text-gray-300',     bg: 'bg-gray-100 dark:bg-white/10' },
  news:   { label: 'Tin tức',    color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/15' },
  review: { label: 'Review',     color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/15' },
  tips:   { label: 'Mẹo & Thủ thuật', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  gaming: { label: 'Gaming',     color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/15' },
  deals:  { label: 'Ưu đãi',     color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/15' },
}

function CategoryBadge({ cat, size = 'sm' }: { cat: BlogCategory; size?: 'sm' | 'xs' }) {
  const cfg = CATEGORY_CONFIG[cat]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-semibold',
      size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      cfg.color, cfg.bg,
    )}>
      <Tag size={size === 'xs' ? 8 : 9} />
      {cfg.label}
    </span>
  )
}

// ── Featured card ─────────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group relative flex h-[420px] overflow-hidden rounded-3xl">
      <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      {/* Content */}
      <div className="relative flex flex-col justify-end p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Featured</span>
          <CategoryBadge cat={post.category} size="xs" />
        </div>
        <h2 className="mb-2 text-2xl font-bold leading-snug text-white group-hover:text-orange-300 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-white/70 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-full ring-2 ring-white/30" />
            <div>
              <p className="text-xs font-semibold text-white">{post.author.name}</p>
              <p className="text-[10px] text-white/60">{post.author.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1"><Calendar size={11} /> {post.publishedAt}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} phút</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all">
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden">
        <img src={post.thumbnail} alt={post.title} loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <CategoryBadge cat={post.category} size="xs" />
        </div>
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

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={post.author.avatar} alt={post.author.name} className="h-6 w-6 rounded-full" />
            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Clock size={9} /> {post.readTime}p</span>
            <span className="flex items-center gap-1"><Eye size={9} /> {post.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function BlogPage() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all')
  const [search, setSearch] = useState('')

  const featured = MOCK_POSTS.find(p => p.featured)!

  const filtered = MOCK_POSTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    return matchCat && matchSearch && !p.featured
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Hero / breadcrumb bar */}
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
          {/* Page heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('blog.title')}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('blog.subtitle')}</p>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-orange-500" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main content */}
            <div className="min-w-0 flex-1">
              {/* Featured post */}
              {!search && activeCategory === 'all' && <div className="mb-8"><FeaturedCard post={featured} /></div>}

              {/* Category tabs */}
              <div className="mb-6 flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-semibold transition-all',
                      activeCategory === cat
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'bg-white dark:bg-[#21232d] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500',
                    )}
                  >
                    {CATEGORY_CONFIG[cat].label}
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {cat === 'all' ? MOCK_POSTS.length : MOCK_POSTS.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Results count */}
              {search && (
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {t('blog.resultFor', { count: filtered.length, query: search })}
                </p>
              )}

              {/* Posts grid */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <Search size={22} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('blog.noResults')}</p>
                  <button onClick={() => { setSearch(''); setActiveCategory('all') }}
                    className="mt-3 text-xs text-orange-500 hover:underline">{t('blog.clearFilter')}</button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 space-y-6 shrink-0">
              {/* Search */}
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

              {/* Trending */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                  <TrendingUp size={14} className="text-orange-500" />{t('blog.trending')}
                </h3>
                <div className="space-y-4">
                  {TRENDING_POSTS.map((post, i) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                      <span className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                        i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
                      )}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">{post.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                          <Eye size={9} /> {post.views.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories sidebar */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('blog.categories')}</h3>
                <div className="space-y-1.5">
                  {CATEGORIES.filter(c => c !== 'all').map(cat => {
                    const count = MOCK_POSTS.filter(p => p.category === cat).length
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                          activeCategory === cat
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <CategoryBadge cat={cat} size="xs" />
                          {CATEGORY_CONFIG[cat].label}
                        </span>
                        <span className="text-gray-400">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* CTA */}
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
export type { BlogPost }
