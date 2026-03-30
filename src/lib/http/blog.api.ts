import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse, PageResponse } from '@/lib/types/common/api.types'

const BASE = '/api/blog'

export interface BlogCategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
}

export interface BlogPostDto {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  excerpt: string | null
  content: string
  viewCount: number
  categoryName: string | null
  categorySlug: string | null
  authorName: string | null
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: string | null
  createdAt: string
}

export const blogApi = {
  getCategories() {
    return apiCall<BlogCategoryDto[]>(
      httpClient.get<ApiResponse<BlogCategoryDto[]>>(`${BASE}/categories`),
    )
  },

  getPosts(params: { categorySlug?: string; page?: number; size?: number } = {}) {
    return apiCall<PageResponse<BlogPostDto>>(
      httpClient.get<ApiResponse<PageResponse<BlogPostDto>>>(BASE, {
        params: { page: 0, size: 9, ...params },
      }),
    )
  },

  getPostBySlug(slug: string) {
    return apiCall<BlogPostDto>(
      httpClient.get<ApiResponse<BlogPostDto>>(`${BASE}/${slug}`),
    )
  },
}
