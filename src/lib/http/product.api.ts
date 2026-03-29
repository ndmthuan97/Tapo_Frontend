import { httpClient } from '@/lib/http/http-client'
import { apiCall } from '@/lib/http/http-client'
import type { ProductDto, ProductPage, SimpleRefDto, ProductMeta } from '@/lib/types/product/product.types'
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
  sort?: string
}

export const productApi = {
  /** Paginated product list (public) */
  getProducts(params: ProductFilterParams = {}) {
    // Strip undefined values
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

  /** Category + brand lists for filters */
  getMetadata() {
    return apiCall<ProductMeta>(
      httpClient.get<ApiResponse<ProductMeta>>(`${BASE}/metadata`),
    )
  },
}
