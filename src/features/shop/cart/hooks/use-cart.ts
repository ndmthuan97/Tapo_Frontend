import { useState, useEffect, useCallback } from 'react'
import { cartApi } from '@/lib/http/cart.api'
import { useAuth } from '@/features/shop/auth/hooks/use-auth'
import type { CartItemDto, CartResponse } from '@/lib/types/cart/cart.types'

const EMPTY_CART: CartResponse = { items: [], totalItems: 0, subtotal: 0 }

export function useCart() {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART)
  const [isLoading, setIsLoading] = useState(false)

  // ── Load / Reload ────────────────────────────────────────────────────────────
  const reload = useCallback(async () => {
    if (!isAuthenticated) { setCart(EMPTY_CART); return }
    setIsLoading(true)
    const result = await cartApi.getCart()
    setIsLoading(false)
    if (result.success && result.data) setCart(result.data)
  }, [isAuthenticated])

  useEffect(() => { reload() }, [reload])

  // ── Mutations ────────────────────────────────────────────────────────────────
  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const result = await cartApi.addItem({ productId, quantity })
    if (result.success) await reload()
    return result
  }, [reload])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const result = await cartApi.updateQuantity(productId, { quantity })
    if (result.success) {
      // Optimistic update
      setCart(prev => ({
        ...prev,
        items: prev.items.map((ci: CartItemDto) =>
          ci.productId === productId ? { ...ci, quantity, lineTotal: ci.price * quantity } : ci,
        ),
      }))
    }
    return result
  }, [])

  const removeItem = useCallback(async (productId: string) => {
    // Optimistic
    setCart(prev => {
      const items = prev.items.filter((ci: CartItemDto) => ci.productId !== productId)
      const subtotal = items.reduce((sum: number, ci: CartItemDto) => sum + ci.lineTotal, 0)
      return { ...prev, items, totalItems: items.length, subtotal }
    })
    return cartApi.removeItem(productId)
  }, [])

  const clearCart = useCallback(async () => {
    setCart(EMPTY_CART)
    return cartApi.clearCart()
  }, [])

  return {
    cart,
    isLoading,
    totalCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
    reload,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
