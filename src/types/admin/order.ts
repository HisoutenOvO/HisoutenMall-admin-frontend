import type { PageQuery } from '@/types/common'

export interface AdminOrderPageQueryDTO extends PageQuery {
    orderNo?: string
    status?: number
}

export interface OrderItemVO {
    productId: number
    skuId: number
    productName: string
    skuSpecs: string
    image: string
    price: number
    quantity: number
    totalPrice: number
}

export interface AdminOrderPageResultVO {
    id: number
    orderNo: string
    userId: number
    merchantId: number
    merchantName: string
    totalAmount: number
    payAmount: number
    status: number
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    createTime: string
    payTime: string
    items: OrderItemVO[]
}