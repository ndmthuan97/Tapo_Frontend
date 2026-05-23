import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import type { ApiResult } from '@/lib/http/http-client'
import type { CartResponse, CartItemDto } from '@/lib/types/cart/cart.types'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockGetCart = vi.fn()
const mockAddItem = vi.fn()
const mockUpdateQuantity = vi.fn()
const mockRemoveItem = vi.fn()
const mockClearCart = vi.fn()

vi.mock('@/lib/http/cart.api', () => ({
  cartApi: {
    getCart: (...args: unknown[]) => mockGetCart(...args),
    addItem: (...args: unknown[]) => mockAddItem(...args),
    updateQuantity: (...args: unknown[]) => mockUpdateQuantity(...args),
    removeItem: (...args: unknown[]) => mockRemoveItem(...args),
    clearCart: (...args: unknown[]) => mockClearCart(...args),
  },
}))

vi.mock('@/lib/context/auth-context', () => ({
  useAuthContext: () => ({ user: { id: 'user-1', email: 'test@test.com' } }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCart(items: CartItemDto[] = []): CartResponse {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  return { items, totalItems: items.length, subtotal }
}

function makeItem(productId: string, quantity = 1, price = 50_000): CartItemDto {
  return {
    id: productId,
    productId,
    productName: `Product ${productId}`,
    productSlug: productId,
    thumbnailUrl: null,
    brandName: null,
    categoryName: null,
    price,
    originalPrice: price,
    quantity,
    stock: 10,
    lineTotal: price * quantity,
  }
}

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null, success: true, message: 'ok' }
}

function err(message: string): ApiResult<never> {
  return { data: null, error: { statusCode: 400, message, errors: [] }, success: false, message }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCart.mockResolvedValue(ok(makeCart()))
})

describe('useCart — initial load', () => {
  it('loads the cart on mount when user is authenticated', async () => {
    const item = makeItem('p1')
    mockGetCart.mockResolvedValue(ok(makeCart([item])))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockGetCart).toHaveBeenCalledOnce()
    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].productId).toBe('p1')
  })
})

describe('useCart — addItem', () => {
  // FE-006 / CART-002
  it('calls reload after a successful addItem', async () => {
    const item = makeItem('p2')
    mockAddItem.mockResolvedValue(ok(item))
    mockGetCart
      .mockResolvedValueOnce(ok(makeCart()))        // initial load
      .mockResolvedValueOnce(ok(makeCart([item])))  // reload after add

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addItem('p2', 1)
    })

    expect(mockAddItem).toHaveBeenCalledWith({ productId: 'p2', quantity: 1 })
    expect(mockGetCart).toHaveBeenCalledTimes(2)
    expect(result.current.cart.items).toHaveLength(1)
  })

  // FE-007 / CART-002 error path
  it('does NOT reload when addItem fails', async () => {
    mockAddItem.mockResolvedValue(err('Hết hàng'))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = mockGetCart.mock.calls.length

    await act(async () => {
      const res = await result.current.addItem('p99', 1)
      expect(res.success).toBe(false)
    })

    // cart reload should NOT have been triggered again
    expect(mockGetCart).toHaveBeenCalledTimes(callsBefore)
    expect(result.current.cart.items).toHaveLength(0)
  })
})

describe('useCart — updateQuantity (optimistic update)', () => {
  // CART-004 / CART-010
  it('updates quantity optimistically in local state', async () => {
    const item = makeItem('p1', 1)
    mockGetCart.mockResolvedValue(ok(makeCart([item])))
    mockUpdateQuantity.mockResolvedValue(ok({ ...item, quantity: 3, lineTotal: 150_000 }))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.cart.items).toHaveLength(1))

    await act(async () => {
      await result.current.updateQuantity('p1', 3)
    })

    const updated = result.current.cart.items.find(i => i.productId === 'p1')
    expect(updated?.quantity).toBe(3)
    expect(updated?.lineTotal).toBe(150_000)
  })

  // CART-010 — no update applied when server returns error
  it('does not change quantity when updateQuantity fails (conditional update, not optimistic)', async () => {
    const item = makeItem('p1', 1)
    mockGetCart.mockResolvedValue(ok(makeCart([item])))
    mockUpdateQuantity.mockResolvedValue(err('Lỗi server'))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.cart.items).toHaveLength(1))

    await act(async () => {
      const res = await result.current.updateQuantity('p1', 5)
      expect(res.success).toBe(false)
    })

    // setCart is only called inside `if (result.success)`, so state stays unchanged
    const item1 = result.current.cart.items.find(i => i.productId === 'p1')
    expect(item1?.quantity).toBe(1)
  })
})

describe('useCart — removeItem', () => {
  // CART-007
  it('removes item from local state immediately (optimistic)', async () => {
    const items = [makeItem('p1'), makeItem('p2')]
    mockGetCart.mockResolvedValue(ok(makeCart(items)))
    mockRemoveItem.mockResolvedValue(ok(null))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.cart.items).toHaveLength(2))

    await act(async () => {
      await result.current.removeItem('p1')
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].productId).toBe('p2')
  })
})

describe('useCart — clearCart', () => {
  // CART-008
  it('clears the cart immediately in local state', async () => {
    mockGetCart.mockResolvedValue(ok(makeCart([makeItem('p1'), makeItem('p2')])))
    mockClearCart.mockResolvedValue(ok(null))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.cart.items).toHaveLength(2))

    await act(async () => {
      await result.current.clearCart()
    })

    expect(result.current.cart.items).toHaveLength(0)
    expect(result.current.cart.subtotal).toBe(0)
  })
})

describe('useCart — totalCount', () => {
  it('computes totalCount as sum of all item quantities', async () => {
    const items = [makeItem('p1', 2), makeItem('p2', 3)]
    mockGetCart.mockResolvedValue(ok(makeCart(items)))

    const { result } = renderHook(() => useCart())
    await waitFor(() => expect(result.current.cart.items).toHaveLength(2))

    expect(result.current.totalCount).toBe(5)
  })
})
