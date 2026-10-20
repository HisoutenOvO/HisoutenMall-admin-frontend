import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'

// 严格分开导入 Types
import type {
    AdminReviewPageQueryDTO,
    AdminReviewPageResultVO,
    AdminReviewDetailVO
} from '@/types/admin/review'

// 分页查询评价
export const getAdminReviewPageApi = (params: AdminReviewPageQueryDTO) =>
    request.get<Result<PageResult<AdminReviewPageResultVO>>>('/admin/review/page', { params })

// 查询详情
export const getAdminReviewDetailApi = (reviewId: number) =>
    request.get<Result<AdminReviewDetailVO>>(`/admin/review/${reviewId}`)

// 强制删除
export const deleteAdminReviewApi = (reviewId: number) =>
    request.delete<Result>(`/admin/review/${reviewId}`)