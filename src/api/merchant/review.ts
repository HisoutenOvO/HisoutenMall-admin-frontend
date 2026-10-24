import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    MerchantReviewPageQueryDTO,
    MerchantReviewPageResultVO,
    MerchantReviewStatisticsVO,
    ReviewDetailVO
} from '@/types/merchant/review'

// 分页查询
export const getMerchantReviewPageApi = (params: MerchantReviewPageQueryDTO) =>
    request.get<Result<PageResult<MerchantReviewPageResultVO>>>('/merchant/review/page', { params })

// 查询评价详情
export const getMerchantReviewDetailApi = (reviewId: number) =>
    request.get<Result<ReviewDetailVO>>(`/merchant/review/${reviewId}`)

// 查询统计
export const getMerchantReviewStatisticsApi = (productId: number) =>
    request.get<Result<MerchantReviewStatisticsVO>>(`/merchant/review/${productId}/statistics`)