import request from '@/utils/request.ts'
import type {Result, PageResult} from "@/types/common.ts";
import type {
    MerchantProductAddDTO,
    MerchantProductDetailVO,
    MerchantProductPageQueryDTO,
    MerchantProductPageResultVO, MerchantProductUpdateDTO
} from "@/types/merchant/product.ts";

//商家分页查询商品接口
export const getMerchantProductPageApi = (params: MerchantProductPageQueryDTO) =>
    request.get<Result<PageResult<MerchantProductPageResultVO>>>('/merchant/product/page', {params})

//商家查询商品详情接口
export const getMerchantProductDetailApi = (productId: number) =>
    request.get<Result<MerchantProductDetailVO>>(`/merchant/product/${productId}`)

//商家发布商品接口
export const addMerchantProductApi = (ProductAddDTO: MerchantProductAddDTO) =>
    request.post<Result>('/merchant/product', ProductAddDTO)

//商家修改商品接口
export const updateMerchantProductApi = (productId: number, data: MerchantProductUpdateDTO) =>
    request.put<Result>(`/merchant/product/${productId}`, data)

//商家上下架商品接口
export const updateMerchantProductStatusApi = (productId: number, status: number) =>
    request.put<Result>(`/merchant/product/${productId}/status`, null, {params: {status}})

//商家逻辑删除商品接口
export const deleteMerchantProductLogicApi = (productId: number) =>
    request.delete<Result>(`/merchant/product/${productId}/deleted`)

//商家恢复逻辑删除商品接口
export const updateMerchantProductDeletedApi = (productId: number) =>
    request.put<Result>(`/merchant/product/${productId}/deleted`)

//商家物理删除商品接口
export const deleteMerchantProductPhysicalApi = (productId: number) =>
    request.delete<Result>(`/merchant/product/${productId}`)