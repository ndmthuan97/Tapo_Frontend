import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'
export type VoucherStatus = 'ACTIVE' | 'INACTIVE'

export interface VoucherDto {
  id: string
  code: string
  name: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minimumOrderValue: number
  usageLimit: number | null
  usageCount: number
  startDate: string
  endDate: string
  status: VoucherStatus
}

export interface ValidateVoucherResponse {
  voucher: VoucherDto
  discountAmount: number
}

export interface CreateVoucherRequest {
  code: string
  name: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  minimumOrderValue: number
  usageLimit?: number | null
  startDate: string  // ISO-8601 e.g. "2025-01-01T00:00:00Z"
  endDate: string
}

export const voucherApi = {
  // ── Customer ──────────────────────────────────────────────────────────────
  validate(code: string, subtotal: number) {
    return apiCall<ValidateVoucherResponse>(
      httpClient.post<ApiResponse<ValidateVoucherResponse>>('/api/vouchers/validate', {
        code,
        subtotal,
      }),
    )
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminListAll(page = 0, size = 20) {
    return apiCall<PageResponse<VoucherDto>>(
      httpClient.get<ApiResponse<PageResponse<VoucherDto>>>('/api/admin/vouchers', {
        params: { page, size },
      }),
    )
  },

  adminCreate(data: CreateVoucherRequest) {
    return apiCall<VoucherDto>(
      httpClient.post<ApiResponse<VoucherDto>>('/api/admin/vouchers', data),
    )
  },

  adminToggleStatus(id: string) {
    return apiCall<VoucherDto>(
      httpClient.put<ApiResponse<VoucherDto>>(`/api/admin/vouchers/${id}/toggle-status`),
    )
  },

  adminUpdate(id: string, data: CreateVoucherRequest) {
    return apiCall<VoucherDto>(
      httpClient.put<ApiResponse<VoucherDto>>(`/api/admin/vouchers/${id}`, data),
    )
  },

  adminDelete(id: string) {
    return apiCall<null>(
      httpClient.delete<ApiResponse<null>>(`/api/admin/vouchers/${id}`),
    )
  },
}
