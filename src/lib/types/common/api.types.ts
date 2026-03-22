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
