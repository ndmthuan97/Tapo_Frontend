import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenRefreshRequest,
} from '@/lib/types/auth/auth.types'

const AUTH_PATH = '/api/auth'

export const authApi = {
  login(body: LoginRequest) {
    return apiCall<AuthResponse>(
      httpClient.post<ApiResponse<AuthResponse>>(`${AUTH_PATH}/login`, body),
    )
  },

  register(body: RegisterRequest) {
    return apiCall<AuthResponse>(
      httpClient.post<ApiResponse<AuthResponse>>(`${AUTH_PATH}/register`, body),
    )
  },

  /** Requires both accessToken and refreshToken for identity cross-check */
  refreshToken(body: TokenRefreshRequest) {
    return apiCall<AuthResponse>(
      httpClient.post<ApiResponse<AuthResponse>>(`${AUTH_PATH}/refresh-token`, body),
    )
  },

  /** Revoke the refresh token from Redis (single-device logout) */
  logout(refreshToken: string) {
    return apiCall<void>(
      httpClient.post<ApiResponse<void>>(`${AUTH_PATH}/logout`, { refreshToken }),
    )
  },
}
