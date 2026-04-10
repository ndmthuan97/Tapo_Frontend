import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'

export interface ChatRoomDto {
  id: string
  customerId: string
  customerName: string
  customerAvatar: string | null
  staffId: string | null
  staffName: string | null
  status: 'OPEN' | 'CLOSED'
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
}

export interface ChatMessageDto {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  content: string
  isRead: boolean
  createdAt: string
}

const BASE = '/api/chat'

export const chatApi = {
  /** Customer: open or get existing OPEN room */
  openRoom() {
    return apiCall<ChatRoomDto>(
      httpClient.post<ApiResponse<ChatRoomDto>>(`${BASE}/rooms`, {}),
    )
  },

  /** Get paginated messages for a room */
  getMessages(roomId: string, page = 0, size = 50) {
    return apiCall<ChatMessageDto[]>(
      httpClient.get<ApiResponse<ChatMessageDto[]>>(`${BASE}/rooms/${roomId}/messages`, {
        params: { page, size },
      }),
    )
  },

  /** REST fallback: send message (prefer STOMP) */
  sendMessage(roomId: string, content: string) {
    return apiCall<ChatMessageDto>(
      httpClient.post<ApiResponse<ChatMessageDto>>(`${BASE}/rooms/${roomId}/messages`, { content }),
    )
  },

  /** Mark all as read */
  markAsRead(roomId: string) {
    return apiCall<void>(
      httpClient.post<ApiResponse<void>>(`${BASE}/rooms/${roomId}/read`, {}),
    )
  },

  /** Admin: list all rooms */
  listRooms() {
    return apiCall<ChatRoomDto[]>(
      httpClient.get<ApiResponse<ChatRoomDto[]>>(`${BASE}/rooms`),
    )
  },

  /** Admin: close a room */
  closeRoom(roomId: string) {
    return apiCall<ChatRoomDto>(
      httpClient.post<ApiResponse<ChatRoomDto>>(`${BASE}/rooms/${roomId}/close`, {}),
    )
  },
}
