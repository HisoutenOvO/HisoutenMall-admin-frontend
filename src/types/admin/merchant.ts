import type { PageQuery } from '@/types/common'

export interface AdminMerchantPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
    auditStatus?: number
}

export interface AdminMerchantPageResultVO {
    id: number
    username: string
    shopName: string
    shopLogo: string
    contactPhone: string
    auditStatus: number
    auditReason?: string
    status: number
    createTime: string
}

// 新增：商家详情 VO
export interface AdminMerchantDetailVO {
    id: number
    username: string
    status: number        // 账号状态
    createTime: string    // 注册时间

    shopName: string
    shopLogo: string
    shopDescription: string
    contactPhone: string
    businessLicense: string // 营业执照图片
    auditStatus: number
    auditReason: string
}

export interface AdminAuditMerchantDTO {
    auditStatus: number
    auditReason?: string
}