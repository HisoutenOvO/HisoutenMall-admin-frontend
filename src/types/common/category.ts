export interface CategoryListVO {
    id: number
    parentId: number
    name: string
    level: number
    sort: number
}
export interface CategoryTreeVO {
    id: number
    parentId: number
    name: string
    level: number
    sort: number
    children?: CategoryTreeVO[]
}