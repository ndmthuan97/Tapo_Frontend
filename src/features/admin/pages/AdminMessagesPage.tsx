import { useState, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import {
  Search, X, Mail, MailOpen, Star, Trash2, Reply, Archive,
  ChevronDown, Filter, RefreshCw, MoreVertical, Circle,
  MessageSquare, AlertCircle, Info, CheckCircle2, Clock,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type MessageStatus = 'unread' | 'read' | 'replied' | 'archived'
type MessageTopic = 'product' | 'order' | 'warranty' | 'shipping' | 'return' | 'other'
type MessagePriority = 'low' | 'normal' | 'high' | 'urgent'

interface ContactMessage {
  id: string
  senderName: string
  senderEmail: string
  senderPhone?: string
  topic: MessageTopic
  subject: string
  body: string
  receivedAt: string
  status: MessageStatus
  priority: MessagePriority
  starred: boolean
  replyCount: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_MESSAGES: ContactMessage[] = [
  { id: 'm1', senderName: 'Nguyễn Văn An', senderEmail: 'nvan@gmail.com', senderPhone: '0901234567', topic: 'order', subject: 'Đơn hàng ORD-A1B2C3 chưa nhận được sau 5 ngày', body: 'Chào Tapo,\n\nMình đã đặt hàng từ ngày 24/03 nhưng đến nay (29/03) vẫn chưa nhận được. Shipping code là GHN123456. Làm ơn kiểm tra giúp mình.\n\nCảm ơn!', receivedAt: '2025-03-29T09:15:00Z', status: 'unread', priority: 'urgent', starred: true, replyCount: 0 },
  { id: 'm2', senderName: 'Trần Thị Bình', senderEmail: 'ttbinh@gmail.com', senderPhone: '0912345678', topic: 'product', subject: 'Hỏi về RAM laptop Lenovo Legion 5i Gen 8', body: 'Bạn ơi, cho hỏi laptop Lenovo Legion 5i Gen 8 có upgrade RAM lên 32GB được không? Và loại RAM nào phù hợp?', receivedAt: '2025-03-29T08:30:00Z', status: 'unread', priority: 'normal', starred: false, replyCount: 0 },
  { id: 'm3', senderName: 'Lê Hoàng Cường', senderEmail: 'lhcuong@gmail.com', topic: 'warranty', subject: 'Laptop bị lỗi màn hình sau 3 tháng sử dụng', body: 'Laptop Dell XPS 15 mua tại Tapo bị lỗi màn hình (có sọc ngang). Mình muốn đem đến bảo hành, cần mang theo giấy tờ gì?', receivedAt: '2025-03-28T16:45:00Z', status: 'replied', priority: 'high', starred: true, replyCount: 2 },
  { id: 'm4', senderName: 'Phạm Minh Đức', senderEmail: 'pmduc@gmail.com', senderPhone: '0934567890', topic: 'return', subject: 'Sản phẩm không giống mô tả, muốn đổi trả', body: 'Tôi mua chuột gaming Logitech nhưng nhận được sản phẩm khác màu so với quảng cáo. Tôi muốn đổi màu đen như đã chọn.', receivedAt: '2025-03-28T14:00:00Z', status: 'read', priority: 'normal', starred: false, replyCount: 0 },
  { id: 'm5', senderName: 'Võ Thanh Giang', senderEmail: 'vtgiang@gmail.com', topic: 'shipping', subject: 'Hỏi về phí ship cho đơn hàng > 5 triệu', body: 'Mình muốn mua laptop 25 triệu. Vậy phí ship về Cần Thơ là bao nhiêu? Có miễn phí không?', receivedAt: '2025-03-27T11:20:00Z', status: 'archived', priority: 'low', starred: false, replyCount: 1 },
  { id: 'm6', senderName: 'Nguyễn Thị Hoa', senderEmail: 'nthoa@gmail.com', senderPhone: '0956789012', topic: 'other', subject: 'Góp ý về trải nghiệm mua sắm', body: 'Chào Tapo, mình muốn góp ý. Website hơi chậm và filter sản phẩm đôi khi bị lỗi. Hy vọng team kỹ thuật cải thiện sớm!', receivedAt: '2025-03-26T09:00:00Z', status: 'read', priority: 'low', starred: false, replyCount: 0 },
]

// ── Config ────────────────────────────────────────────────────────────────────

const TOPIC_CONFIG: Record<MessageTopic, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  product:  { label: 'Sản phẩm',    icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
  order:    { label: 'Đơn hàng',    icon: CheckCircle2,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  warranty: { label: 'Bảo hành',   icon: AlertCircle,   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
  shipping: { label: 'Vận chuyển', icon: Info,           color: 'text-cyan-600 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  return:   { label: 'Đổi/trả',    icon: RefreshCw,     color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-500/10' },
  other:    { label: 'Khác',        icon: Circle,        color: 'text-gray-500 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-white/10' },
}

const PRIORITY_CONFIG: Record<MessagePriority, { label: string; color: string; dot: string }> = {
  low:    { label: 'Thấp',   color: 'text-gray-400',                         dot: 'bg-gray-300' },
  normal: { label: 'Thường', color: 'text-blue-500 dark:text-blue-400',      dot: 'bg-blue-400' },
  high:   { label: 'Cao',    color: 'text-amber-600 dark:text-amber-400',    dot: 'bg-amber-500' },
  urgent: { label: 'Khẩn',   color: 'text-red-600 dark:text-red-400',        dot: 'bg-red-500' },
}

const STATUS_FILTERS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'unread',   label: 'Chưa đọc' },
  { key: 'read',     label: 'Đã đọc' },
  { key: 'replied',  label: 'Đã trả lời' },
  { key: 'archived', label: 'Lưu trữ' },
] as const

// ── Message row ───────────────────────────────────────────────────────────────

function MessageRow({
  msg, isSelected, onClick, onStar, onAction,
}: {
  msg: ContactMessage
  isSelected: boolean
  onClick: () => void
  onStar: () => void
  onAction: (action: 'read' | 'archive' | 'delete') => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const TopicIcon = TOPIC_CONFIG[msg.topic].icon

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-start gap-3 border-b border-gray-100 dark:border-white/5 px-4 py-3.5 transition-all hover:bg-gray-50 dark:hover:bg-white/3',
        isSelected && 'bg-orange-50/60 dark:bg-orange-500/5 border-l-2 border-l-orange-500',
        msg.status === 'unread' && 'bg-blue-50/30 dark:bg-blue-500/5',
      )}
    >
      {/* Unread dot */}
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
        {msg.status === 'unread' ? (
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-transparent" />
        )}
      </div>

      {/* Avatar */}
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=f97316&color=fff&size=40`}
        alt={msg.senderName}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm truncate', msg.status === 'unread' ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300')}>
            {msg.senderName}
          </p>
          <span className="shrink-0 text-[10px] text-gray-400">
            {new Date(msg.receivedAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className={cn('text-xs truncate flex-1', msg.status === 'unread' ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400')}>
            {msg.subject}
          </p>
          {/* Priority dot */}
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', PRIORITY_CONFIG[msg.priority].dot)} title={PRIORITY_CONFIG[msg.priority].label} />
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-400">{msg.body.split('\n')[0]}</p>

        {/* Badges */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold', TOPIC_CONFIG[msg.topic].color, TOPIC_CONFIG[msg.topic].bg)}>
            <TopicIcon size={8} /> {TOPIC_CONFIG[msg.topic].label}
          </span>
          {msg.replyCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 text-[9px] text-gray-500 dark:text-gray-400">
              <Reply size={8} /> {msg.replyCount}
            </span>
          )}
          {msg.status === 'archived' && (
            <span className="rounded-full bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 text-[9px] text-gray-400">Lưu trữ</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 ml-1" onClick={e => e.stopPropagation()}>
        <button
          onClick={onStar}
          className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-500/10', msg.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400')}
        >
          <Star size={13} className={msg.starred ? 'fill-current' : ''} />
        </button>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <MoreVertical size={13} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1">
              {msg.status !== 'read' && (
                <button onClick={() => { onAction('read'); setMenuOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <MailOpen size={12} /> Đánh dấu đã đọc
                </button>
              )}
              <button onClick={() => { onAction('archive'); setMenuOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                <Archive size={12} /> Lưu trữ
              </button>
              <button onClick={() => { onAction('delete'); setMenuOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                <Trash2 size={12} /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function MessageDetail({ msg, onReply, onClose }: { msg: ContactMessage; onReply: (text: string) => void; onClose: () => void }) {
  const [replyText, setReplyText] = useState('')
  const TopicIcon = TOPIC_CONFIG[msg.topic].icon

  function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim()) return
    onReply(replyText)
    setReplyText('')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 p-5">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{msg.subject}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', TOPIC_CONFIG[msg.topic].color, TOPIC_CONFIG[msg.topic].bg)}>
              <TopicIcon size={9} /> {TOPIC_CONFIG[msg.topic].label}
            </span>
            <span className={cn('text-[10px] font-semibold', PRIORITY_CONFIG[msg.priority].color)}>
              ● {PRIORITY_CONFIG[msg.priority].label}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Sender info */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 p-5">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=f97316&color=fff&size=48`}
          alt={msg.senderName}
          className="h-11 w-11 rounded-full"
        />
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{msg.senderName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{msg.senderEmail}</p>
          {msg.senderPhone && <p className="text-xs text-gray-400">{msg.senderPhone}</p>}
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] text-gray-400">{new Date(msg.receivedAt).toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
          {msg.body.split('\n').map((line, i) => (
            <p key={i} className={cn('text-sm leading-relaxed text-gray-700 dark:text-gray-300', !line && 'h-3')}>{line}</p>
          ))}
        </div>
        {msg.replyCount > 0 && (
          <p className="mt-3 text-center text-xs text-gray-400">── {msg.replyCount} tin nhắn trả lời trước đó ──</p>
        )}
      </div>

      {/* Reply box */}
      <div className="border-t border-gray-100 dark:border-white/5 p-5">
        <form onSubmit={handleReply}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-4 py-2">
              <Reply size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">Trả lời → <strong className="text-gray-600 dark:text-gray-300">{msg.senderEmail}</strong></span>
            </div>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Nhập nội dung trả lời..."
              rows={3}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-4 py-2">
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors">
                  <Archive size={13} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Reply size={12} /> Gửi trả lời
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_MESSAGES)
  const [selectedId, setSelectedId] = useState<string | null>('m1')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = messages.filter(m => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || m.subject.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q) || m.senderEmail.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const selectedMsg = messages.find(m => m.id === selectedId) ?? null

  const unreadCount = messages.filter(m => m.status === 'unread').length

  function handleSelect(id: string) {
    setSelectedId(id)
    setMessages(prev => prev.map(m => m.id === id && m.status === 'unread' ? { ...m, status: 'read' } : m))
  }

  function handleStar(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m))
  }

  function handleAction(id: string, action: 'read' | 'archive' | 'delete') {
    if (action === 'delete') {
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedId === id) setSelectedId(null)
    } else {
      setMessages(prev => prev.map(m => m.id === id ? {
        ...m,
        status: action === 'read' ? 'read' : 'archived',
      } : m))
    }
  }

  function handleReply(_text: string) {
    if (!selectedId) return
    setMessages(prev => prev.map(m => m.id === selectedId ? { ...m, status: 'replied', replyCount: m.replyCount + 1 } : m))
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail size={18} className="text-orange-500" />
            Hộp thư liên hệ
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Tin nhắn từ khách hàng qua trang liên hệ</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          { label: 'Chưa đọc', count: messages.filter(m => m.status === 'unread').length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Mail },
          { label: 'Chờ trả lời', count: messages.filter(m => m.status === 'read').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
          { label: 'Đã trả lời', count: messages.filter(m => m.status === 'replied').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Lưu trữ', count: messages.filter(m => m.status === 'archived').length, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-white/5', icon: Archive },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-3">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', bg)}>
              <Icon size={14} className={color} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d]">
        {/* Message list */}
        <div className={cn('flex flex-col border-r border-gray-100 dark:border-white/5', selectedMsg ? 'hidden md:flex md:w-72 lg:w-80 shrink-0' : 'flex-1')}>
          {/* List toolbar */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 p-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn('flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all', statusFilter !== 'all' ? 'border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500')}
              >
                <Filter size={11} />
                <ChevronDown size={10} className={cn('transition-transform', filterOpen && 'rotate-180')} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => { setStatusFilter(f.key); setFilterOpen(false) }}
                      className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors', f.key === statusFilter ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}
                    >
                      {f.label}
                      <span className="ml-auto text-gray-400">{f.key === 'all' ? messages.length : messages.filter(m => m.status === f.key).length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="group flex-1 overflow-y-auto divide-y divide-transparent">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MailOpen size={28} className="text-gray-300 dark:text-white/20 mb-2" />
                <p className="text-xs text-gray-400">Không có tin nhắn nào</p>
              </div>
            ) : (
              filtered.map(msg => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  isSelected={selectedId === msg.id}
                  onClick={() => handleSelect(msg.id)}
                  onStar={() => handleStar(msg.id)}
                  onAction={action => handleAction(msg.id, action)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedMsg ? (
          <div className="flex-1 overflow-hidden">
            <MessageDetail
              msg={selectedMsg}
              onReply={handleReply}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex flex-col items-center text-center opacity-40">
              <MessageSquare size={40} className="text-gray-300 dark:text-white/20 mb-3" />
              <p className="text-sm text-gray-400">Chọn tin nhắn để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AdminMessagesPage }
