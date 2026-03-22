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

  refreshToken(body: TokenRefreshRequest) {
    return apiCall<AuthResponse>(
      httpClient.post<ApiResponse<AuthResponse>>(`${AUTH_PATH}/refresh-token`, body),
    )
  },
}
