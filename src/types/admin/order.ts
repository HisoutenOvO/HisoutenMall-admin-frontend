import type { PageQuery } from '@/types/common'

export interface AdminOrderPageQueryDTO extends PageQuery {
    orderNo?: string
    merchantName?: string
    buyerUsername?: string
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

export interface OrderCouponVO {
    couponName: string
    type: number
    value: number
}

export interface LogisticsVO {
    company: string
    trackingNo: string
    status: number
    shipTime: string
}

export interface AdminOrderPageResultVO {
    id: number
    orderNo: string
    merchantName: string
    buyerUsername: string
    payAmount: number
    status: number
    createTime: string
}

export interface AdminOrderDetailVO {
    orderNo: string
    merchantName: string
    buyerUsername: string
    status: number
    totalAmount: number
    payAmount: number
    discountAmount: number
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    createTime: string
    payTime: string | null
    items: OrderItemVO[]
    couponInfo: OrderCouponVO | null
    logistics: LogisticsVO | null
}