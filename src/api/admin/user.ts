import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type { UserPageQueryDTO, UserPageResultVO } from '@/types/admin/user'

export const getUserPageApi = (params: UserPageQueryDTO) =>
    request.get<Result<PageResult<UserPageResultVO>>>('/admin/user/page', { params })

export const updateUserStatusApi = (userId: number, status: number) =>
    request.put<Result>(`/admin/user/${userId}/status`, null, { params: { status } })