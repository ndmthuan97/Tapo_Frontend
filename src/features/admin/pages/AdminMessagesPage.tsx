import { useState, useEffect, useRef, useCallback } from 'react'

import { cn } from '@/lib/utils'
import {
  Search, X, Mail, MailOpen, Trash2, Reply, Archive,
  ChevronDown, Filter, RefreshCw, MoreVertical, Circle,
  MessageSquare, AlertCircle, Info, CheckCircle2,
  Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { contactApi, type ContactMessageDto } from '@/lib/http/contact.api'
import { toast } from 'sonner'

// ── Types (aligned with backend ContactMessageDto) ────────────────────────────

type MessageTopic  = 'product' | 'order' | 'warranty' | 'shipping' | 'return' | 'other'

// ── Config ────────────────────────────────────────────────────────────────────

const TOPIC_CONFIG: Record<MessageTopic, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  product:  { label: 'Sản phẩm',    icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
  order:    { label: 'Đơn hàng',    icon: CheckCircle2,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  warranty: { label: 'Bảo hành',   icon: AlertCircle,   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
  shipping: { label: 'Vận chuyển', icon: Info,           color: 'text-cyan-600 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  return:   { label: 'Đổi/trả',    icon: RefreshCw,     color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-500/10' },
  other:    { label: 'Khác',        icon: Circle,        color: 'text-gray-500 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-white/10' },
}

const STATUS_FILTERS = [
  { key: 'all',    label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'read',   label: 'Đã đọc' },
] as const

const PAGE_SIZE = 20

/**
 * Map backend topic string to MessageTopic — fallback to 'other'
 */
function normalizeTopic(topic: string): MessageTopic {
  const map: Record<string, MessageTopic> = {
    'Sản phẩm': 'product', 'product': 'product',
    'Đơn hàng': 'order',   'order':   'order',
    'Bảo hành': 'warranty','warranty':'warranty',
    'Vận chuyển':'shipping','shipping':'shipping',
    'Đổi/trả':  'return',  'return':  'return',
    'Trả hàng': 'return',
  }
  return map[topic] ?? 'other'
}

// ── Message Row ───────────────────────────────────────────────────────────────

function MessageRow({
  msg, isSelected, onClick, onAction,
}: {
  msg: ContactMessageDto
  isSelected: boolean
  onClick: () => void
  onAction: (action: 'read' | 'delete') => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const topicKey = normalizeTopic(msg.topic)
  const TopicIcon = TOPIC_CONFIG[topicKey].icon

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
        !msg.isRead && 'bg-blue-50/30 dark:bg-blue-500/5',
      )}
    >
      {/* Unread dot */}
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
        <span className={cn('h-2 w-2 rounded-full', !msg.isRead ? 'bg-blue-500' : 'bg-transparent')} />
      </div>

      {/* Avatar */}
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=f97316&color=fff&size=40`}
        alt={msg.name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm truncate', !msg.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300')}>
            {msg.name}
          </p>
          <span className="shrink-0 text-[10px] text-gray-400">
            {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <p className={cn('text-xs truncate', !msg.isRead ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400')}>
          {msg.topic}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-400">{msg.message.split('\n')[0]}</p>

        {/* Topic badge */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold', TOPIC_CONFIG[topicKey].color, TOPIC_CONFIG[topicKey].bg)}>
            <TopicIcon size={8} /> {TOPIC_CONFIG[topicKey].label}
          </span>
          {msg.isRead && (
            <span className="rounded-full bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 text-[9px] text-gray-400">Đã đọc</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <MoreVertical size={13} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#2a2d3a] shadow-xl py-1">
              {!msg.isRead && (
                <button onClick={() => { onAction('read'); setMenuOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <MailOpen size={12} /> Đánh dấu đã đọc
                </button>
              )}
              <button onClick={() => { onAction('delete'); setMenuOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                <Trash2 size={12} /> Xóa (local)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function MessageDetail({
  msg, onClose, onReplied,
}: {
  msg: ContactMessageDto
  onClose: () => void
  onReplied: (updated: ContactMessageDto) => void
}) {
  const topicKey = normalizeTopic(msg.topic)
  const TopicIcon = TOPIC_CONFIG[topicKey].icon
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 p-5">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{msg.topic}</h2>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', TOPIC_CONFIG[topicKey].color, TOPIC_CONFIG[topicKey].bg)}>
            <TopicIcon size={9} /> {TOPIC_CONFIG[topicKey].label}
          </span>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Sender */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 p-5">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=f97316&color=fff&size=48`}
          alt={msg.name}
          className="h-11 w-11 rounded-full"
        />
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{msg.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{msg.email}</p>
          {msg.phone && <p className="text-xs text-gray-400">{msg.phone}</p>}
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] text-gray-400">{new Date(msg.createdAt).toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
          {msg.message.split('\n').map((line, i) => (
            <p key={i} className={cn('text-sm leading-relaxed text-gray-700 dark:text-gray-300', !line && 'h-3')}>{line}</p>
          ))}
        </div>
      </div>

      {/* Reply box (UI-only — email reply would need EmailService endpoint) */}
      <div className="border-t border-gray-100 dark:border-white/5 p-5">
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 px-4 py-2">
            <Reply size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">Trả lời → <strong className="text-gray-600 dark:text-gray-300">{msg.email}</strong></span>
          </div>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Nhập nội dung trả lời..."
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none"
          />
          <div className="flex items-center justify-end border-t border-gray-100 dark:border-white/5 px-4 py-2">
            <button
              disabled={!replyText.trim() || isSending}
              onClick={async () => {
                if (!replyText.trim()) return
                setIsSending(true)
                const res = await contactApi.adminReply(msg.id, replyText.trim())
                setIsSending(false)
                if (res.success && res.data) {
                  toast.success('Đã gửi email phản hồi thành công')
                  setReplyText('')
                  onReplied(res.data)
                } else {
                  toast.error('Gửi thất bại', { description: res.error?.message })
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending
                ? <><Loader2 size={12} className="animate-spin" /> Đang gửi...</>
                : <><Reply size={12} /> Gửi trả lời</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const res = await contactApi.adminListMessages({
      page,
      size: PAGE_SIZE,
      unreadOnly: statusFilter === 'unread',
    })
    setIsLoading(false)
    if (res.success && res.data) {
      setMessages(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    }
  }, [page, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  async function handleSelect(id: string) {
    setSelectedId(id)
    const msg = messages.find(m => m.id === id)
    if (!msg || msg.isRead) return
    // Mark as read via API
    const res = await contactApi.adminMarkRead(id)
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    }
  }

  function handleAction(id: string, action: 'read' | 'delete') {
    if (action === 'delete') {
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedId === id) setSelectedId(null)
    } else {
      contactApi.adminMarkRead(id)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    }
  }

  const filtered = messages.filter(m => {
    const matchStatus = statusFilter === 'all' || (statusFilter === 'unread' && !m.isRead) || (statusFilter === 'read' && m.isRead)
    const q = search.toLowerCase()
    const matchSearch = !q || m.topic.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const selectedMsg = messages.find(m => m.id === selectedId) ?? null
  const unreadCount = messages.filter(m => !m.isRead).length

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
          <p className="text-xs text-gray-400 mt-0.5">{totalElements} tin nhắn từ khách hàng</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Chưa đọc', count: messages.filter(m => !m.isRead).length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Mail },
          { label: 'Đã đọc',   count: messages.filter(m => m.isRead).length,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Tổng',     count: totalElements,                            color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-white/5', icon: Archive },
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
                      onClick={() => { setStatusFilter(f.key); setPage(0); setFilterOpen(false) }}
                      className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors', f.key === statusFilter ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5')}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2">
              <Loader2 size={20} className="animate-spin text-orange-500" />
              <p className="text-xs text-gray-400">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto divide-y divide-transparent">
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
                      onAction={action => handleAction(msg.id, action)}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-3 py-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                    <ChevronLeft size={12} />
                  </button>
                  <span className="text-[10px] text-gray-400">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 transition">
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selectedMsg ? (
          <div className="flex-1 overflow-hidden">
            <MessageDetail
              msg={selectedMsg}
              onClose={() => setSelectedId(null)}
              onReplied={updated => {
                setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
              }}
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
