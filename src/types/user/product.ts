import type { PageQuery } from '@/types/common'

export interface UserProductPageResultVO {
    id: number
    merchantId: number
    categoryId: number
    brandId: number
    name: string
    merchantName: string
    categoryName: string
    brandName: string
    mainImage: string
}

export interface UserProductDetailVO {
    id: number
    name: string
    subtitle: string
    categoryId: number
    merchantId: number
    merchantName: string
    brandId: number
    categoryName: string
    brandName: string
    mainImage: string
    detail: string
}

export interface UserProductPageQueryDTO extends PageQuery {
    keyword?: string
    categoryId?: number
}