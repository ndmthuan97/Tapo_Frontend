import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'

const BASE = '/api/payments'

export const paymentApi = {
  /**
   * Tạo link thanh toán PayOS cho order.
   * Returns checkoutUrl để redirect người dùng sang trang PayOS.
   */
  createPaymentLink(orderId: string) {
    return apiCall<string>(
      httpClient.post<ApiResponse<string>>(`${BASE}/create-link/${orderId}`, {}),
    )
  },
}
