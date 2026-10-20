import type { PageQuery } from '@/types/common'

export interface AdminProductPageQueryDTO extends PageQuery {
    keyword?: string
    categoryId?: number
    brandId?: number
    status?: number
    merchantId?: number
    deleted?: number
    merchantName?: string
}

export interface AdminProductSkuVO {
    id: number
    specs: string
    price: number
    stock: number
    image: string
    status: number
    deleted: number
}

export interface AdminProductPageResultVO {
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
    minPrice: number
    totalStock: number
    updateTime: string
}

export interface AdminProductDetailVO {
    id: number
    merchantId: number
    categoryId: number
    brandId: number
    name: string
    subtitle: string
    mainImage: string
    detail: string
    status: number
    deleted: number
    merchantName: string
    categoryName: string
    brandName: string
    skuList: AdminProductSkuVO[]
}