import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { apiCall } from '@/lib/http/http-client'
import { brandAdminApi } from '@/features/admin/api/catalog.api'
import type { BrandDto, BrandRequest } from '@/lib/types/catalog/catalog.types'

export function useAdminBrands() {
  const { t } = useTranslation()
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await apiCall(brandAdminApi.getAll())
    if (data) setBrands(data)
    setIsLoading(false)
  }, [])

  const createBrand = useCallback(async (request: BrandRequest): Promise<boolean> => {
    setIsSubmitting(true)
    const { data, error } = await apiCall(brandAdminApi.create(request))
    setIsSubmitting(false)
    if (data) {
      toast.success(t('adminBrands.createSuccess'))
      setBrands((prev) => [...prev, data])
      return true
    }
    toast.error(error?.message ?? t('adminBrands.createFailed'))
    return false
  }, [t])

  const updateBrand = useCallback(async (id: string, request: BrandRequest): Promise<boolean> => {
    setIsSubmitting(true)
    const { data, error } = await apiCall(brandAdminApi.update(id, request))
    setIsSubmitting(false)
    if (data) {
      toast.success(t('adminBrands.updateSuccess'))
      setBrands((prev) => prev.map((b) => (b.id === id ? data : b)))
      return true
    }
    toast.error(error?.message ?? t('adminBrands.updateFailed'))
    return false
  }, [t])

  const deleteBrand = useCallback(async (id: string): Promise<void> => {
    const { error } = await apiCall(brandAdminApi.delete(id))
    if (!error) {
      toast.success(t('adminBrands.deleteSuccess'))
      setBrands((prev) => prev.filter((b) => b.id !== id))
    } else {
      toast.error(error.message ?? t('adminBrands.deleteFailed'))
    }
  }, [t])

  return {
    brands,
    isLoading,
    isSubmitting,
    load,
    createBrand,
    updateBrand,
    deleteBrand,
  }
}
