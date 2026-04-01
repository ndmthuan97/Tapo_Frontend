import { httpClient, apiCall } from '@/lib/http/http-client'

/**
 * Auth API — standalone actions that don't belong to the auth context flow
 * (forgot password, reset password).
 */
export const authApi = {
  /**
   * POST /api/auth/forgot-password
   * Always returns success-like response regardless of whether email exists.
   */
  forgotPassword: (email: string) =>
    apiCall(httpClient.post<never>('/api/auth/forgot-password', { email })),

  /**
   * POST /api/auth/reset-password
   * Reset password using a one-time token from the email link.
   */
  resetPassword: (token: string, newPassword: string) =>
    apiCall(httpClient.post<never>('/api/auth/reset-password', { token, newPassword })),
}
