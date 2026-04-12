/**
 * AdminChatPage — LiveChat management for Admin/Staff.
 *
 * Layout: 2-panel (room list left, message thread right)
 * Real-time: subscribes to /topic/admin/chat for incoming messages
 * react skill §1: compound component pattern
 * react skill §4: loading/error/empty states
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageCircle, User, Clock, XCircle,
  Send, Loader2, RefreshCw, WifiOff, Circle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { chatApi, type ChatRoomDto, type ChatMessageDto } from '@/lib/http/chat.api'
import { useAuthContext } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'

const WS_URL   = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/ws`
const ADMIN_CHAT_TOPIC = '/topic/admin/chat'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('vi-VN')
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isOpen = status === 'OPEN'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      isOpen
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
    )}>
      <Circle size={6} fill="currentColor" />
      {isOpen ? 'Đang mở' : 'Đã đóng'}
    </span>
  )
}

// ── Room List Item ────────────────────────────────────────────────────────────
function RoomItem({
  room, isActive, onClick,
}: { room: ChatRoomDto; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-zinc-800',
        isActive
          ? 'bg-orange-50 dark:bg-orange-500/10'
          : 'hover:bg-gray-50 dark:hover:bg-white/5',
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
        <User size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {room.customerName}
          </p>
          <StatusBadge status={room.status} />
        </div>
        {room.lastMessage && (
          <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {room.lastMessage}
          </p>
        )}
        {room.lastMessageAt && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {formatTime(room.lastMessageAt)}
          </p>
        )}
        {room.unreadCount > 0 && (
          <span className="mt-1 inline-flex items-center rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
            {room.unreadCount} mới
          </span>
        )}
      </div>
    </button>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, adminId }: { msg: ChatMessageDto; adminId: string }) {
  const isAdmin = msg.senderId === adminId
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm',
        isAdmin
          ? 'bg-orange-500 text-white rounded-br-sm'
          : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-zinc-700 rounded-bl-sm',
      )}>
        <p className="leading-snug break-words">{msg.content}</p>
        <p className={cn('text-[10px] mt-1 text-right',
          isAdmin ? 'text-orange-100' : 'text-gray-400 dark:text-zinc-500')}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminChatPage() {
  const { user }  = useAuthContext()

  const [rooms,       setRooms]       = useState<ChatRoomDto[]>([])
  const [activeRoom,  setActiveRoom]  = useState<ChatRoomDto | null>(null)
  const [messages,    setMessages]    = useState<ChatMessageDto[]>([])
  const [input,       setInput]       = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMsgs,  setLoadingMsgs]  = useState(false)
  const [sending,      setSending]      = useState(false)
  const [isConnected,  setIsConnected]  = useState(false)

  const clientRef  = useRef<Client | null>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const activeRoomRef = useRef<ChatRoomDto | null>(null)
  activeRoomRef.current = activeRoom

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load room list
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true)
    try {
      const res = await chatApi.listRooms()
      setRooms(res.data ?? [])
    } catch {
      toast.error('Không thể tải danh sách chat')
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  useEffect(() => { loadRooms() }, [loadRooms])

  // STOMP: subscribe to /topic/admin/chat for incoming customer messages
  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? ''
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL, null, {
        transports: ['xhr-streaming', 'xhr-polling'],
      }) as WebSocket,
      reconnectDelay: 8000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setIsConnected(true)
        // Listen for new messages on admin topic
        client.subscribe(ADMIN_CHAT_TOPIC, frame => {
          try {
            const msg: ChatMessageDto = JSON.parse(frame.body)
            // Add to messages if currently viewing that room
            if (activeRoomRef.current?.id === msg.roomId) {
              setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
            }
            // Update last message in room list
            setRooms(prev => prev.map(r =>
              r.id === msg.roomId
                ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: activeRoomRef.current?.id === msg.roomId ? 0 : r.unreadCount + 1 }
                : r,
            ))
          } catch { /* ignore */ }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError:  () => setIsConnected(false),
    })
    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, []) // connect once

  // Select a room → load its messages
  const selectRoom = useCallback(async (room: ChatRoomDto) => {
    if (activeRoom?.id === room.id) return
    setActiveRoom(room)
    setMessages([])
    setLoadingMsgs(true)
    try {
      const msgsRes = await chatApi.getMessages(room.id)
      setMessages(msgsRes.data ?? [])
      chatApi.markAsRead(room.id).catch(() => undefined)
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r))
    } catch {
      toast.error('Không thể tải tin nhắn')
    } finally {
      setLoadingMsgs(false)
    }
  }, [activeRoom?.id])

  // Send via STOMP or REST fallback
  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content || !activeRoom || sending) return
    setInput('')
    setSending(true)

    const optimisticMsg: ChatMessageDto = {
      id:          `opt-${Date.now()}`,
      roomId:      activeRoom.id,
      senderId:    user?.id ?? '',
      senderName:  user?.fullName ?? 'Admin',
      senderAvatar: user?.avatarUrl ?? null,
      content,
      isRead:      false,
      createdAt:   new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const client = clientRef.current
      if (client?.connected) {
        client.publish({
          destination: `/app/chat/${activeRoom.id}/send`,
          body: JSON.stringify({ content }),
        })
        // Remove optimistic (server will push real one back via admin topic)
        setTimeout(() => setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)), 300)
      } else {
        const sentRes = await chatApi.sendMessage(activeRoom.id, content)
        if (sentRes.data) {
          setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sentRes.data! : m))
        }
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      toast.error('Gửi thất bại')
    } finally {
      setSending(false)
    }
  }, [input, activeRoom, sending, user])

  // Close room
  const handleClose = useCallback(async () => {
    if (!activeRoom) return
    try {
      const res = await chatApi.closeRoom(activeRoom.id)
      const updated = res.data!
      setActiveRoom(updated)
      setRooms(prev => prev.map(r => r.id === updated.id ? updated : r))
      toast.success('Đã đóng phòng chat')
    } catch {
      toast.error('Không thể đóng phòng chat')
    }
  }, [activeRoom])

  return (
    <div className="flex h-full rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
      {/* Left panel: room list */}
      <div className="w-72 shrink-0 flex flex-col border-r border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
            <MessageCircle size={16} className="text-orange-500" />
            Hộp chat ({rooms.length})
          </h2>
          <div className="flex items-center gap-2">
            {!isConnected && <WifiOff size={14} className="text-gray-400" aria-label="Mất kết nối WS" />}
            <button onClick={loadRooms} className="text-gray-400 hover:text-gray-600" title="Làm mới">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingRooms && (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-orange-400" /></div>
          )}
          {!loadingRooms && rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
              <MessageCircle size={28} className="mb-2 text-gray-300" />
              Chưa có chat nào
            </div>
          )}
          {rooms.map(room => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={activeRoom?.id === room.id}
              onClick={() => selectRoom(room)}
            />
          ))}
        </div>
      </div>

      {/* Right panel: message thread */}
      <div className="flex flex-1 flex-col min-w-0">
        {!activeRoom ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <MessageCircle size={48} className="mb-3 text-gray-200 dark:text-zinc-700" />
            <p className="text-sm">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 shrink-0 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{activeRoom.customerName}</p>
                  <StatusBadge status={activeRoom.status} />
                </div>
              </div>
              {activeRoom.status === 'OPEN' && (
                <button
                  id="admin-chat-close-btn"
                  onClick={handleClose}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <XCircle size={13} />
                  Đóng phòng
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth">
              {loadingMsgs ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-orange-400" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                  <MessageCircle size={28} className="mb-2 text-gray-300" />
                  Chưa có tin nhắn
                </div>
              ) : (
                messages.map(msg => (
                  <Bubble key={msg.id} msg={msg} adminId={user?.id ?? ''} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {activeRoom.status === 'OPEN' ? (
              <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-zinc-800">
                <textarea
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                  }}
                  placeholder="Trả lời khách hàng..."
                  disabled={sending}
                  className="flex-1 resize-none bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm
                             text-gray-800 dark:text-gray-100 outline-none min-h-[36px] max-h-[90px]
                             placeholder:text-gray-400 disabled:opacity-50"
                />
                <button
                  id="admin-chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500
                             text-white hover:bg-orange-600 transition-colors disabled:opacity-40"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-800 text-center">
                <p className="text-xs text-gray-400">Phòng chat đã đóng</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
