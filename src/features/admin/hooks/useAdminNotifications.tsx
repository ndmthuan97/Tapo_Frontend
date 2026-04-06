/**
 * useAdminNotifications — WebSocket STOMP hook (react skill §2: custom hook).
 *
 * Subscribes to /topic/admin/notifications and surfaces realtime events as:
 * - Toast notifications (via sonner)
 * - Unread count badge (incremented per notification)
 * - Notification history list (latest 50)
 *
 * Cleanup: client disconnected in useEffect cleanup (react skill §2: clean up effects).
 * Stable ref: avoids stale closure in STOMP callback (react skill §5: advanced-event-handler-refs).
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { toast } from 'sonner'
import { ShoppingBag, RotateCcw, MessageSquare } from 'lucide-react'
import React from 'react'

export type NotificationType = 'NEW_ORDER' | 'NEW_RETURN_REQUEST' | 'NEW_CONTACT_MESSAGE'

export interface AdminNotification {
  type: NotificationType
  title: string
  message: string
  timestamp: string
  meta: Record<string, string>
  id: string // client-generated for React key
}

// ── Config ─────────────────────────────────────────────────────────────────────

const WS_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/ws`
const TOPIC   = '/topic/admin/notifications'
const MAX_HISTORY = 50

// Static map — react skill §5: js-index-maps for O(1) lookup
export const TYPE_CONFIG: Record<NotificationType, {
  icon: React.ElementType
  color: string
}> = {
  NEW_ORDER:            { icon: ShoppingBag,   color: 'text-orange-500' },
  NEW_RETURN_REQUEST:   { icon: RotateCcw,      color: 'text-rose-500' },
  NEW_CONTACT_MESSAGE:  { icon: MessageSquare,  color: 'text-blue-500' },
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [isConnected,   setIsConnected]   = useState(false)

  // stable ref — avoids stale closure inside STOMP frame callback
  const onMessageRef = useRef<(raw: AdminNotification) => void>(() => undefined)

  onMessageRef.current = useCallback((data: AdminNotification) => {
    const notification: AdminNotification = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
    }

    setNotifications(prev => [notification, ...prev].slice(0, MAX_HISTORY))
    setUnreadCount(c => c + 1)

    // Toast with icon — react skill §4: always surface events to user
    const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.NEW_CONTACT_MESSAGE
    const Icon = cfg.icon
    toast(notification.title, {
      description: notification.message,
      icon: React.createElement(Icon, { size: 16, className: cfg.color }),
      duration: 6000,
    })
  }, [])

  useEffect(() => {
    // Read JWT from localStorage (same key as http-client.ts interceptor)
    const token = localStorage.getItem('accessToken') ?? ''

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL, null, {
        // xhr-polling: works on Azure without WebSocket setting enabled.
        // Enable 'websocket' only after turning on "Web sockets" in Azure Portal
        // (App Service → Configuration → General settings → Web sockets: On).
        transports: ['xhr-streaming', 'xhr-polling'],
      }) as WebSocket,
      reconnectDelay: 5000,
      // Sprint 1: pass JWT on STOMP CONNECT — validated by StompAuthChannelInterceptor
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(TOPIC, frame => {
          try {
            const parsed: AdminNotification = JSON.parse(frame.body)
            onMessageRef.current(parsed)
          } catch {
            // ignore malformed payloads
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    })

    client.activate()

    // Cleanup on unmount — react skill §2: clean up effects
    return () => { client.deactivate() }
  }, []) // connect once per component lifecycle

  const clearUnread  = useCallback(() => setUnreadCount(0), [])
  const clearHistory = useCallback(() => setNotifications([]), [])

  return { notifications, unreadCount, isConnected, clearUnread, clearHistory }
}
