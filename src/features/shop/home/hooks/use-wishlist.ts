import { useState, useEffect, useCallback } from 'react'
import { wishlistApi, type WishlistItemDto } from '@/lib/http/wishlist.api'
import { useAuthContext } from '@/lib/context/auth-context'
import type { PaginatedResponse } from '@/lib/types/common/api.types'

const EMPTY: PaginatedResponse<WishlistItemDto> = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
}

export function useWishlist(page = 0) {
  const { user } = useAuthContext()
  const [data, setData] = useState<PaginatedResponse<WishlistItemDto>>(EMPTY)
  const [isLoading, setIsLoading] = useState(false)
  // Local set of wishlisted product IDs for instant UI feedback
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())

  const reload = useCallback(async () => {
    if (!user) { setData(EMPTY); setWishlistedIds(new Set()); return }
    setIsLoading(true)
    const res = await wishlistApi.getWishlist(page)
    setIsLoading(false)
    if (res.success && res.data) {
      setData(res.data)
      setWishlistedIds(new Set(res.data.content.map(w => w.productId)))
    }
  }, [user, page])

  useEffect(() => { reload() }, [reload])

  const toggle = useCallback(async (productId: string) => {
    if (!user) return

    const alreadyWished = wishlistedIds.has(productId)

    // Optimistic update
    setWishlistedIds(prev => {
      const next = new Set(prev)
      alreadyWished ? next.delete(productId) : next.add(productId)
      return next
    })

    if (alreadyWished) {
      await wishlistApi.removeFromWishlist(productId)
    } else {
      await wishlistApi.addToWishlist(productId)
    }

    // Reload to sync server state
    reload()
  }, [user, wishlistedIds, reload])

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds],
  )

  return {
    wishlist: data,
    isLoading,
    wishlistedIds,
    totalCount: data.totalElements,
    isWishlisted,
    toggle,
    reload,
  }
}
