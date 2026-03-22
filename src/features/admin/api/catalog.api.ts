import { httpClient } from '@/lib/http/http-client'
import type { CategoryDto, CategoryRequest, BrandDto, BrandRequest } from '@/lib/types/catalog/catalog.types'
import type { ApiResponse } from '@/lib/types/common/api.types'
import type { AxiosResponse } from 'axios'

// ── Categories ────────────────────────────────────────────────────────────────

export const categoryAdminApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<CategoryDto[]>>> =>
    httpClient.get('/api/categories'),

  create: (data: CategoryRequest): Promise<AxiosResponse<ApiResponse<CategoryDto>>> =>
    httpClient.post('/api/categories', data),

  update: (id: string, data: CategoryRequest): Promise<AxiosResponse<ApiResponse<CategoryDto>>> =>
    httpClient.put(`/api/categories/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    httpClient.delete(`/api/categories/${id}`),
}

// ── Brands ────────────────────────────────────────────────────────────────────

export const brandAdminApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<BrandDto[]>>> =>
    httpClient.get('/api/brands'),

  create: (data: BrandRequest): Promise<AxiosResponse<ApiResponse<BrandDto>>> =>
    httpClient.post('/api/brands', data),

  update: (id: string, data: BrandRequest): Promise<AxiosResponse<ApiResponse<BrandDto>>> =>
    httpClient.put(`/api/brands/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    httpClient.delete(`/api/brands/${id}`),
}
