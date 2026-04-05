import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import type { ProductDto, ProductMeta, ProductPage, ProductRequest, ProductStatus } from '@/lib/types/product/product.types'

const BASE = '/api/products'

export interface ProductParams {
  page?: number
  size?: number
  search?: string
  status?: ProductStatus | ''
}

export const productAdminApi = {
  getProducts(params: ProductParams = {}) {
    return apiCall<ProductPage>(
      httpClient.get<ApiResponse<ProductPage>>(BASE, { params: { page: 0, size: 10, ...params } }),
    )
  },

  getProduct(id: string) {
    return apiCall<ProductDto>(httpClient.get<ApiResponse<ProductDto>>(`${BASE}/${id}`))
  },

  getMetadata() {
    return apiCall<ProductMeta>(httpClient.get<ApiResponse<ProductMeta>>(`${BASE}/metadata`))
  },

  createProduct(body: ProductRequest) {
    return apiCall<ProductDto>(httpClient.post<ApiResponse<ProductDto>>(BASE, body))
  },

  updateProduct(id: string, body: ProductRequest) {
    return apiCall<ProductDto>(httpClient.put<ApiResponse<ProductDto>>(`${BASE}/${id}`, body))
  },

  deleteProduct(id: string) {
    return apiCall<void>(httpClient.delete<ApiResponse<void>>(`${BASE}/${id}`))
  },

  /** Bulk-delete by IDs — ADMIN only */
  bulkDelete(ids: string[]) {
    return apiCall<void>(httpClient.delete<ApiResponse<void>>(`${BASE}/bulk`, { data: ids }))
  },

  /** Bulk-update status — ADMIN only */
  bulkUpdateStatus(ids: string[], status: ProductStatus) {
    return apiCall<void>(httpClient.patch<ApiResponse<void>>(`${BASE}/bulk-status`, { ids, status }))
  },
}
