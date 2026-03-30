import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'

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

export const voucherApi = {
  validate(code: string, subtotal: number) {
    return apiCall<ValidateVoucherResponse>(
      httpClient.post<ApiResponse<ValidateVoucherResponse>>('/api/vouchers/validate', {
        code,
        subtotal,
      }),
    )
  },
}
