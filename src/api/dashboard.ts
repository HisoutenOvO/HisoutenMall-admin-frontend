import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { AdminDashboardVO, MerchantDashboardVO } from '@/types/common/dashboard'

export const getAdminDashboardApi = () =>
    request.get<Result<AdminDashboardVO>>('/admin/dashboard/stats')

export const getMerchantDashboardApi = () =>
    request.get<Result<MerchantDashboardVO>>('/merchant/dashboard/stats')