import type { PageQuery } from '@/types/common'

export interface MerchantProductPageResultVO {
    id: number
    merchantId: number
    categoryId: number
    brandId: number
    name: string
    status: number
    merchantName: string
    categoryName: string
    brandName: string
    deleted: number
    mainImage: string
    updateTime: string
}

export interface MerchantProductDetailVO {
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
    createTime: string
    updateTime: string
    status: number
    deleted: number
}

export interface MerchantProductAddDTO {
    name: string
    subtitle?: string
    categoryId?: number
    brandId?: number
    mainImage?: string
    detail?: string
    status?: number
}

export interface MerchantProductUpdateDTO {
    name: string
    subtitle?: string
    categoryId?: number
    brandId?: number
    mainImage?: string
    detail?: string
}

export interface MerchantProductPageQueryDTO extends PageQuery {
    keyword?: string
    categoryId?: number
    status?: number
    deleted?: number   // 0-正常，1-回收站
}

export interface Product{
    id: number
    name: string
    merchantId: number
    brandId: number
    categoryId: number
    subtitle: string
    mainImage: string
    detail: string
    status?: number
    deleted?: number
    createTime?: string
    updateTime?: string
}