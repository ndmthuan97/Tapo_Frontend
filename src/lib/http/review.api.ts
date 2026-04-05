import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export interface ReviewDto {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  rating: number
  comment: string | null
  images: string[] | null
  createdAt: string
}

export interface CreateReviewRequest {
  productId: string
  orderId: string
  rating: number
  comment?: string
  images?: string[]
}

/** Returned by GET /api/reviews/can-review */
export interface CanReviewResult {
  canReview: boolean
  /** UUID string of the qualifying DELIVERED order, empty string if cannot review */
  orderId: string
}

export const reviewApi = {
  getProductReviews(productId: string, page = 0, size = 10) {
    return apiCall<PageResponse<ReviewDto>>(
      httpClient.get<ApiResponse<PageResponse<ReviewDto>>>(
        `/api/products/${productId}/reviews`,
        { params: { page, size } },
      ),
    )
  },

  canReview(productId: string) {
    return apiCall<CanReviewResult>(
      httpClient.get<ApiResponse<CanReviewResult>>(`/api/reviews/can-review`, {
        params: { productId },
      }),
    )
  },

  createReview(request: CreateReviewRequest) {
    return apiCall<ReviewDto>(
      httpClient.post<ApiResponse<ReviewDto>>('/api/reviews', request),
    )
  },
}
