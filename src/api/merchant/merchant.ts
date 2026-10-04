import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { MerchantProfileVO, MerchantProfileUpdateDTO } from '@/types/merchant/merchant'

export const getMerchantProfileApi = () =>
    request.get<Result<MerchantProfileVO>>('/merchant/profile')

export const updateMerchantProfileApi = (data: MerchantProfileUpdateDTO) =>
    request.put<Result>('/merchant/profile', data)
