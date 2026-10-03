export interface LoginDTO {
    username: string
    password: string
}

export interface LoginVO {
    userId: number
    username: string
    token: string
    role: number
}

export interface UserInfoVO {
    userId: number
    username: string
    role: number
    nickname?: string
    avatar?: string
    phone?: string
    email?: string
    shopName?: string
    shopLogo?: string
    auditStatus?: number
    realName?: string
    adminLevel?: number
}