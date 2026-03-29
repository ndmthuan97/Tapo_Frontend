import { httpClient, apiCall } from '@/lib/http/http-client'
import type {
  CartResponse, CartItemDto,
  AddToCartRequest, UpdateCartQuantityRequest,
} from '@/lib/types/cart/cart.types'
import type { ApiResponse } from '@/lib/types/common/api.types'

const BASE = '/api/cart'

export const cartApi = {
  getCart() {
    return apiCall<CartResponse>(
      httpClient.get<ApiResponse<CartResponse>>(BASE),
    )
  },

  addItem(request: AddToCartRequest) {
    return apiCall<CartItemDto>(
      httpClient.post<ApiResponse<CartItemDto>>(`${BASE}/items`, request),
    )
  },

  updateQuantity(productId: string, request: UpdateCartQuantityRequest) {
    return apiCall<CartItemDto>(
      httpClient.put<ApiResponse<CartItemDto>>(`${BASE}/items/${productId}`, request),
    )
  },

  removeItem(productId: string) {
    return apiCall<null>(
      httpClient.delete<ApiResponse<null>>(`${BASE}/items/${productId}`),
    )
  },

  clearCart() {
    return apiCall<null>(
      httpClient.delete<ApiResponse<null>>(BASE),
    )
  },
}
