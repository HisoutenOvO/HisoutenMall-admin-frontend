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
    skuList: MerchantProductSkuVO[]
}

export interface MerchantProductAddDTO {
    name: string
    subtitle?: string
    categoryId?: number
    brandId?: number
    mainImage?: string
    detail?: string
    status?: number
    skuList: ProductSkuItemDTO[]
}

export interface MerchantProductUpdateDTO {
    name: string
    subtitle?: string
    categoryId?: number
    brandId?: number
    mainImage?: string
    detail?: string
    skuList: ProductSkuItemDTO[]
}

export interface MerchantProductPageQueryDTO extends PageQuery {
    keyword?: string
    categoryId?: number
    brandId?: number
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


export interface ProductSkuItemDTO{
    skuId?: number
    specs?: string
    price: number
    stock: number
    image?: string
}

export interface MerchantProductSkuVO {
    id: number
    specs: string
    price: number
    stock: number
    image: string
    status?: number
    deleted: number
}
export interface SkuUpdateDTO {
    specs?: string
    price?: number
    stock?: number
    image?: string
    status?: number
}