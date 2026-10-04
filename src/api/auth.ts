import request from "@/utils/request"
import type {Result} from "@/types/common.ts";
import type {LoginDTO, LoginVO, UserInfoVO} from "@/types/common/auth.ts";

//商家登录接口
export const merchantLoginApi = (MerchantLoginDTO: LoginDTO) =>
    request.post<Result<LoginVO>>("/merchant/login", MerchantLoginDTO)

//管理员登录接口
export const adminLoginApi = (AdminLoginDTO: LoginDTO) =>
    request.post<Result<LoginVO>>("/admin/login", AdminLoginDTO)

//通用登出接口
export const logoutApi = () =>
    request.post<Result>("/logout")

//查询当前用户信息接口
export const getUserInfoApi = () =>
    request.get<Result<UserInfoVO>>("/info")


export const updatePasswordApi = (data: { oldPwd: string; newPwd: string }) =>
    request.put<Result>('/password', data)

