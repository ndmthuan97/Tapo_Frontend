export interface CategoryDto {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryRequest {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  isVisible?: boolean
}

export interface BrandDto {
  id: string
  name: string
  slug: string
  logoUrl?: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface BrandRequest {
  name: string
  slug?: string
  logoUrl?: string
  isVisible?: boolean
}
