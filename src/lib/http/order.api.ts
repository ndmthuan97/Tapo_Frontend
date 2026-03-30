import { httpClient, apiCall } from '@/lib/http/http-client'
import type {
  OrderDto, OrderPage,
  CreateOrderRequest, OrderStatus,
} from '@/lib/types/order/order.types'
import type { ApiResponse } from '@/lib/types/common/api.types'

const BASE = '/api/orders'

export const orderApi = {
  createOrder(request: CreateOrderRequest) {
    return apiCall<OrderDto>(
      httpClient.post<ApiResponse<OrderDto>>(BASE, request),
    )
  },

  getMyOrders(params: { page?: number; size?: number; status?: OrderStatus } = {}) {
    return apiCall<OrderPage>(
      httpClient.get<ApiResponse<OrderPage>>(BASE, { params }),
    )
  },

  getOrderDetail(id: string) {
    return apiCall<OrderDto>(
      httpClient.get<ApiResponse<OrderDto>>(`${BASE}/${id}`),
    )
  },

  cancelOrder(id: string) {
    return apiCall<OrderDto>(
      httpClient.put<ApiResponse<OrderDto>>(`${BASE}/${id}/cancel`, {}),
    )
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  adminGetAllOrders(params: { page?: number; size?: number; status?: OrderStatus } = {}) {
    return apiCall<OrderPage>(
      httpClient.get<ApiResponse<OrderPage>>('/api/admin/orders', { params }),
    )
  },

  adminUpdateStatus(id: string, status: OrderStatus, note?: string) {
    return apiCall<OrderDto>(
      httpClient.put<ApiResponse<OrderDto>>(
        `/api/admin/orders/${id}/status`,
        null,
        { params: { status, ...(note ? { note } : {}) } },
      ),
    )
  },
}
