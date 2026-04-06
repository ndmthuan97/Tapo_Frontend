export type CatalogStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

export interface CategoryDto {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder: number
  status: CatalogStatus
  createdAt: string
  updatedAt: string
}

export interface CategoryRequest {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  status?: CatalogStatus
}

export interface BrandDto {
  id: string
  name: string
  slug: string
  logoUrl?: string
  status: CatalogStatus
  createdAt: string
  updatedAt: string
}

export interface BrandRequest {
  name: string
  slug?: string
  logoUrl?: string
  status?: CatalogStatus
}
