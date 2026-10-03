import request from '@/utils/request';
import type {Result, PageResult} from '@/types/common.ts'
import type {
    MerchantOrderDetailVO,
    MerchantOrderPageQueryDTO,
    MerchantOrderPageResultVO
} from "@/types/merchant/order.ts";

//商家分页查询订单接口
export const getMerchantOrderPageApi = (params: MerchantOrderPageQueryDTO) =>
    request.get<Result<PageResult<MerchantOrderPageResultVO>>>('/merchant/order/page', {params})

//商家查询订单详情接口
export const getMerchantOrderDetailApi = (orderNo: string) =>
    request.get<Result<MerchantOrderDetailVO>>(`/merchant/order/${orderNo}`)

//商家发货接口
export const shipOrderApi = (orderNo: string) =>
    request.put<Result>(`/merchant/order/${orderNo}/ship`, orderNo)