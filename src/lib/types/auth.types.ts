// UserRole as const object (erasableSyntaxOnly forbids enum keyword)
export const UserRole = {
  ADMIN: 'ADMIN',
  SALES_STAFF: 'SALES_STAFF',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  CUSTOMER: 'CUSTOMER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

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
  refreshToken: string
}
