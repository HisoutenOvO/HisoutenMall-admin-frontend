import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: '/api',
    timeout: 6000
})

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['satoken'] = token
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 防重复跳转
let isRedirecting = false

function handleUnauthorized(msg?: string) {
    if (isRedirecting) return
    isRedirecting = true
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    ElMessage.error(msg || '登录已过期，请重新登录')
    import('@/router').then(({ default: router }) => {
        router.push('/login').finally(() => {
            setTimeout(() => { isRedirecting = false }, 1500)
        })
    })
}

service.interceptors.response.use(
    (response) => {
        const res = response.data
        // 业务层 401：未登录
        if (res.code === 401) {
            handleUnauthorized(res.msg)
            return Promise.reject(new Error(res.msg || '未登录'))
        }
        return res
    },
    (error) => {
        // HTTP 层 401（后端如果配了 HTTP 401 就走这里）
        if (error.response?.status === 401) {
            handleUnauthorized()
            return Promise.reject(error)
        }
        ElMessage.error(error.response?.data?.msg || error.message)
        return Promise.reject(error)
    }
)

export default service as unknown as {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
}