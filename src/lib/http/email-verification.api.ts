import { httpClient } from '@/lib/http/http-client'

/** Call after registration — sends verification email */
export const emailVerificationApi = {
  /**
   * GET /api/auth/verify-email?token=xxx
   * Called from VerifyEmailPage when user clicks link in email.
   */
  verify: (token: string) =>
    httpClient.get('/api/auth/verify-email', { params: { token } }),

  /**
   * POST /api/auth/resend-verification
   * Resend verification email to unverified user.
   */
  resend: (email: string) =>
    httpClient.post('/api/auth/resend-verification', { email }),
}
