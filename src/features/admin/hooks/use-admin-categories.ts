import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { apiCall } from '@/lib/http/http-client'
import { categoryAdminApi } from '@/features/admin/api/catalog.api'
import type { CategoryDto, CategoryRequest } from '@/lib/types/catalog/catalog.types'

export function useAdminCategories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await apiCall(categoryAdminApi.getAll())
    if (data) setCategories(data)
    setIsLoading(false)
  }, [])

  const createCategory = useCallback(async (request: CategoryRequest): Promise<boolean> => {
    setIsSubmitting(true)
    const { data, error } = await apiCall(categoryAdminApi.create(request))
    setIsSubmitting(false)
    if (data) {
      toast.success(t('adminCategories.createSuccess'))
      setCategories((prev) => [...prev, data])
      return true
    }
    toast.error(error?.message ?? t('adminCategories.createFailed'))
    return false
  }, [t])

  const updateCategory = useCallback(async (id: string, request: CategoryRequest): Promise<boolean> => {
    setIsSubmitting(true)
    const { data, error } = await apiCall(categoryAdminApi.update(id, request))
    setIsSubmitting(false)
    if (data) {
      toast.success(t('adminCategories.updateSuccess'))
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)))
      return true
    }
    toast.error(error?.message ?? t('adminCategories.updateFailed'))
    return false
  }, [t])

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    const { error } = await apiCall(categoryAdminApi.delete(id))
    if (!error) {
      toast.success(t('adminCategories.deleteSuccess'))
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } else {
      toast.error(error.message ?? t('adminCategories.deleteFailed'))
    }
  }, [t])

  return {
    categories,
    isLoading,
    isSubmitting,
    load,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
