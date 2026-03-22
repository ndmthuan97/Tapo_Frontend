import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/features/shop/user/api/user.api'
import type { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '@/lib/types/user/user.types'

export function useProfile() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    const result = await userApi.getProfile()
    setIsLoading(false)
    if (result.success && result.data) setProfile(result.data)
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function updateProfile(data: UpdateProfileRequest) {
    setIsSaving(true)
    const result = await userApi.updateProfile(data)
    setIsSaving(false)
    if (!result.success) {
      toast.error(t('profile.updateFailed'), { description: result.error?.message })
      return false
    }
    setProfile(result.data!)
    toast.success(t('profile.updateSuccess'))
    return true
  }

  async function changePassword(data: ChangePasswordRequest) {
    setIsSaving(true)
    const result = await userApi.changePassword(data)
    setIsSaving(false)
    if (!result.success) {
      toast.error(t('profile.passwordFailed'), { description: result.error?.message })
      return false
    }
    toast.success(t('profile.passwordSuccess'))
    return true
  }

  return { profile, isLoading, isSaving, updateProfile, changePassword, reload: loadProfile }
}
