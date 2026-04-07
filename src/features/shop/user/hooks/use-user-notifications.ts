/**
 * useUserNotifications — WebSocket STOMP hook for shop customers.
 *
 * Subscribes to /user/queue/notifications (user-specific queue).
 * Surfaces realtime order status updates as:
 * - Toast notification (sonner)
 * - Unread count badge
 * - Notification history list (latest 20)
 *
 * Pattern: mirrors useAdminNotifications (react skill §2: custom hook)
 * Cleanup: client.deactivate() in useEffect cleanup (react skill §2)
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { toast } from 'sonner'
import { Package, RotateCcw, Tag } from 'lucide-react'
import React from 'react'

export type UserNotificationType =
  | 'ORDER_STATUS_CHANGED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'VOUCHER_NEW'

export interface UserNotification {
  id: string          // client-generated key
  type: UserNotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
}

const WS_URL     = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/ws`
const USER_TOPIC = '/user/queue/notifications'
const MAX_ITEMS  = 20

export const USER_NOTIFICATION_CONFIG: Record<UserNotificationType, {
  icon: React.ElementType
  color: string
}> = {
  ORDER_STATUS_CHANGED: { icon: Package,   color: 'text-orange-500' },
  RETURN_APPROVED:      { icon: RotateCcw, color: 'text-green-500'  },
  RETURN_REJECTED:      { icon: RotateCcw, color: 'text-rose-500'   },
  VOUCHER_NEW:          { icon: Tag,       color: 'text-blue-500'   },
}

export function useUserNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [isConnected,   setIsConnected]   = useState(false)

  // stable ref — avoids stale closure in STOMP callback (react skill §5)
  const onMessageRef = useRef<(raw: Omit<UserNotification, 'id' | 'read'>) => void>(() => undefined)

  onMessageRef.current = useCallback((raw: Omit<UserNotification, 'id' | 'read'>) => {
    const notification: UserNotification = {
      ...raw,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
    }

    setNotifications(prev => [notification, ...prev].slice(0, MAX_ITEMS))
    setUnreadCount(c => c + 1)

    const cfg = USER_NOTIFICATION_CONFIG[notification.type]
    const Icon = cfg?.icon ?? Package
    toast(notification.title, {
      description: notification.message,
      icon: React.createElement(Icon, { size: 16, className: cfg?.color ?? 'text-orange-500' }),
      duration: 5000,
    })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? ''
    if (!token) return // không connect nếu chưa login

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL, null, {
        transports: ['xhr-streaming', 'xhr-polling'],
      }) as WebSocket,
      reconnectDelay: 8000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(USER_TOPIC, frame => {
          try {
            const parsed = JSON.parse(frame.body)
            onMessageRef.current(parsed)
          } catch {
            // ignore malformed payloads
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError:  () => setIsConnected(false),
    })

    client.activate()
    return () => { client.deactivate() }
  }, []) // connect once per lifecycle

  const clearUnread  = useCallback(() => setUnreadCount(0), [])
  const markAllRead  = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, isConnected, clearUnread, markAllRead }
}
