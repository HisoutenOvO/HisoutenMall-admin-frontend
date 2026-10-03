import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoApi, logoutApi } from '@/api/auth'
import type { UserInfoVO } from '@/types/common/auth'

//登录的store
export const useAuthStore = defineStore('auth',() => {

    const token = ref<string>(localStorage.getItem('token') || '')
    const role = ref<number>(Number(localStorage.getItem('role') || '0'))
    const userInfo = ref<UserInfoVO | null>(null)

    //设置新token
    const setToken = (newToken: string) => {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    //设置新角色
    const setRole = (newRole: number) => {
        role.value = newRole
        localStorage.setItem('role', String(newRole))
    }

    //设置用户信息
    const fetchUserInfo = async () => {
        const result = await getUserInfoApi()
        if (result.code === 1) {
            userInfo.value = result.data
        }
    }

    //设置登出方法
    const logout = async () => {
        try {
            await logoutApi()
        } catch {}
        token.value = ''
        role.value = 0
        userInfo.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    return {token, role, userInfo, fetchUserInfo, setToken, setRole, logout}
})
