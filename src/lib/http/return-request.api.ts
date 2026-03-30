import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export type ReturnRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ReturnRequestDto {
  id: string
  orderId: string
  orderCode: string
  userId: string
  userName: string
  reason: string
  evidenceImages: string[] | null
  status: ReturnRequestStatus
  staffNote: string | null
  createdAt: string
}

export const returnRequestApi = {
  /** POST /api/orders/{orderId}/return */
  create(orderId: string, payload: { reason: string; evidenceImages?: string[] }) {
    return apiCall<ReturnRequestDto>(
      httpClient.post<ApiResponse<ReturnRequestDto>>(`/api/orders/${orderId}/return`, payload),
    )
  },

  /** GET /api/orders/{orderId}/return */
  getByOrder(orderId: string) {
    return apiCall<ReturnRequestDto>(
      httpClient.get<ApiResponse<ReturnRequestDto>>(`/api/orders/${orderId}/return`),
    )
  },

  /** GET /api/orders/returns */
  getMyReturns(params?: { page?: number; size?: number }) {
    return apiCall<PageResponse<ReturnRequestDto>>(
      httpClient.get<ApiResponse<PageResponse<ReturnRequestDto>>>('/api/orders/returns', { params }),
    )
  },

  // ── Admin ───────────────────────────────────────────────────────────────────

  adminListAll(params?: { status?: ReturnRequestStatus; page?: number; size?: number }) {
    return apiCall<PageResponse<ReturnRequestDto>>(
      httpClient.get<ApiResponse<PageResponse<ReturnRequestDto>>>('/api/admin/returns', { params }),
    )
  },

  adminUpdateStatus(id: string, status: ReturnRequestStatus, note?: string) {
    return apiCall<ReturnRequestDto>(
      httpClient.patch<ApiResponse<ReturnRequestDto>>(
        `/api/admin/returns/${id}/status`,
        null,
        { params: { status, note: note ?? '' } },
      ),
    )
  },
}
