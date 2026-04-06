import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/lib/types/common/api.types'
import { getMessageForCode } from '@/lib/constants/custom-code'
import i18n from '@/lib/i18n'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30s — Azure cold start can take 20-25s
})

// ── Request: auto-attach access token ────────────────────────────────────────
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: 401 → attempt silent token refresh, then retry ─────────────────
let isRefreshing = false
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // 401 on any request that is NOT the refresh endpoint itself
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/refresh-token')) {
      const accessToken  = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!accessToken || !refreshToken) {
        // No tokens at all — hard logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(normalizeError(error))
      }

      if (isRefreshing) {
        // Queue requests while a refresh is already in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return httpClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh with BOTH tokens (new backend contract)
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${BASE_URL}/api/auth/refresh-token`,
          { accessToken, refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const data = refreshResponse.data.data!
        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return httpClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)

        const refreshStatus = (refreshErr as AxiosError)?.response?.status
        const isAuthError = refreshStatus === 401 || refreshStatus === 403

        if (isAuthError) {
          // Token truly invalid → hard logout
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        // 5xx / network error → do NOT logout, just reject the original request
        // User keeps their session; the failed request will surface as an error in UI

        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

// ── Error normalization ───────────────────────────────────────────────────────
function normalizeError(error: AxiosError<ApiResponse<unknown>>) {
  const serverData = error.response?.data

  if (serverData?.statusCode) {
    return {
      statusCode: serverData.statusCode,
      message: getMessageForCode(serverData.statusCode),
      errors: serverData.errors ?? [],
      raw: serverData,
    }
  }

  if (!error.response) {
    return {
      statusCode: 0,
      message: i18n.t('error.NETWORK'),
      errors: [],
    }
  }

  return {
    statusCode: error.response.status,
    message: i18n.t('error.UNKNOWN'),
    errors: [],
  }
}

// ── Typed wrapper ─────────────────────────────────────────────────────────────
export interface ApiError {
  statusCode: number
  message: string
  errors: string[]
}

export interface ApiResult<T> {
  data: T | null
  error: ApiError | null
  success: boolean
  message: string
}

export async function apiCall<T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<ApiResult<T>> {
  try {
    const response = await promise
    const body = response.data
    return { data: body.data, error: null, success: true, message: body.message }
  } catch (err) {
    const apiError = err as ApiError
    return {
      data: null,
      error: apiError,
      success: false,
      message: apiError.message ?? i18n.t('error.UNKNOWN'),
    }
  }
}
