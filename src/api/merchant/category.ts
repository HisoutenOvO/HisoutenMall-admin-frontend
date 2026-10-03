import request from "@/utils/request.ts";
import type {Result} from "@/types/common.ts";
import type {CategoryListVO, CategoryTreeVO} from "@/types/common/category.ts";

//商家查询分类列表
export const getMerchantCategoryListApi = () =>
    request.get<Result<CategoryListVO[]>>("/merchant/category/list");

//商家端查询树形分类
export const getMerchantCategoryTreeApi = () =>
    request.get<Result<CategoryTreeVO[]>>('/merchant/category/tree')