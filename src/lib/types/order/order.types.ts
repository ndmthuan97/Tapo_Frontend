export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface OrderItemDto {
  id: string
  productId: string
  productName: string
  productThumbnail: string | null
  unitPrice: number
  quantity: number
  totalPrice: number
}

export interface OrderStatusHistoryDto {
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  note: string | null
  changedAt: string
}

export interface OrderDto {
  id: string
  orderCode: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingRecipientName: string
  shippingPhone: string
  shippingAddress: string
  shippingDistrict: string
  shippingCity: string
  subtotal: number
  discountAmount: number
  shippingFee: number
  totalAmount: number
  customerNote: string | null
  items: OrderItemDto[]
  statusHistory: OrderStatusHistoryDto[]
  createdAt: string
}

export interface OrderSummary {
  id: string
  orderCode: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalQty: number
  totalAmount: number
  firstProductName: string
  firstProductThumbnail: string | null
  createdAt: string
}

export interface OrderPage {
  content: OrderSummary[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CreateOrderRequest {
  addressId: string
  customerNote?: string
  voucherCode?: string
}
