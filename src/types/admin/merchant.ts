import type { PageQuery } from '@/types/common'

export interface MerchantPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
}

export interface MerchantPageResultVO {
    id: number
    username: string
    shopName: string
    shopLogo: string
    contactPhone: string
    auditStatus: number      // 0-待审核 1-通过 2-驳回
    status: number           // 0-禁用 1-正常
    createTime: string
}

export interface MerchantDetailVO {
    id: number
    username: string
    shopName: string
    shopLogo: string
    shopDescription: string
    contactPhone: string
    businessLicense: string
    auditStatus: number
    auditReason: string
    status: number
    createTime: string
}