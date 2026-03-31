import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/shop/auth/api/auth.api'
import { useAuthContext } from '@/lib/context/auth-context'
import type { LoginRequest, RegisterRequest } from '@/lib/types/auth/auth.types'

interface AuthState {
  isLoading: boolean
}

export function useAuth() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUserFromAuthResponse, clearUser } = useAuthContext()
  const [state, setState] = useState<AuthState>({ isLoading: false })

  async function login(data: LoginRequest) {
    setState({ isLoading: true })
    const result = await authApi.login(data)
    setState({ isLoading: false })

    if (!result.success || !result.data) {
      if (result.error?.errors?.length) {
        result.error.errors.forEach((err) =>
          toast.error(t('toast.validationError'), { description: err }),
        )
      } else {
        toast.error(t('toast.loginFailed'), {
          description: result.error?.message ?? t('toast.defaultError'),
        })
      }
      // Rethrow so callers can inspect statusCode (e.g. LoginPage checks for 4040)
      throw result.error ?? new Error('Login failed')
    }

    localStorage.setItem('accessToken', result.data.accessToken)
    localStorage.setItem('refreshToken', result.data.refreshToken)
    setUserFromAuthResponse(result.data)

    toast.success(t('toast.loginSuccess'), {
      description: t('toast.loginSuccessDesc', { name: result.data.user.fullName }),
    })

    const destination = result.data.user.role === 'ADMIN' ? '/admin/users' : '/'
    navigate(destination)
  }

  async function register(data: RegisterRequest) {
    setState({ isLoading: true })
    const result = await authApi.register(data)
    setState({ isLoading: false })

    if (!result.success || !result.data) {
      if (result.error?.errors?.length) {
        result.error.errors.forEach((err) =>
          toast.error(t('toast.validationError'), { description: err }),
        )
      } else {
        toast.error(t('toast.registerFailed'), {
          description: result.error?.message ?? t('toast.defaultError'),
        })
      }
      throw new Error(result.error?.message ?? 'Register failed')
    }

    // DO NOT log user in — they must verify email first.
    // RegisterPage will navigate to /verify-email-notice
  }

  function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    // Fire-and-forget: revoke from Redis (ignore errors, we still clear locally)
    if (refreshToken) authApi.logout(refreshToken)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    clearUser()
    toast.info(t('toast.logoutSuccess'), { description: t('toast.logoutSuccessDesc') })
    navigate('/login')
  }

  return { isLoading: state.isLoading, login, register, logout }
}
