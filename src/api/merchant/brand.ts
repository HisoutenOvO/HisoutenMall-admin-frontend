import request from '@/utils/request'
import type {Result} from "@/types/common.ts";
import type{BrandListVO} from "@/types/common/brand.ts";

export const getMerchantBrandListApi =  () => {
    return request.get<Result<BrandListVO[]>>("/merchant/brand/list");
}