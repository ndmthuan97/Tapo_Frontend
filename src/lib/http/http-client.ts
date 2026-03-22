import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/lib/types/common/api.types'
import { getMessageForCode } from '@/lib/constants/custom-code'
import i18n from '@/lib/i18n'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Request: auto-attach access token ──────────────────────────────────────
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: normalize error messages using CustomCode → i18n ─────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const serverData = error.response?.data

    if (serverData?.statusCode) {
      return Promise.reject({
        statusCode: serverData.statusCode,
        message: getMessageForCode(serverData.statusCode),
        errors: serverData.errors ?? [],
        raw: serverData,
      })
    }

    if (!error.response) {
      return Promise.reject({
        statusCode: 0,
        message: i18n.t('error.NETWORK'),
        errors: [],
      })
    }

    return Promise.reject({
      statusCode: error.response.status,
      message: i18n.t('error.UNKNOWN'),
      errors: [],
    })
  },
)

// ── Typed wrapper ───────────────────────────────────────────────────────────
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
