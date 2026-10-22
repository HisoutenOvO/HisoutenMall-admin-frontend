import type { PageQuery } from '@/types/common'

export interface MerchantSeckillPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
}

export interface MerchantSeckillPageResultVO {
    id: number
    name: string
    startTime: string
    endTime: string
    status: number
    productCount: number
    createTime: string // 补全
}

export interface MerchantSeckillActivitySaveDTO {
    name: string
    startTime: string
    endTime: string
}

export interface MerchantSeckillProductVO {
    id: number            // 秒杀商品表 id
    skuId: number
    productName: string
    skuSpecs: string
    image: string
    originalPrice: number
    seckillPrice: number
    seckillStock: number
    skuStock: number      // 补全：普通库存
    limitPerUser: number
}

export interface MerchantSeckillDetailVO {
    id: number
    name: string
    startTime: string
    endTime: string
    status: number
    products: MerchantSeckillProductVO[]
}

export interface MerchantSeckillProductAddDTO {
    activityId: number
    items: {
        skuId: number
        seckillPrice: number
        seckillStock: number
        limitPerUser: number
    }[]
}

// 新增：修改秒杀商品参数
export interface MerchantSeckillProductUpdateDTO {
    seckillPrice: number
    seckillStock: number
    limitPerUser: number
}