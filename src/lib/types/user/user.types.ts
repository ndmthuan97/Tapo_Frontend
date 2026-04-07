// UserRole as const object (erasableSyntaxOnly forbids enum keyword)
export const UserRole = {
  ADMIN: 'ADMIN',
  SALES_STAFF: 'SALES_STAFF',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  CUSTOMER: 'CUSTOMER',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export interface UserDto {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
  status: UserStatus
}

export interface AddressDto {
  id: string
  recipientName: string
  phoneNumber: string
  /** Địa chỉ đầy đủ: số nhà + đường + phường/xã (không còn quận/huyện sau sát nhập VN 2025) */
  address: string
  city: string
  isDefault: boolean
}

export interface UpdateProfileRequest {
  fullName: string
  phoneNumber?: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AddressRequest {
  recipientName: string
  phoneNumber: string
  /** Số nhà + tên đường + phường/xã */
  address: string
  city: string
}

export interface UserPageResponse {
  content: UserDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
