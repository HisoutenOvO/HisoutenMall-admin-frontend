import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    AdminCouponDetailVO,
    AdminCouponPageQueryDTO,
    AdminCouponPageResultVO
} from '@/types/admin/coupon'

export const getAdminCouponPageApi = (params: AdminCouponPageQueryDTO) =>
    request.get<Result<PageResult<AdminCouponPageResultVO>>>('/admin/coupon/page', { params })

export const getAdminCouponDetailApi = (couponId: number) =>
    request.get<Result<AdminCouponDetailVO>>(`/admin/coupon/${couponId}`)