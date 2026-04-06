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
  avgOrderValue: number
  // User KPIs
  totalUsers: number
  activeUsers: number
  lockedUsers: number
  newUsersThisMonth: number
  returningUsers: number
  // Order status breakdown
  pendingOrders: number
  processingOrders: number
  deliveredOrders: number
  cancelledOrders: number
  returnOrders: number
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

  async exportDashboard(year: number): Promise<{ ok: true; blob: Blob } | { ok: false; message: string }> {
    try {
      const res = await httpClient.get<ArrayBuffer>('/api/admin/statistics/export', {
        params: { year },
        responseType: 'arraybuffer',
      })
      const blob = new Blob([res.data as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      return { ok: true, blob }
    } catch {
      return { ok: false, message: 'Export failed' }
    }
  },
}
