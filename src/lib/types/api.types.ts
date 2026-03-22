import type { UserRole } from './auth.types'

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

export interface UserDto {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
}
