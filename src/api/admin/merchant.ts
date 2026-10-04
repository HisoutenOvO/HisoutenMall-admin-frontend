import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    MerchantPageQueryDTO,
    MerchantPageResultVO,
    MerchantDetailVO
} from '@/types/admin/merchant'

export const getMerchantPageApi = (params: MerchantPageQueryDTO) =>
    request.get<Result<PageResult<MerchantPageResultVO>>>('/admin/merchant/page', { params })

export const getMerchantDetailApi = (userId: number) =>
    request.get<Result<MerchantDetailVO>>(`/admin/merchant/${userId}`)

export const updateMerchantStatusApi = (userId: number, status: number) =>
    request.post<Result>(`/admin/merchant/${userId}/status`, null, { params: { status } })