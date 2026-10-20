import type { PageQuery } from '@/types/common'

export interface AdminCouponPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
    type?: number
    merchantName?: string
}

export interface AdminCouponPageResultVO {
    id: number
    merchantId: number
    merchantName: string
    name: string
    type: number // 1-满减 2-折扣
    value: number
    minAmount: number
    startTime: string
    endTime: string
    total: number
    remain: number
    receivedCount: number
    usedCount: number
    status: number // 0-未开始 1-进行中 2-已结束
    createTime: string
}

export interface AdminCouponDetailVO {
    id: number
    merchantName: string
    name: string
    type: number
    value: number
    minAmount: number
    startTime: string
    endTime: string
    total: number
    remain: number
    status: number
    createTime: string
}