import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
import type {
    AdminSeckillPageQueryDTO,
    AdminSeckillPageResultVO,
    AdminSeckillDetailVO
} from '@/types/admin/seckill'

// 分页查询秒杀活动
export const getAdminSeckillPageApi = (params: AdminSeckillPageQueryDTO) =>
    request.get<Result<PageResult<AdminSeckillPageResultVO>>>('/admin/seckill/activity/page', { params })

// 查询秒杀活动详情
export const getAdminSeckillDetailApi = (activityId: number) =>
    request.get<Result<AdminSeckillDetailVO>>(`/admin/seckill/activity/${activityId}`)