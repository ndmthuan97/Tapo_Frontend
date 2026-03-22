// UserRole as const object (erasableSyntaxOnly forbids enum keyword)
export const UserRole = {
  ADMIN: 'ADMIN',
  SALES_STAFF: 'SALES_STAFF',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  CUSTOMER: 'CUSTOMER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface UserDto {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
}
