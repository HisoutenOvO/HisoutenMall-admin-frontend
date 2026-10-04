import type { PageQuery } from '@/types/common'

export interface BrandPageQueryDTO extends PageQuery {
    keyword?: string
    status?: number
    deleted?: number
}

export interface BrandPageResultVO {
    id: number
    name: string
    logo: string
    sort: number
    status: number
    createTime: string
    updateTime: string
}

export interface BrandAddDTO {
    name: string
    logo?: string
    sort?: number
    status?: number
}

export interface BrandUpdateDTO {
    name: string
    logo?: string
    sort?: number
}

export interface BrandDetailVO {
    id: number
    name: string
    logo: string
    sort: number
    status: number
}