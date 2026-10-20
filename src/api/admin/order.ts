import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    AdminOrderPageQueryDTO,
    AdminOrderPageResultVO,
    AdminOrderDetailVO
} from '@/types/admin/order'

export const getAdminOrderPageApi = (params: AdminOrderPageQueryDTO) =>
    request.get<Result<PageResult<AdminOrderPageResultVO>>>('/admin/order/page', { params })

export const getAdminOrderDetailApi = (orderNo: string) =>
    request.get<Result<AdminOrderDetailVO>>(`/admin/order/${orderNo}`)