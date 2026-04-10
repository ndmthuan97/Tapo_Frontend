import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'

export type FlashSaleStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED'

export interface FlashSaleDto {
  id: string
  productId: string
  productName: string
  productSlug: string
  thumbnailUrl: string | null
  originalPrice: number
  salePrice: number
  discountPercent: number
  stockLimit: number
  soldCount: number
  remaining: number
  startTime: string
  endTime: string
  status: FlashSaleStatus
  remainingSeconds: number
}

export interface FlashSaleRequest {
  productId: string
  salePrice: number
  stockLimit: number
  startTime: string // ISO 8601
  endTime: string   // ISO 8601
}

export const flashSaleApi = {
  /** Public: đang ACTIVE */
  getActiveSales() {
    return apiCall<FlashSaleDto[]>(
      httpClient.get<ApiResponse<FlashSaleDto[]>>('/api/flash-sales/active'),
    )
  },
  /** Admin: list all (filter by status optional) */
  listFlashSales(status?: FlashSaleStatus) {
    return apiCall<FlashSaleDto[]>(
      httpClient.get<ApiResponse<FlashSaleDto[]>>('/api/admin/flash-sales', {
        params: status ? { status } : undefined,
      }),
    )
  },
  createFlashSale(data: FlashSaleRequest) {
    return apiCall<FlashSaleDto>(
      httpClient.post<ApiResponse<FlashSaleDto>>('/api/admin/flash-sales', data),
    )
  },
  updateFlashSale(id: string, data: FlashSaleRequest) {
    return apiCall<FlashSaleDto>(
      httpClient.put<ApiResponse<FlashSaleDto>>(`/api/admin/flash-sales/${id}`, data),
    )
  },
  deleteFlashSale(id: string) {
    return apiCall<void>(
      httpClient.delete<ApiResponse<void>>(`/api/admin/flash-sales/${id}`),
    )
  },
}
