import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  ChevronRight, Calendar, Clock, Eye, Tag, ArrowLeft, ArrowRight,
  ThumbsUp, Share2, Bookmark, Facebook, Twitter, Link2, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Re-use mock data inline (same as BlogPage) ────────────────────────────────

const THUMBNAIL = 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

const MOCK_CONTENT = `
## Tổng quan

Thị trường laptop gaming 2025 đang bùng nổ với những cải tiến vượt bậc về hiệu năng, tản nhiệt và màn hình. Chúng tôi đã thực hiện hơn 300 giờ kiểm thử trên 30+ máy để đưa ra danh sách khách quan nhất.

## 1. ASUS ROG Zephyrus G16 (2025)

Được trang bị Snapdragon X Elite, chip này mang đến hiệu năng AI vượt trội và pin lên tới **18 giờ** — điều chưa từng có trên laptop gaming cao cấp.

- **Màn hình**: OLED 2.5K 240Hz
- **RAM**: 32GB LPDDR5X  
- **SSD**: 1TB PCIe Gen 5
- **Giá**: Từ 52,000,000 VND

## 2. Lenovo Legion Pro 7i Gen 9

Hiệu năng thực chiến tốt nhất phân khúc desktop-replacement với hệ thống tản nhiệt Revolution Cooling.

\`\`\`
CPU: Intel Core i9-14900HX
GPU: NVIDIA RTX 4090 Mobile  
RAM: 64GB DDR5
\`\`\`

## 3. MSI Raider GE78 HX

MSI vẫn là lựa chọn hàng đầu cho những ai cần màn hình lớn (17.3 inch) với giá hợp lý hơn.

## Kết luận

Nếu ngân sách trên 50 triệu, ASUS ROG là vô địch. Dưới 30 triệu, Lenovo Legion 5i vẫn là vua giá trị. Đừng bỏ qua MSI nếu bạn cần màn hình 4K.
`

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  date: string
  likes: number
}

const MOCK_COMMENTS: Comment[] = [
  { id: '1', author: 'Hùng Dev', avatar: 'https://ui-avatars.com/api/?name=Hung+Dev&background=f97316&color=fff', content: 'Bài viết rất chi tiết! Mình đang cân nhắc giữa Zephyrus G16 và Legion Pro 7i. Giá Legion hấp dẫn hơn nhiều.', date: '2025-03-28', likes: 12 },
  { id: '2', author: 'Bảo Khanh', avatar: 'https://ui-avatars.com/api/?name=Bao+Khanh&background=8b5cf6&color=fff', content: 'Cảm ơn tác giả! Mình đã mua Zephyrus G16 theo review này và không hối hận. Pin thật sự 18h như quảng cáo.', date: '2025-03-27', likes: 8 },
  { id: '3', author: 'Thu Hà', avatar: 'https://ui-avatars.com/api/?name=Thu+Ha&background=06b6d4&color=fff', content: 'Review MSI hơi ngắn. Mình muốn biết thêm về tản nhiệt của nó khi chạy load cao?', date: '2025-03-26', likes: 3 },
]

// ── Render markdown-lite (bold + headers + code) ──────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return (
          <h2 key={i} className="mt-6 mb-3 text-lg font-bold text-gray-900 dark:text-white border-l-4 border-orange-500 pl-3">
            {line.replace('## ', '')}
          </h2>
        )
        if (line.startsWith('- ')) return (
          <li key={i} className="ml-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        )
        if (line.startsWith('```')) return <div key={i} className="h-0" />
        if (line === '') return <div key={i} className="h-3" />
        return (
          <p key={i} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 dark:text-gray-100">$1</strong>') }} />
        )
      })}
    </div>
  )
}

// ── Comment card ──────────────────────────────────────────────────────────────

