import type { PageQuery } from '@/types/common'

export interface AdminOrderPageQueryDTO extends PageQuery {
    orderNo?: string
    merchantName?: string
    buyerUsername?: string // 注意这里是 buyerUsername
    status?: number
}

export interface OrderItemVO {
    productName: string
    skuSpecs: string
    price: number
    quantity: number
    totalPrice: number
    image: string
}

export interface AdminOrderPageResultVO {
    id: number
    orderNo: string
    merchantName: string
    buyerUsername: string // 这里也是 buyerUsername
    payAmount: number
    status: number
    source: number
    createTime: string
}

// 详情专属 VO
export interface AdminOrderDetailVO {
    orderNo: string
    status: number
    buyerUsername: string
    merchantName: string
    createTime: string
    payTime: string | null
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    payAmount: number
    items: OrderItemVO[]
}