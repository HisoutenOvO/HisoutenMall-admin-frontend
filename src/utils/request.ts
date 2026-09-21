import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: '/api',
    timeout: 6000
})

service.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

service.interceptors.response.use(
    (response) => response.data,
    (error) => {
        ElMessage.error(error.message)
        return Promise.reject(error)
    }
)

export default service as unknown as {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
}