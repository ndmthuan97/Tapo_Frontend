import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'
import type {
  UserDto,
  AddressDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AddressRequest,
  UserPageResponse,
} from '@/lib/types/user/user.types'
import type { UserRole } from '@/lib/types/user/user.types'

const USER_PATH = '/api/users'
const ADMIN_PATH = '/api/admin/users'

export const userApi = {
  // ── Profile ──────────────────────────────────────────────────────────
  getProfile() {
    return apiCall<UserDto>(httpClient.get<ApiResponse<UserDto>>(`${USER_PATH}/me`))
  },

  updateProfile(body: UpdateProfileRequest) {
    return apiCall<UserDto>(httpClient.patch<ApiResponse<UserDto>>(`${USER_PATH}/me`, body))
  },

  changePassword(body: ChangePasswordRequest) {
    return apiCall<void>(httpClient.patch<ApiResponse<void>>(`${USER_PATH}/me/password`, body))
  },

  // ── Addresses ─────────────────────────────────────────────────────────
  getAddresses() {
    return apiCall<AddressDto[]>(
      httpClient.get<ApiResponse<AddressDto[]>>(`${USER_PATH}/me/addresses`),
    )
  },

  addAddress(body: AddressRequest) {
    return apiCall<AddressDto>(
      httpClient.post<ApiResponse<AddressDto>>(`${USER_PATH}/me/addresses`, body),
    )
  },

  updateAddress(id: string, body: AddressRequest) {
    return apiCall<AddressDto>(
      httpClient.put<ApiResponse<AddressDto>>(`${USER_PATH}/me/addresses/${id}`, body),
    )
  },

  deleteAddress(id: string) {
    return apiCall<void>(httpClient.delete<ApiResponse<void>>(`${USER_PATH}/me/addresses/${id}`))
  },

  setDefaultAddress(id: string) {
    return apiCall<void>(
      httpClient.patch<ApiResponse<void>>(`${USER_PATH}/me/addresses/${id}/default`),
    )
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  adminGetUsers(params: { page?: number; size?: number; role?: UserRole }) {
    return apiCall<UserPageResponse>(
      httpClient.get<ApiResponse<UserPageResponse>>(ADMIN_PATH, { params }),
    )
  },

  lockUser(id: string) {
    return apiCall<void>(httpClient.patch<ApiResponse<void>>(`${ADMIN_PATH}/${id}/lock`))
  },

  unlockUser(id: string) {
    return apiCall<void>(httpClient.patch<ApiResponse<void>>(`${ADMIN_PATH}/${id}/unlock`))
  },
}
