import request from '@/utils/request'
import type {PageResult,Result} from "@/types/common.ts";
import type {
    MerchantCouponAddDTO,
    MerchantCouponDetailVO,
    MerchantCouponPageQueryDTO,
    MerchantCouponPageResultVO, MerchantCouponUpdateDTO
} from "@/types/merchant/coupon.ts";

//商家分页查询优惠券接口
export const getMerchantCouponPageApi = (params: MerchantCouponPageQueryDTO) =>
    request.get<Result<PageResult<MerchantCouponPageResultVO>>>('/merchant/coupon/page', {params});

//商家查询优惠券详情接口
export const getMerchantCouponDetailApi = (couponId: number) =>
    request.get<Result<MerchantCouponDetailVO>>(`/merchant/coupon/${couponId}`);

//商家新增优惠券接口
export const addMerchantCouponApi = (data: MerchantCouponAddDTO) =>
    request.post<Result>('/merchant/coupon', data);

//商家修改优惠券接口
export const updateMerchantCouponApi = (couponId: number,data: MerchantCouponUpdateDTO) =>
    request.put<Result>(`/merchant/coupon/${couponId}`, data);

//商家删除优惠券接口
export const deleteMerchantCouponApi = (couponId: number) =>
    request.delete<Result>(`/merchant/coupon/${couponId}`);




