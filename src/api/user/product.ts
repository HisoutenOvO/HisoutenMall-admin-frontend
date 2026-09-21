import request from '@/utils/request'
import type { Result,PageResult } from '@/types/common'
import type {UserProductDetailVO, UserProductPageQueryDTO, UserProductPageResultVO} from "@/types/user/product.ts";

//用户查询商品详情接口
export const getUserProductDetailApi = (productId: number) =>
    request.get<Result<UserProductDetailVO>>(`/user/product/${productId}`)

//用户分页查询商品接口
export const getUserProductPageApi = (params: UserProductPageQueryDTO) =>
    request.get<Result<PageResult<UserProductPageResultVO>>>('/user/product/page', {params})
