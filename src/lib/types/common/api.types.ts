// Common HTTP response shapes matching backend ApiResponse<T>
export interface ApiResponse<T> {
  statusCode: number
  data: T | null
  message: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// Alias used by new Sprint 5 API files
export type PageResponse<T> = PaginatedResponse<T>
