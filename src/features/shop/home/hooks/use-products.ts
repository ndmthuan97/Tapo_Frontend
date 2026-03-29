import { useState, useEffect, useCallback } from 'react'
import { productApi, type ProductFilterParams } from '@/lib/http/product.api'
import type { ProductDto, SimpleRefDto } from '@/lib/types/product/product.types'

interface UseProductsReturn {
  products: ProductDto[]
  totalPages: number
  totalItems: number
  isLoading: boolean
  params: ProductFilterParams
  categories: SimpleRefDto[]
  brands: SimpleRefDto[]
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (patch: Partial<ProductFilterParams>) => void
  reset: () => void
}

const DEFAULT_PARAMS: ProductFilterParams = {
  page: 0,
  size: 16,
  status: 'ACTIVE',
  sort: 'createdAt,desc',
}

function useProducts(initial?: Partial<ProductFilterParams>): UseProductsReturn {
  const [params, setParams] = useState<ProductFilterParams>({ ...DEFAULT_PARAMS, ...initial })
  const [products, setProducts] = useState<ProductDto[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<SimpleRefDto[]>([])
  const [brands, setBrands] = useState<SimpleRefDto[]>([])

  // Load metadata once
  useEffect(() => {
    productApi.getMetadata().then((r) => {
      if (r.data) {
        setCategories(r.data.categories)
        setBrands(r.data.brands)
      }
    })
  }, [])

  const load = useCallback(async (p: ProductFilterParams) => {
    setIsLoading(true)
    const result = await productApi.getProducts(p)
    setIsLoading(false)
    if (result.success && result.data) {
      setProducts(result.data.content)
      setTotalPages(result.data.totalPages)
      setTotalItems(result.data.totalElements)
    }
  }, [])

  useEffect(() => {
    load(params)
  }, [params, load])

  function setPage(page: number) {
    setParams((p) => ({ ...p, page }))
  }

  function setSearch(search: string) {
    setParams((p) => ({ ...p, search, page: 0 }))
  }

  function setFilter(patch: Partial<ProductFilterParams>) {
    setParams((p) => ({ ...p, ...patch, page: 0 }))
  }

  function reset() {
    setParams(DEFAULT_PARAMS)
  }

  return { products, totalPages, totalItems, isLoading, params, categories, brands, setPage, setSearch, setFilter, reset }
}

export { useProducts }
