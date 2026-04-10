import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export type ReceiptType = 'IMPORT' | 'EXPORT'

export interface InventoryItemDto {
  productId: string
  productName: string
  thumbnailUrl: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface InventoryReceiptDto {
  id: string
  receiptCode: string
  type: ReceiptType
  createdByName: string
  orderCode: string | null
  note: string | null
  items: InventoryItemDto[]
  createdAt: string
}

export interface CreateReceiptRequest {
  type: ReceiptType
  note?: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
}

export const inventoryApi = {
  listReceipts(type?: ReceiptType, page = 0, size = 20) {
    return apiCall<PageResponse<InventoryReceiptDto>>(
      httpClient.get<ApiResponse<PageResponse<InventoryReceiptDto>>>('/api/admin/inventory', {
        params: { ...(type ? { type } : {}), page, size },
      }),
    )
  },
  getReceipt(id: string) {
    return apiCall<InventoryReceiptDto>(
      httpClient.get<ApiResponse<InventoryReceiptDto>>(`/api/admin/inventory/${id}`),
    )
  },
  createReceipt(data: CreateReceiptRequest) {
    return apiCall<InventoryReceiptDto>(
      httpClient.post<ApiResponse<InventoryReceiptDto>>('/api/admin/inventory', data),
    )
  },
}
