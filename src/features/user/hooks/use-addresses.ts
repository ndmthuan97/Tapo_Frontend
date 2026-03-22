import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/features/user/api/user.api'
import type { AddressDto, AddressRequest } from '@/lib/types/user/user.types'

export function useAddresses() {
  const { t } = useTranslation()
  const [addresses, setAddresses] = useState<AddressDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadAddresses = useCallback(async () => {
    setIsLoading(true)
    const result = await userApi.getAddresses()
    setIsLoading(false)
    if (result.success && result.data) setAddresses(result.data)
  }, [])

  useEffect(() => { loadAddresses() }, [loadAddresses])

  async function addAddress(data: AddressRequest) {
    setIsSubmitting(true)
    const result = await userApi.addAddress(data)
    setIsSubmitting(false)
    if (!result.success) {
      toast.error(t('address.addFailed'), { description: result.error?.message })
      return false
    }
    setAddresses((prev) => [...prev, result.data!])
    toast.success(t('address.addSuccess'))
    return true
  }

  async function updateAddress(id: string, data: AddressRequest) {
    setIsSubmitting(true)
    const result = await userApi.updateAddress(id, data)
    setIsSubmitting(false)
    if (!result.success) {
      toast.error(t('address.updateFailed'), { description: result.error?.message })
      return false
    }
    setAddresses((prev) => prev.map((a) => (a.id === id ? result.data! : a)))
    toast.success(t('address.updateSuccess'))
    return true
  }

  async function deleteAddress(id: string) {
    const result = await userApi.deleteAddress(id)
    if (!result.success) {
      toast.error(t('address.deleteFailed'), { description: result.error?.message })
      return
    }
    // Reload to get accurate isDefault state after auto-promotion
    await loadAddresses()
    toast.success(t('address.deleteSuccess'))
  }

  async function setDefault(id: string) {
    const result = await userApi.setDefaultAddress(id)
    if (!result.success) {
      toast.error(t('address.defaultFailed'), { description: result.error?.message })
      return
    }
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id })),
    )
    toast.success(t('address.defaultSuccess'))
  }

  return { addresses, isLoading, isSubmitting, addAddress, updateAddress, deleteAddress, setDefault }
}
