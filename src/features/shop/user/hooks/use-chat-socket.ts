/**
 * useChatSocket — STOMP WebSocket hook for live chat.
 *
 * Subscribes to /user/queue/chat/{roomId} for incoming messages.
 * Sends messages to /app/chat/{roomId}/send via STOMP.
 *
 * Pattern: mirrors useUserNotifications (react skill §2: custom hook)
 * Cleanup: client.deactivate() in useEffect cleanup
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ChatMessageDto } from '@/lib/http/chat.api'

const WS_URL  = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/ws`

interface UseChatSocketOptions {
  roomId: string | null
  onMessage: (msg: ChatMessageDto) => void
}

export function useChatSocket({ roomId, onMessage }: UseChatSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const clientRef   = useRef<Client | null>(null)
  const onMsgRef    = useRef(onMessage)

  // Keep ref in sync — avoids stale closure in STOMP callback (react skill §5)
  onMsgRef.current = onMessage

  useEffect(() => {
    if (!roomId) return

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
        // Subscribe to user-specific chat queue for this room
        client.subscribe(`/user/queue/chat/${roomId}`, frame => {
          try {
            const msg: ChatMessageDto = JSON.parse(frame.body)
            onMsgRef.current(msg)
          } catch {
            // ignore malformed payloads
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError:  () => setIsConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [roomId]) // reconnect when roomId changes

  /** Send a message via STOMP — fire-and-forget (server pushes back via subscription) */
  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current
    if (!client?.connected || !roomId) return
    client.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify({ content }),
    })
  }, [roomId])

  return { isConnected, sendMessage }
}
