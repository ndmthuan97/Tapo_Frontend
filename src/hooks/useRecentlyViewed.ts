import { useCallback } from 'react'

const STORAGE_KEY = 'tapo_recently_viewed'
const MAX_ITEMS   = 10

export interface RecentlyViewedItem {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  thumbnailUrl?: string | null
  brandName?: string
  avgRating?: number
  slug?: string
}

/** Manages the recently-viewed product list persisted in localStorage. */
export function useRecentlyViewed() {
  const getItems = useCallback((): RecentlyViewedItem[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  }, [])

  /** Add or promote product to front of list */
  const addItem = useCallback((item: RecentlyViewedItem) => {
    const prev = getItems().filter(p => p.id !== item.id)
    const next  = [item, ...prev].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [getItems])

  const clearItems = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { getItems, addItem, clearItems }
}
