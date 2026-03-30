import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

const BASE = '/api/wishlist'

export interface WishlistItemDto {
  wishlistId: string
  productId: string
  productName: string
  productSlug: string
  thumbnailUrl: string | null
  price: number
  originalPrice: number | null
  stock: number
  avgRating: number
  reviewCount: number
  brandName: string | null
  categoryName: string | null
  addedAt: string
}

export interface WishlistCheckDto {
  wishlisted: boolean
  total: number
}

export const wishlistApi = {
  getWishlist(page = 0, size = 20) {
    return apiCall<PageResponse<WishlistItemDto>>(
      httpClient.get<ApiResponse<PageResponse<WishlistItemDto>>>(BASE, { params: { page, size } }),
    )
  },

  addToWishlist(productId: string) {
    return apiCall<WishlistItemDto>(
      httpClient.post<ApiResponse<WishlistItemDto>>(`${BASE}/${productId}`, {}),
    )
  },

  removeFromWishlist(productId: string) {
    return apiCall<null>(
      httpClient.delete<ApiResponse<null>>(`${BASE}/${productId}`),
    )
  },

  checkWishlisted(productId: string) {
    return apiCall<WishlistCheckDto>(
      httpClient.get<ApiResponse<WishlistCheckDto>>(`${BASE}/check/${productId}`),
    )
  },
}
