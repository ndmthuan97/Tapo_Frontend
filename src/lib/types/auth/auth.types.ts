import type { UserRole } from '@/lib/types/user/user.types'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: {
    id: string
    fullName: string
    email: string
    phoneNumber: string | null
    avatarUrl: string | null
    role: UserRole
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
}

export interface TokenRefreshRequest {
  accessToken: string
  refreshToken: string
}
