import type { PageQuery } from '@/types/common'

export interface UserPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
}

export interface UserPageResultVO {
    id: number
    username: string
    nickname: string
    avatar: string
    phone: string
    email: string
    status: number
    createTime: string
}