export interface MerchantProfileVO{
    userId: number
    username: string
    shopName: string
    shopLogo: string
    shopDescription: string
    contactPhone: string
    businessLicense: string
    auditStatus: number
    auditReason: string
}

export interface MerchantProfileUpdateDTO {
    shopName: string
    shopLogo?: string
    shopDescription?: string
    contactPhone: string
}