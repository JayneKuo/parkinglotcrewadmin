import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiError } from '@/api/types'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    if (response.status >= 200 && response.status < 300) {
      return res
    }
    
    const errorMessage = res.message || 'Request failed'
    ElMessage.error(errorMessage)
    return Promise.reject(res)
  },
  (error: AxiosError<ApiError>) => {
    console.error('Response error:', error)
    
    let message = 'Request failed'
    if (error.response?.data) {
      const errorData = error.response.data
      switch (errorData.code) {
        case 'SPACE_NOT_AVAILABLE':
          message = 'Selected space is not available for the chosen time'
          break
        case 'INSUFFICIENT_QUANTITY':
          message = `Only ${errorData.details?.availableQuantity} spaces available`
          break
        case 'TIME_CONFLICT':
          message = 'Selected time period is not available'
          break
        case 'INVALID_TIME_RANGE':
          message = 'Invalid time range selected'
          break
        default:
          message = errorData.message || 'Unknown error'
      }
    } else if (error.request) {
      message = 'No response from server'
    } else {
      message = error.message || 'Request failed'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config) as Promise<T>
}

export default request 