import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    AdminProductPageQueryDTO,
    AdminProductPageResultVO,
    AdminProductDetailVO
} from '@/types/admin/product'

// 分页查询全平台商品
export const getAdminProductPageApi = (params: AdminProductPageQueryDTO) =>
    request.get<Result<PageResult<AdminProductPageResultVO>>>('/admin/product/page', { params })

// 查询商品详情
export const getAdminProductDetailApi = (productId: number) =>
    request.get<Result<AdminProductDetailVO>>(`/admin/product/${productId}`)

// 强制下架商品
export const offlineProductApi = (productId: number) =>
    request.put<Result>(`/admin/product/${productId}/offline`)