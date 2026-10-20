import type { PageQuery } from '@/types/common'

// ==== 分页查询相关 ====
export interface AdminSeckillPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
    merchantName?: string
}

export interface AdminSeckillPageResultVO {
    id: number
    merchantName: string
    name: string
    startTime: string
    endTime: string
    status: number
    productCount: number
    createTime: string
}

// ==== 详情查询相关 ====
export interface SeckillProductItemVO {
    id: number
    skuId: number
    productName: string
    skuSpecs: string
    image: string
    originalPrice: number
    seckillPrice: number
    seckillStock: number
    skuStock: number
    limitPerUser: number
}

export interface AdminSeckillDetailVO {
    id: number
    merchantName: string
    name: string
    startTime: string
    endTime: string
    status: number
    products: SeckillProductItemVO[]
}