import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { AdminDashboardVO, MerchantDashboardVO } from '@/types/common/dashboard'

//获取商家端统计报表接口
export const getMerchantDashboardApi = () =>
    request.get<Result<MerchantDashboardVO>>('/merchant/dashboard/stats')