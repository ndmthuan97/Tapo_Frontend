import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type BulkReviewAction = 'APPROVE' | 'REJECT'

export interface AdminReviewDto {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  productId: string
  productName: string
  productThumbnail: string | null
  rating: number
  comment: string | null
  images: string[] | null
  status: ReviewStatus
  createdAt: string
  /** Admin reply — null nếu chưa có */
  adminReply: string | null
  repliedAt: string | null
}

export const adminReviewApi = {
  listAll(params?: { status?: ReviewStatus; rating?: number; page?: number; size?: number }) {
    return apiCall<PageResponse<AdminReviewDto>>(
      httpClient.get<ApiResponse<PageResponse<AdminReviewDto>>>('/api/admin/reviews', {
        params: { page: 0, size: 20, ...params },
      }),
    )
  },

  approve(id: string) {
    return apiCall<AdminReviewDto>(
      httpClient.patch<ApiResponse<AdminReviewDto>>(`/api/admin/reviews/${id}/approve`),
    )
  },

  reject(id: string) {
    return apiCall<AdminReviewDto>(
      httpClient.patch<ApiResponse<AdminReviewDto>>(`/api/admin/reviews/${id}/reject`),
    )
  },

  pendingCount() {
    return apiCall<{ count: number }>(
      httpClient.get<ApiResponse<{ count: number }>>('/api/admin/reviews/pending-count'),
    )
  },

  /** Gửi hoặc xóa reply của admin cho một review */
  reply(id: string, reply: string) {
    return apiCall<AdminReviewDto>(
      httpClient.post<ApiResponse<AdminReviewDto>>(`/api/admin/reviews/${id}/reply`, { reply }),
    )
  },

  /**
   * Bulk approve / reject nhiều reviews cùng lúc.
   * @returns danh sách reviewId đã được xử lý
   */
  bulkAction(reviewIds: string[], action: BulkReviewAction) {
    return apiCall<string[]>(
      httpClient.patch<ApiResponse<string[]>>('/api/admin/reviews/bulk-action', {
        reviewIds,
        action,
      }),
    )
  },
}