function CommentCard({ comment }: { comment: Comment }) {
  const [liked, setLiked] = useState(false)
  return (
    <div className="flex gap-3">
      <img src={comment.avatar} alt={comment.author} className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1">
        <div className="rounded-2xl rounded-tl-none bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{comment.author}</span>
            <span className="text-[10px] text-gray-400">{comment.date}</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{comment.content}</p>
        </div>
        <div className="mt-1.5 flex items-center gap-3 pl-1">
          <button
            onClick={() => setLiked(l => !l)}
            className={cn('flex items-center gap-1 text-[10px] font-medium transition-colors', liked ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400')}
          >
            <ThumbsUp size={10} className={liked ? 'fill-current' : ''} />
            {comment.likes + (liked ? 1 : 0)}
          </button>
          <button className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Trả lời</button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function BlogDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(247)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [shareOpen, setShareOpen] = useState(false)

  // mock post
  const post = {
    title: 'Top 10 Laptop Gaming Tốt Nhất 2025 – Trải Nghiệm Thực Chiến',
    excerpt: 'Chúng tôi đã thử nghiệm hơn 30 mẫu laptop gaming trong 6 tháng. Đây là danh sách đáng tiền nhất cho mọi mức ngân sách.',
    category: 'review' as const,
    author: { name: 'Minh Trí', avatar: 'https://ui-avatars.com/api/?name=Minh+Tri&background=f97316&color=fff', role: 'Tech Reviewer', bio: '5 năm kinh nghiệm review thiết bị công nghệ. Đam mê gaming và hiệu năng cao.' },
    publishedAt: '28/03/2025', readTime: 8, views: 12450,
    thumbnail: THUMBNAIL,
    tags: ['Gaming', 'RTX 4080', 'ASUS ROG', 'Lenovo Legion', 'Laptop 2025'],
  }

  const relatedPosts = [
    { id: '2', slug: 'chon-laptop-cho-sinh-vien', title: 'Hướng Dẫn Chọn Laptop Sinh Viên 2025', thumbnail: THUMBNAIL, readTime: 5, views: 9870 },
    { id: '3', slug: 'tai-sao-ssd-quan-trong', title: 'Tại Sao SSD Lại Quan Trọng Hơn RAM?', thumbnail: THUMBNAIL, readTime: 6, views: 7320 },
    { id: '4', slug: 'asus-rog-zephyrus-g16-review', title: 'ASUS ROG Zephyrus G16 2025', thumbnail: THUMBNAIL, readTime: 12, views: 15200 },
  ]

  function handleLike() {
    setLiked(l => {
      setLikeCount(c => l ? c - 1 : c + 1)
      return !l
    })
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setComments(prev => [{
      id: String(Date.now()),
      author: 'Bạn',
      avatar: 'https://ui-avatars.com/api/?name=You&background=orange&color=fff',
      content: commentText.trim(),
      date: new Date().toLocaleDateString('vi-VN'),
      likes: 0,
    }, ...prev])
    setCommentText('')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/blog" className="hover:text-orange-500 transition-colors">{t('blog.title')}</Link>
              <ChevronRight size={12} />
              <span className="line-clamp-1 text-gray-600 dark:text-gray-300 font-medium max-w-[200px]">{post.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Main article */}
            <article className="min-w-0 flex-1">
              {/* Back */}
              <Link to="/blog" className="mb-5 flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors w-fit">
                <ArrowLeft size={13} /> {t('blog.backToList')}
              </Link>

              {/* Meta */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                  'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/15')}>
                  <Tag size={9} /> Review
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar size={11} /> {post.publishedAt}</span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock size={11} /> {post.readTime} phút đọc</span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400"><Eye size={11} /> {post.views.toLocaleString()} lượt xem</span>
              </div>

              <h1 className="mb-4 text-2xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-3xl">
                {post.title}
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{post.excerpt}</p>

              {/* Thumbnail */}
              <div className="mb-8 overflow-hidden rounded-2xl">
                <img src={post.thumbnail} alt={post.title} className="w-full h-72 sm:h-96 object-cover" />
              </div>

              {/* Content */}
              <div className="mb-8">
                <MarkdownContent content={MOCK_CONTENT} />
              </div>

              {/* Tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer">
                    <Tag size={9} /> {tag}
                  </span>
                ))}
              </div>

              {/* Reaction bar */}
              <div className="mb-8 flex items-center justify-between rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] px-5 py-4">
                <button
                  onClick={handleLike}
                  className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all', liked ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500')}
                >
                  <ThumbsUp size={15} className={liked ? 'fill-current' : ''} />
                  {liked ? 'Đã thích' : 'Hữu ích'} ({likeCount})
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBookmarked(b => !b)}
                    className={cn('flex h-9 w-9 items-center justify-center rounded-xl border transition-all', bookmarked ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-orange-400 hover:text-orange-500')}
                  >
                    <Bookmark size={15} className={bookmarked ? 'fill-current' : ''} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShareOpen(s => !s)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all"
                    >
                      <Share2 size={15} />
                    </button>
                    {shareOpen && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1">
                        {[{ Icon: Facebook, label: 'Facebook', color: 'text-blue-600' }, { Icon: Twitter, label: 'Twitter', color: 'text-sky-500' }, { Icon: Link2, label: 'Copy link', color: 'text-gray-600 dark:text-gray-400' }].map(({ Icon, label, color }) => (
                          <button key={label} className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors', color)}>
                            <Icon size={13} /> {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Author card */}
              <div className="mb-10 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <div className="flex gap-4">
                  <img src={post.author.avatar} alt={post.author.name} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
                    <p className="text-xs font-medium text-orange-500">{post.author.role}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{post.author.bio}</p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <section>
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <MessageSquare size={18} className="text-orange-500" />
                  {t('blog.comments')} ({comments.length})
                </h2>

                {/* Write comment */}
                <form onSubmit={handleComment} className="mb-6">
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] overflow-hidden focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder={t('blog.commentPlaceholder')}
                      rows={3}
                      className="w-full resize-none bg-transparent px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none"
                    />
                    <div className="flex items-center justify-end border-t border-gray-100 dark:border-white/5 px-4 py-2">
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('blog.postComment')}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-4">
                  {comments.map(c => <CommentCard key={c.id} comment={c} />)}
                </div>
              </section>
            </article>

            {/* Sidebar — related */}
            <aside className="w-full lg:w-64 shrink-0 space-y-5">
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('blog.related')}</h3>
                <div className="space-y-4">
                  {relatedPosts.map(p => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="group flex gap-3">
                      <img src={p.thumbnail} alt={p.title} loading="lazy"
                        className="h-14 w-14 shrink-0 rounded-xl object-cover transition-transform group-hover:scale-105" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">{p.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5"><Clock size={9} />{p.readTime}p</span>
                          <span className="flex items-center gap-0.5"><Eye size={9} />{p.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Nav between posts */}
              <div className="space-y-2">
                <Link to="/blog" className="flex items-center gap-2 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all group">
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                  {t('blog.backToList')}
                </Link>
                <Link to="/blog/asus-rog-zephyrus-g16-review" className="flex items-center justify-between gap-2 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all group">
                  <span className="line-clamp-1">{t('blog.nextPost')}</span>
                  <ArrowRight size={13} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
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

export { BlogDetailPage }
