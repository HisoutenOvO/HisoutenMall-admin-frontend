import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { CategoryTreeVO, CategoryAddDTO, CategoryUpdateDTO } from '@/types/admin/category'

export const getCategoryTreeApi = () =>
    request.get<Result<CategoryTreeVO[]>>('/admin/category/tree')

export const addCategoryApi = (data: CategoryAddDTO) =>
    request.post<Result>('/admin/category', data)

export const updateCategoryApi = (id: number, data: CategoryUpdateDTO) =>
    request.put<Result>(`/admin/category/${id}`, data)

export const updateCategoryStatusApi = (id: number, status: number) =>
    request.put<Result>(`/admin/category/${id}/status`, null, { params: { status } })

export const deleteCategoryApi = (id: number) =>
    request.delete<Result>(`/admin/category/${id}/deleted`)