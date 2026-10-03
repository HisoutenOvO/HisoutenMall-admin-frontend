import request from '@/utils/request'
import type {Result} from "@/types/common.ts";
import type {MerchantProductSkuVO, SkuUpdateDTO} from "@/types/merchant/product.ts";

export const updateSkuApi = (skuId: number, data: SkuUpdateDTO) =>
    request.put<Result>(`/merchant/product/sku/${skuId}`, data)

export const deleteSkuApi = (skuId: number) =>
    request.delete<Result>(`/merchant/product/sku/${skuId}/deleted`)

export const recoverySkuApi = (skuId: number) =>
    request.put<Result>(`/merchant/product/sku/${skuId}/deleted`)

export const physicalDeleteSkuApi = (skuId: number) =>
    request.delete<Result>(`/merchant/product/sku/${skuId}`)

export const updateSkuStatusApi = (skuId: number, status: number) =>
    request.put<Result>(`/merchant/product/sku/${skuId}/status`, null, { params: { status } })

export const listSkuApi = (productId: number) =>
    request.get<Result<MerchantProductSkuVO[]>>(`/merchant/product/${productId}/sku`)