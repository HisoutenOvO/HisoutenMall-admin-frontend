import type { PageQuery } from '@/types/common'

export interface AdminReviewPageQueryDTO extends PageQuery {
    productId?: number
    merchantId?: number
    merchantName?: string
    rating?: number
}

// 列表用的精简版 VO
export interface AdminReviewPageResultVO {
    id: number
    userId: number
    nickname: string
    avatar: string
    productId: number
    productName: string
    merchantId: number
    merchantName: string
    rating: number
    createTime: string
}

// 详情用的完整版 VO
export interface AdminReviewDetailVO {
    id: number
    merchantName: string
    nickname: string
    avatar: string
    rating: number
    content: string
    images: string[]
    createTime: string
    productName: string
    productImage: string
    skuSpecs: string
    orderNo: string
}