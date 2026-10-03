export interface MerchantOrderPageQueryDTO{
    page: number
    pageSize: number
    keyword?: string
    status?: number
}

export interface MerchantOrderPageResultVO{
    id: number
    orderNo: string
    buyerName: string
    payAmount: number
    status: number
    createTime: string
    items: OrderItemVO[]
}

export interface OrderItemVO {
    orderId: number
    productId: number
    skuId: number
    productName: string
    skuSpecs: string
    image: string
    price: number
    quantity: number
    totalPrice: number
}

export interface MerchantOrderDetailVO {
    orderNo: string
    status: number
    totalAmount: number
    payAmount: number
    buyerUsername: string
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    createTime: string
    payTime: string
    items: OrderItemVO[]
}