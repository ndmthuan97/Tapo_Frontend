export interface CartItemDto {
  id: string
  productId: string
  productName: string
  productSlug: string
  thumbnailUrl: string | null
  brandName: string | null
  categoryName: string | null
  price: number
  originalPrice: number
  quantity: number
  stock: number
  lineTotal: number
}

export interface CartResponse {
  items: CartItemDto[]
  totalItems: number
  subtotal: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartQuantityRequest {
  quantity: number
}
