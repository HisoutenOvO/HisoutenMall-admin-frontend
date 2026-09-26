import type { PageQuery } from '@/types/common.ts'


export interface MerchantCategoryPageQueryDTO extends PageQuery {
    keyword?: string
}

export interface CategoryListVO{
    id: number
    parentId: number
    name: string
    level: number
    sort: number
}

