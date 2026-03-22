import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/features/shop/user/api/user.api'
import type { UserDto, UserPageResponse, UserStatus } from '@/lib/types/user/user.types'
import type { UserRole } from '@/lib/types/user/user.types'

interface AdminUsersState {
  data: UserPageResponse | null
  isLoading: boolean
  page: number
  size: number
  roleFilter: UserRole | undefined
}

export function useAdminUsers() {
  const { t } = useTranslation()
  const [state, setState] = useState<AdminUsersState>({
    data: null,
    isLoading: false,
    page: 1,
    size: 8,
    roleFilter: undefined,
  })

  const load = useCallback(
    async (page: number, size: number, role: UserRole | undefined) => {
      setState((s) => ({ ...s, isLoading: true }))
      const result = await userApi.adminGetUsers({ page, size, role })
      setState((s) => ({
        ...s,
        isLoading: false,
        data: result.data ?? null,
        page,
        size,
        roleFilter: role,
      }))
    },
    [],
  )

  function setPage(page: number) {
    load(page, state.size, state.roleFilter)
  }

  function setRoleFilter(role: UserRole | undefined) {
    load(1, state.size, role)
  }

  async function lockUser(id: string) {
    const result = await userApi.lockUser(id)
    if (!result.success) {
      toast.error(t('adminUsers.lockFailed'), { description: result.error?.message })
      return
    }
    // Update status in-place
    setState((s) => ({
      ...s,
      data: s.data
        ? {
            ...s.data,
            content: s.data.content.map((u: UserDto) =>
              u.id === id ? { ...u, status: 'LOCKED' as UserStatus } : u,
            ),
          }
        : null,
    }))
    toast.success(t('adminUsers.lockSuccess'))
  }

  async function unlockUser(id: string) {
    const result = await userApi.unlockUser(id)
    if (!result.success) {
      toast.error(t('adminUsers.unlockFailed'), { description: result.error?.message })
      return
    }
    setState((s) => ({
      ...s,
      data: s.data
        ? {
            ...s.data,
            content: s.data.content.map((u: UserDto) =>
              u.id === id ? { ...u, status: 'ACTIVE' as UserStatus } : u,
            ),
          }
        : null,
    }))
    toast.success(t('adminUsers.unlockSuccess'))
  }

  // Initial load
  useState(() => { load(1, 8, undefined) })

  return { ...state, setPage, setRoleFilter, lockUser, unlockUser, reload: () => load(state.page, state.size, state.roleFilter) }
}
