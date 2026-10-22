import request from '@/utils/request'
import type { Result, PageResult } from '@/types/common'
// 严格分开导入
import type {
    MerchantSeckillPageQueryDTO,
    MerchantSeckillPageResultVO,
    MerchantSeckillActivitySaveDTO,
    MerchantSeckillDetailVO,
    MerchantSeckillProductAddDTO,
    MerchantSeckillProductUpdateDTO
} from '@/types/merchant/seckill'

export const getMerchantSeckillPageApi = (params: MerchantSeckillPageQueryDTO) =>
    request.get<Result<PageResult<MerchantSeckillPageResultVO>>>('/merchant/seckill/activity/page', { params })

export const addMerchantSeckillApi = (data: MerchantSeckillActivitySaveDTO) =>
    request.post<Result>('/merchant/seckill/activity', data)

// 新增：修改秒杀活动
export const updateMerchantSeckillApi = (activityId: number, data: MerchantSeckillActivitySaveDTO) =>
    request.put<Result>(`/merchant/seckill/activity/${activityId}`, data)

export const getMerchantSeckillDetailApi = (activityId: number) =>
    request.get<Result<MerchantSeckillDetailVO>>(`/merchant/seckill/activity/${activityId}`)

export const addSeckillProductApi = (data: MerchantSeckillProductAddDTO) =>
    request.post<Result>('/merchant/seckill/product', data)

// 新增：修改秒杀商品
export const updateSeckillProductApi = (productId: number, data: MerchantSeckillProductUpdateDTO) =>
    request.put<Result>(`/merchant/seckill/product/${productId}`, data)

export const deleteMerchantSeckillApi = (activityId: number) =>
    request.delete<Result>(`/merchant/seckill/activity/${activityId}`)

export const removeSeckillProductApi = (seckillProductId: number) =>
    request.delete<Result>(`/merchant/seckill/product/${seckillProductId}`)