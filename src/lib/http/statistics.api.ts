import { httpClient, apiCall } from '@/lib/http/http-client'
import type { ApiResponse } from '@/lib/types/common/api.types'

export interface RevenueDataPoint {
  label: string
  revenue: number
  orderCount: number
}

export interface TopProductDto {
  productId: string
  name: string
  thumbnailUrl: string | null
  totalSold: number
  totalRevenue: number
}

export interface DashboardStatsDto {
  // Revenue KPIs
  totalRevenue: number
  revenueThisMonth: number
  revenuePrevMonth: number
  revenueGrowthPct: number
  // Order KPIs
  totalOrders: number
  ordersThisMonth: number
  ordersPrevMonth: number
  ordersGrowthPct: number
  // User KPIs
  totalUsers: number
  activeUsers: number
  lockedUsers: number
  newUsersThisMonth: number
  // Order status breakdown
  pendingOrders: number
  processingOrders: number
  deliveredOrders: number
  cancelledOrders: number
  // Chart data
  monthlyRevenue: RevenueDataPoint[]
  quarterlyRevenue: RevenueDataPoint[]
  // Top products
  topProducts: TopProductDto[]
}

export const statisticsApi = {
  getDashboard(year?: number) {
    return apiCall<DashboardStatsDto>(
      httpClient.get<ApiResponse<DashboardStatsDto>>('/api/admin/statistics/dashboard', {
        params: year ? { year } : {},
      }),
    )
  },
}
