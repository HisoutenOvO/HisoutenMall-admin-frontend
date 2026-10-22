import type {PageQuery} from "@/types/common.ts";

export interface MerchantCouponAddDTO{
    name: string,
    type: number, //1-满减，2-折扣
    value: number,
    minAmount: number,
    startTime: string,
    endTime: string,
    total: number
}

export interface MerchantCouponPageQueryDTO extends PageQuery {
    keyword?: string,
    status?: number,
    type?: number
}

export interface MerchantCouponUpdateDTO{
    name: string,
    endTime: string
}

export interface MerchantCouponDetailVO{
    id: number,
    name: string,
    type: number,
    value: number,
    minAmount: number,
    startTime: string,
    endTime: string,
    total: number
    remain: number,
    status: number,
    createTime: string
}

export interface MerchantCouponPageResultVO{
    id: number,
    name: string,
    type: number,
    value: number,
    minAmount: number,
    endTime: string,
    startTime: string,
    total: number,
    remain: number,
    receivedCount: number,
    usedCount: number,
    status: number,
    createTime: string
}


