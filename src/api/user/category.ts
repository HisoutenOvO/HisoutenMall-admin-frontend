import request from '@/utils/request'
import type { Result } from '@/types/common'
import type { UserCategoryListVO } from '@/types/user/category'

//用户查询分类列表
export const getUserCategoryListApi = () =>
    request.get<Result<UserCategoryListVO[]>>('/category/list')