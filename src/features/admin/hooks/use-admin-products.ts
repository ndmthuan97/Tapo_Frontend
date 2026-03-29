import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { productAdminApi, type ProductParams } from '@/features/admin/api/product.api'
import type { ProductDto, ProductMeta, ProductRequest } from '@/lib/types/product/product.types'

export function useAdminProducts(initialParams: ProductParams = {}) {
  const { t } = useTranslation()

  const [products,    setProducts]    = useState<ProductDto[]>([])
  const [meta,        setMeta]        = useState<ProductMeta>({ categories: [], brands: [] })
  const [totalPages,  setTotalPages]  = useState(0)
  const [totalItems,  setTotalItems]  = useState(0)
  const [isLoading,   setIsLoading]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [params, setParams] = useState<ProductParams>({ page: 0, size: 10, ...initialParams })

  // ── Data fetch ───────────────────────────────────────────────────────────────
  const load = useCallback(async (p: ProductParams) => {
    setIsLoading(true)
    const result = await productAdminApi.getProducts(p)
    setIsLoading(false)
    if (result.success && result.data) {
      setProducts(result.data.content)
      setTotalPages(result.data.totalPages)
      setTotalItems(result.data.totalElements)
    }
  }, [])

  useEffect(() => { load(params) }, [load, params])

  // Load metadata (categories + brands) once
  useEffect(() => {
    productAdminApi.getMetadata().then((r) => {
      if (r.success && r.data) setMeta(r.data)
    })
  }, [])

  // ── Param helpers ────────────────────────────────────────────────────────────
  function setPage(page: number) { setParams((p) => ({ ...p, page })) }
  function setSearch(search: string) { setParams((p) => ({ ...p, search: search || undefined, page: 0 })) }
  function setStatus(status: string) { setParams((p) => ({ ...p, status: (status as ProductParams['status']) || undefined, page: 0 })) }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async function createProduct(data: ProductRequest): Promise<boolean> {
    setIsSubmitting(true)
    const r = await productAdminApi.createProduct(data)
    setIsSubmitting(false)
    if (r.success) {
      toast.success(t('adminProducts.createSuccess'))
      load(params)
      return true
    }
    toast.error(r.error?.message ?? t('adminProducts.createFailed'))
    return false
  }

  async function updateProduct(id: string, data: ProductRequest): Promise<boolean> {
    setIsSubmitting(true)
    const r = await productAdminApi.updateProduct(id, data)
    setIsSubmitting(false)
    if (r.success) {
      toast.success(t('adminProducts.updateSuccess'))
      load(params)
      return true
    }
    toast.error(r.error?.message ?? t('adminProducts.updateFailed'))
    return false
  }

  async function deleteProduct(id: string): Promise<void> {
    const r = await productAdminApi.deleteProduct(id)
    if (r.success) {
      toast.success(t('adminProducts.deleteSuccess'))
      load(params)
    } else {
      toast.error(r.error?.message ?? t('adminProducts.deleteFailed'))
    }
  }

  return {
    products, meta, totalPages, totalItems, isLoading, isSubmitting,
    params, setPage, setSearch, setStatus,
    createProduct, updateProduct, deleteProduct,
  }
}
