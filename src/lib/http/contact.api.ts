import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export interface ContactMessageDto {
  id: string
  name: string
  email: string
  phone: string | null
  topic: string
  message: string
  isRead: boolean
  createdAt: string
}

export const contactApi = {
  /** Admin: list all messages — paginated */
  adminListMessages(params?: { page?: number; size?: number; unreadOnly?: boolean }) {
    return apiCall<PageResponse<ContactMessageDto>>(
      httpClient.get<ApiResponse<PageResponse<ContactMessageDto>>>('/api/admin/contact', { params }),
    )
  },

  /** Admin: mark message as read */
  adminMarkRead(id: string) {
    return apiCall<ContactMessageDto>(
      httpClient.put<ApiResponse<ContactMessageDto>>(`/api/admin/contact/${id}/read`),
    )
  },

  /** Admin: get unread count badge */
  adminGetUnreadCount() {
    return apiCall<number>(
      httpClient.get<ApiResponse<number>>('/api/admin/contact/unread-count'),
    )
  },

  /** Admin: reply to contact message — sends email async */
  adminReply(id: string, content: string) {
    return apiCall<ContactMessageDto>(
      httpClient.post<ApiResponse<ContactMessageDto>>(`/api/admin/contact/${id}/reply`, { content }),
    )
  },
}
