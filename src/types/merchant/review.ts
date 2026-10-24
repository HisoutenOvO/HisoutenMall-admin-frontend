import type { PageQuery } from '@/types/common'

export interface MerchantReviewPageQueryDTO extends PageQuery {
    productId?: number
    rating?: number
    keyword?: string
}

export interface MerchantReviewPageResultVO {
    id: number
    nickname: string
    avatar: string
    rating: number
    content: string
    images: string[]
    skuSpecs: string
    createTime: string
}

export interface MerchantReviewStatisticsVO {
    totalCount: number
    avgRating: number
    goodCount: number
    goodRate: number
    ratingCountMap: Record<number, number>
}

export interface ReviewDetailVO {
    id: number
    nickname: string
    avatar: string
    rating: number
    content: string
    images: string[]
    productName: string
    skuSpecs: string
    orderNo: string
    createTime: string
}