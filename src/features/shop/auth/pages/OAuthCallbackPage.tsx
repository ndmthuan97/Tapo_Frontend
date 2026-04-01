import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/lib/context/auth-context'
import { httpClient } from '@/lib/http/http-client'
import { toast } from 'sonner'
import type { AuthResponse, UserRole } from '@/lib/types/auth.types'
import type { ApiResponse } from '@/lib/types/common/api.types'

/**
 * OAuthCallbackPage
 * Route: /oauth/callback?accessToken=...&refreshToken=...
 *
 * After Google OAuth2 login, the BE redirects here with JWT tokens.
 * This page saves the tokens, fetches user info, and redirects home.
 */
function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUserFromAuthResponse } = useAuthContext()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const accessToken  = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.')
      navigate('/login', { replace: true })
      return
    }

    // Store tokens first so the next request is authenticated
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // Fetch current user info using the standard /api/users/me endpoint
    httpClient
      .get<ApiResponse<{ id: string; fullName: string; email: string; phoneNumber: string | null; avatarUrl: string | null; role: UserRole; status: string }>>('/api/users/me')
      .then(response => {
        const userData = response.data?.data
        if (!userData) throw new Error('No user data returned')

        // Build AuthResponse-compatible shape to reuse setUserFromAuthResponse
        const authResponse: AuthResponse = {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          user: {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            avatarUrl: userData.avatarUrl,
            role: userData.role,
          },
        }

        setUserFromAuthResponse(authResponse)
        toast.success(`Xin chào, ${userData.fullName}!`, { description: 'Đăng nhập Google thành công.' })

        const destination = userData.role === 'ADMIN' ? '/admin' : '/'
        navigate(destination, { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        toast.error('Không thể tải thông tin tài khoản. Vui lòng thử lại.')
        navigate('/login', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100 dark:from-[#1a1c23] dark:via-[#21232d] dark:to-[#1a1c23]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
          <span className="text-2xl font-black text-white">T</span>
        </div>
        <Loader2 size={28} className="animate-spin text-orange-500" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  )
}

export { OAuthCallbackPage }
