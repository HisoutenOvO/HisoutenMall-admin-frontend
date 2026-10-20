import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { AdminDashboardVO, MerchantDashboardVO } from '@/types/common/dashboard.ts'

//获取管理端统计报表接口
export const getAdminDashboardApi = () =>
    request.get<Result<AdminDashboardVO>>('/admin/dashboard/stats')
