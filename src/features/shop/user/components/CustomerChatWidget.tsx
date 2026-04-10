/**
 * CustomerChatWidget — floating live chat button & panel for shop customers.
 *
 * react skill §1: compound component pattern (trigger + panel)
 * react skill §4: loading/error/empty states
 * react skill §5: useCallback for stable handlers, useRef for scroll
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { chatApi, type ChatMessageDto, type ChatRoomDto } from '@/lib/http/chat.api'
import { useChatSocket } from '@/features/shop/user/hooks/use-chat-socket'
import { useAuthContext } from '@/lib/context/auth-context'

// ── Formatters ──────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// ── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine }: { msg: ChatMessageDto; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm
          ${isMine
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-zinc-700 rounded-bl-sm'
          }`}
      >
        <p className="leading-snug break-words">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isMine ? 'text-orange-100' : 'text-gray-400 dark:text-zinc-500'} text-right`}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

// ── Main Widget ─────────────────────────────────────────────────────────────
export function CustomerChatWidget() {
  const { user } = useAuthContext()
  const [isOpen,    setIsOpen]    = useState(false)
  const [room,      setRoom]      = useState<ChatRoomDto | null>(null)
  const [messages,  setMessages]  = useState<ChatMessageDto[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sending,   setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Open panel: open/get room + load history
  const openChat = useCallback(async () => {
    setIsOpen(true)
    if (room) return // already loaded
    setLoading(true)
    try {
      const r = await chatApi.openRoom()
      setRoom(r)
      const msgs = await chatApi.getMessages(r.id)
      setMessages(msgs)
      chatApi.markAsRead(r.id).catch(() => undefined)
    } catch {
      toast.error('Không thể kết nối chat. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [room])

  // STOMP WebSocket — receive new messages
  const handleIncomingMessage = useCallback((msg: ChatMessageDto) => {
    setMessages(prev => {
      const alreadyExists = prev.some(m => m.id === msg.id)
      return alreadyExists ? prev : [...prev, msg]
    })
    chatApi.markAsRead(room?.id ?? '').catch(() => undefined)
  }, [room?.id])

  const { isConnected, sendMessage: stompSend } = useChatSocket({
    roomId: room?.id ?? null,
    onMessage: handleIncomingMessage,
  })

  // Send message handler
  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content || !room || sending) return
    setInput('')
    setSending(true)

    // Optimistic update (react skill §4)
    const optimisticMsg: ChatMessageDto = {
      id:          `opt-${Date.now()}`,
      roomId:      room.id,
      senderId:    user?.id ?? '',
      senderName:  user?.fullName ?? 'Bạn',
      senderAvatar: user?.avatarUrl ?? null,
      content,
      isRead:      false,
      createdAt:   new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      if (isConnected) {
        stompSend(content)
      } else {
        // Fallback to REST if WS not connected
        const sent = await chatApi.sendMessage(room.id, content)
        // Replace optimistic with server response
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sent : m))
      }
    } catch {
      // Rollback optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      toast.error('Gửi tin nhắn thất bại')
    } finally {
      setSending(false)
    }
  }, [input, room, sending, isConnected, stompSend, user])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Don't show for unauthenticated users
  if (!user) return null

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="chat-widget-trigger"
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center
                   rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200
                   hover:bg-orange-600 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Mở chat hỗ trợ"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col rounded-2xl
                     bg-gray-50 dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700
                     overflow-hidden"
          style={{ height: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500">
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Tapo Hỗ Trợ</p>
              <p className="text-orange-100 text-xs">
                {isConnected ? '🟢 Trực tuyến' : '🔴 Đang kết nối...'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-orange-400" />
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <MessageCircle size={36} className="text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">Bắt đầu cuộc trò chuyện!</p>
                <p className="text-gray-300 text-xs mt-1">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.senderId === user?.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Room closed banner */}
          {room?.status === 'CLOSED' && (
            <div className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-center">
              <p className="text-xs text-gray-500">Phòng chat đã đóng</p>
            </div>
          )}

          {/* Input row */}
          {room?.status !== 'CLOSED' && (
            <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              {!isConnected && (
                <WifiOff size={14} className="text-gray-400 mt-1 shrink-0" title="Đang dùng REST fallback" />
              )}
              <textarea
                id="chat-input"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={sending}
                className="flex-1 resize-none bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2
                           text-sm text-gray-800 dark:text-gray-100 outline-none min-h-[36px] max-h-[90px]
                           placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                id="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500
                           text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Gửi"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
