export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE'

export interface ProductImageDto {
  id: string
  imageUrl: string
  altText: string | null
  sortOrder: number
}

export interface ProductDto {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  originalPrice: number | null
  stock: number
  status: ProductStatus
  thumbnailUrl: string | null
  images: ProductImageDto[]   // gallery images (sorted by sortOrder ASC)
  avgRating: number
  reviewCount: number
  soldCount: number
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  specifications: Record<string, string> | null
  createdAt: string
  updatedAt: string
}

export interface ProductRequest {
  name: string
  slug?: string
  description?: string
  categoryId: string
  brandId: string
  price: number
  originalPrice?: number
  stock: number
  thumbnailUrl?: string
  imageUrls?: Array<{ url: string; altText?: string }>  // gallery images
  specifications?: Record<string, string>
  status: ProductStatus
}

export interface SimpleRefDto {
  id: string
  name: string
}

export interface ProductMeta {
  categories: SimpleRefDto[]
  brands: SimpleRefDto[]
}

export interface ProductPage {
  content: ProductDto[]
  totalElements: number
  totalPages: number
  number: number   // current page (0-indexed)
  size: number
}
