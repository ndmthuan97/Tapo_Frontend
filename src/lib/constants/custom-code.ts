import i18n from '@/lib/i18n'

// Mirrors backend CustomCode enum — keep in sync with backend/dto/common/CustomCode.java
export const CustomCode = {
  SUCCESS: 2000,
  CREATED: 2001,
  UPDATED: 2002,
  DELETED: 2003,
  NO_CONTENT: 2004,

  BAD_REQUEST: 4000,
  UNAUTHORIZED: 4001,
  FORBIDDEN: 4003,
  NOT_FOUND: 4004,
  VALIDATION_FAILED: 4005,
  CREDENTIALS_INVALID: 4006,
  EMAIL_ALREADY_EXISTS: 4007,
  USER_NOT_FOUND: 4008,
  ACCOUNT_LOCKED: 4009,
  INVALID_REFRESH_TOKEN: 4010,
  EXPIRED_REFRESH_TOKEN: 4011,

  INTERNAL_SERVER_ERROR: 5000,
} as const

export type CustomCodeValue = (typeof CustomCode)[keyof typeof CustomCode]

// Maps a numeric code to its i18n key under the "error" namespace
const CODE_KEY_MAP: Record<CustomCodeValue, string> = {
  [CustomCode.SUCCESS]: 'error.SUCCESS',
  [CustomCode.CREATED]: 'error.CREATED',
  [CustomCode.UPDATED]: 'error.UPDATED',
  [CustomCode.DELETED]: 'error.DELETED',
  [CustomCode.NO_CONTENT]: 'error.NO_CONTENT',
  [CustomCode.BAD_REQUEST]: 'error.BAD_REQUEST',
  [CustomCode.UNAUTHORIZED]: 'error.UNAUTHORIZED',
  [CustomCode.FORBIDDEN]: 'error.FORBIDDEN',
  [CustomCode.NOT_FOUND]: 'error.NOT_FOUND',
  [CustomCode.VALIDATION_FAILED]: 'error.VALIDATION_FAILED',
  [CustomCode.CREDENTIALS_INVALID]: 'error.CREDENTIALS_INVALID',
  [CustomCode.EMAIL_ALREADY_EXISTS]: 'error.EMAIL_ALREADY_EXISTS',
  [CustomCode.USER_NOT_FOUND]: 'error.USER_NOT_FOUND',
  [CustomCode.ACCOUNT_LOCKED]: 'error.ACCOUNT_LOCKED',
  [CustomCode.INVALID_REFRESH_TOKEN]: 'error.INVALID_REFRESH_TOKEN',
  [CustomCode.EXPIRED_REFRESH_TOKEN]: 'error.EXPIRED_REFRESH_TOKEN',
  [CustomCode.INTERNAL_SERVER_ERROR]: 'error.INTERNAL_SERVER_ERROR',
}

// Resolves a backend status code to a translated human-readable message
export function getMessageForCode(code: number): string {
  const key = CODE_KEY_MAP[code as CustomCodeValue] ?? 'error.UNKNOWN'
  return i18n.t(key)
}
