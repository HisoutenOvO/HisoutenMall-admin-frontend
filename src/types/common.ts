// 后端统一返回结构
export interface Result<T = any> {
    code: number
    msg: string
    data: T
}

// 分页返回结构
export interface PageResult<T> {
    total: number
    records: T[]
}

// 分页入参基类
export interface PageQuery {
    page: number
    pageSize: number
}