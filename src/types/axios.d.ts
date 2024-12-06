import type { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>
  }
} 