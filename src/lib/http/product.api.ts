import { httpClient } from '@/lib/http/http-client'
import { apiCall } from '@/lib/http/http-client'
import type { ProductDto, ProductPage, ProductMeta } from '@/lib/types/product/product.types'
import type { ApiResponse } from '@/lib/types/common/api.types'

const BASE = '/api/products'

export interface ProductFilterParams {
  page?: number
  size?: number
  search?: string
  status?: string
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number   // 1 | 2 | 3 | 4 — minimum avg rating
  inStock?: boolean    // true = only products with stock > 0
  sort?: string
}

export const productApi = {
  /** Paginated product list (public) */
  getProducts(params: ProductFilterParams = {}) {
    const clean = Object.fromEntries(
      Object.entries({ page: 0, size: 16, status: 'ACTIVE', ...params }).filter(
        ([, v]) => v !== undefined && v !== '' && v !== null,
      ),
    )
    return apiCall<ProductPage>(
      httpClient.get<ApiResponse<ProductPage>>(BASE, { params: clean }),
    )
  },

  /** Single product by ID */
  getProduct(id: string) {
    return apiCall<ProductDto>(
      httpClient.get<ApiResponse<ProductDto>>(`${BASE}/${id}`),
    )
  },

  /** Related products by product ID (same category) */
  getRelatedProducts(productId: string, limit = 8) {
    return apiCall<ProductDto[]>(
      httpClient.get<ApiResponse<ProductDto[]>>(`${BASE}/${productId}/related`, {
        params: { limit },
      }),
    )
  },

  /** Category + brand lists for filters */
  getMetadata() {
    return apiCall<ProductMeta>(
      httpClient.get<ApiResponse<ProductMeta>>(`${BASE}/metadata`),
    )
  },
}
