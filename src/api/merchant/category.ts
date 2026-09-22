import request from "@/utils/request.ts";
import type {Result} from "@/types/common.ts";
import type {CategoryListVO} from "@/types/common/category.ts";

//商家查询分类列表
export const getMerchantCategoryListApi = () =>
    request.get<Result<CategoryListVO[]>>("/merchant/category/list");