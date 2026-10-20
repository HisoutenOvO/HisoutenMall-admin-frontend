import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    AdminMerchantPageQueryDTO,
    AdminMerchantPageResultVO,
    AdminMerchantDetailVO,
    AdminAuditMerchantDTO
} from '@/types/admin/merchant'

export const getMerchantPageApi = (params: AdminMerchantPageQueryDTO) =>
    request.get<Result<PageResult<AdminMerchantPageResultVO>>>('/admin/merchant/page', { params })

// 新增：获取商家详情
export const getMerchantDetailApi = (merchantId: number) =>
    request.get<Result<AdminMerchantDetailVO>>(`/admin/merchant/${merchantId}`)

export const auditMerchantApi = (merchantId: number, data: AdminAuditMerchantDTO) =>
    request.put<Result>(`/admin/merchant/${merchantId}/audit`, data)

export const updateMerchantStatusApi = (merchantId: number, status: number) =>
    request.put<Result>(`/admin/merchant/${merchantId}/status`, null, { params: { status } })