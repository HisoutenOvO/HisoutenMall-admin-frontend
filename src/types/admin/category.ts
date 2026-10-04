export interface CategoryTreeVO {
    id: number
    parentId: number
    name: string
    level: number
    sort: number
    status: number
    children?: CategoryTreeVO[]
}

export interface CategoryAddDTO {
    parentId: number
    name: string
    sort?: number
}

export interface CategoryUpdateDTO {
    name: string
    sort?: number
}