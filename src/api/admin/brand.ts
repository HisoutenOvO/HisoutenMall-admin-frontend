import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    BrandPageQueryDTO,
    BrandPageResultVO,
    BrandAddDTO,
    BrandUpdateDTO,
    BrandDetailVO
} from '@/types/admin/brand'

export const getBrandPageApi = (params: BrandPageQueryDTO) =>
    request.get<Result<PageResult<BrandPageResultVO>>>('/admin/brand/page', { params })

export const getBrandDetailApi = (id: number) =>
    request.get<Result<BrandDetailVO>>(`/admin/brand/${id}`)

export const addBrandApi = (data: BrandAddDTO) =>
    request.post<Result>('/admin/brand', data)

export const updateBrandApi = (id: number, data: BrandUpdateDTO) =>
    request.put<Result>(`/admin/brand/${id}`, data)

export const updateBrandStatusApi = (id: number, status: number) =>
    request.put<Result>(`/admin/brand/${id}/status`, null, { params: { status } })

export const deleteBrandApi = (id: number) =>
    request.delete<Result>(`/admin/brand/${id}/deleted`)