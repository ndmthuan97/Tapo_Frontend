import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  MapPin, Phone, Mail, Clock, ChevronRight, Send, Loader2,
  CheckCircle2, MessageSquare, Headphones, Zap, Facebook,
  Instagram, Youtube, Twitter,
} from 'lucide-react'
import { FloatingInput } from '@/components/common/FloatingInput'
import { cn } from '@/lib/utils'

// ── Contact info cards ────────────────────────────────────────────────────────

const CONTACT_ITEMS = [
  {
    key: 'address' as const,
    icon: MapPin,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    value: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    sub: 'Cơ sở 2: 45 Lê Lợi, Hà Nội',
  },
  {
    key: 'phone' as const,
    icon: Phone,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    value: '1800 6868 (miễn phí)',
    sub: 'Thứ 2–6: 8:00–22:00 | T7–CN: 9:00–21:00',
  },
  {
    key: 'email' as const,
    icon: Mail,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    value: 'support@tapo.vn',
    sub: 'Phản hồi trong vòng 2 giờ',
  },
  {
    key: 'hours' as const,
    icon: Clock,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    value: 'Thứ 2 – Chủ Nhật',
    sub: '8:00 – 22:00 (kể cả lễ, tết)',
  },
]

const TOPICS = ['product', 'order', 'warranty', 'shipping', 'return', 'other'] as const
type Topic = typeof TOPICS[number]

const TOPIC_LABELS: Record<Topic, string> = {
  product: 'Hỏi về sản phẩm',
  order: 'Vấn đề đơn hàng',
  warranty: 'Bảo hành / sửa chữa',
  shipping: 'Vận chuyển',
  return: 'Đổi / trả hàng',
  other: 'Khác',
}

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Thời gian giao hàng là bao lâu?', a: 'Nội thành TP.HCM và Hà Nội: 2–4 tiếng. Các tỉnh thành khác: 1–3 ngày làm việc qua các đối tác Giao Hàng Nhanh, GHN, J&T.' },
  { q: 'Chính sách đổi trả như thế nào?', a: 'Sản phẩm lỗi nhà sản xuất được đổi trả trong 15 ngày. Lỗi do người dùng sẽ được xem xét từng trường hợp. Vui lòng giữ nguyên đóng gói.' },
  { q: 'Tôi có thể thanh toán bằng cách nào?', a: 'Chúng tôi hỗ trợ: COD, VNPay, MoMo, Zalo Pay, thẻ VISA/Mastercard và chuyển khoản ngân hàng.' },
  { q: 'Sản phẩm có bảo hành không?', a: 'Tất cả sản phẩm được bảo hành theo chính sách nhà sản xuất (thường 12–24 tháng). Tapo hỗ trợ bảo hành tại các Trung tâm trên toàn quốc.' },
]

// ── Main page ─────────────────────────────────────────────────────────────────

function ContactPage() {
  const { t } = useTranslation()
  const [selectedTopic, setSelectedTopic] = useState<Topic>('product')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition-colors">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{t('contact.title')}</span>
            </nav>
          </div>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 py-14 px-4">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Headphones size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t('contact.hero.title')}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-orange-100">{t('contact.hero.subtitle')}</p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Zap, label: t('contact.hero.stat1') },
                { icon: MessageSquare, label: t('contact.hero.stat2') },
                { icon: CheckCircle2, label: t('contact.hero.stat3') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5">
                  <Icon size={15} className="text-white" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Contact info grid */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <div key={item.key} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', item.bg)}>
                    <Icon size={18} className={item.color} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                </div>
              )
            })}
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Contact form — 3 cols */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-8">
                {submitted ? (
                  /* Success state */
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('contact.form.successTitle')}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{t('contact.form.successDesc')}</p>
                    <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-orange-500">Mã yêu cầu:</span> #{Date.now().toString().slice(-6)}
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }) }}
                      className="mt-6 rounded-xl border border-gray-200 dark:border-white/10 px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                      {t('contact.form.sendAnother')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('contact.form.title')}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('contact.form.subtitle')}</p>
                    </div>

                    {/* Topic selector */}
                    <div className="mb-6">
                      <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('contact.form.topicLabel')}</p>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map(topic => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setSelectedTopic(topic)}
                            className={cn(
                              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                              selectedTopic === topic
                                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200/60'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
                            )}
                          >
                            {TOPIC_LABELS[topic]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FloatingInput
                          id="contact-name" name="name" type="text"
                          label={t('contact.form.name')} required
                          value={form.name} onChange={handleChange}
                        />
                        <FloatingInput
                          id="contact-phone" name="phone" type="tel"
                          label={t('contact.form.phone')}
                          value={form.phone} onChange={handleChange}
                        />
                      </div>
                      <FloatingInput
                        id="contact-email" name="email" type="email"
                        label={t('contact.form.email')} required
                        value={form.email} onChange={handleChange}
                      />
                      <div className="relative">
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {t('contact.form.message')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="message" rows={5} required
                          value={form.message} onChange={handleChange}
                          placeholder={t('contact.form.messagePlaceholder')}
                          className="w-full resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
                        />
                        <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">
                          {form.message.length}/500
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200/50 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-300/50 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
                      >
                        {isLoading
                          ? <><Loader2 size={16} className="animate-spin" /> {t('contact.form.sending')}</>
                          : <><Send size={15} /> {t('contact.form.submit')}</>
                        }
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar — 2 cols */}
            <div className="space-y-6 lg:col-span-2">
              {/* Map embed */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]">
                <iframe
                  title="Tapo Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.436823!2d106.7036!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM3LjAiTiAxMDbCsDQyJzEzLjAiRQ!5e0!3m2!1svi!2svn!4v1"
                  className="h-48 w-full grayscale opacity-90 dark:opacity-60"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">📍 Tapo Showroom Quận 1</p>
                  <p className="text-xs text-gray-400 mt-0.5">123 Nguyễn Huệ, Phường Bến Nghé, Quận 1</p>
                </div>
              </div>

              {/* Follow us */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('contact.followUs')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { Icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300' },
                    { Icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300' },
                    { Icon: Youtube, label: 'YouTube', color: 'hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300' },
                    { Icon: Twitter, label: 'Twitter/X', color: 'hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300' },
                  ].map(({ Icon, label, color }) => (
                    <a key={label} href="#" className={cn('flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-all', color)}>
                      <Icon size={14} /> {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('contact.faqTitle')}</h3>
                <div className="space-y-2">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex w-full items-center justify-between p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors"
                      >
                        {faq.q}
                        <ChevronRight size={13} className={cn('shrink-0 text-gray-400 transition-transform', openFaq === i && 'rotate-90')} />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-gray-100 dark:border-white/5 px-3 py-2.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ContactPage }
