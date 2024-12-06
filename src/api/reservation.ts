import request from '@/utils/request'

// 创建预约的请求参数类型
export interface CreateReservationRequest {
  customerName: string
  phone: string
  email: string
  plateNo: string
  parkingLot: string
  spaceType: string
  zoneName: string
  spaceNo?: string
  quantity: number
  startTime: string
  endTime: string
  notes?: string
}

// 创建预约的响应类型
export interface CreateReservationResponse {
  id: string
  orderNo: string
  status: number
  amount: number
  createdAt: string
}

// 创建预约的 API
export const createReservation = (data: CreateReservationRequest) => {
  return request<CreateReservationResponse>({
    url: '/api/reservations',
    method: 'post',
    data,
    validateStatus: (status: number) => {
      return status >= 200 && status < 300
    }
  })
}

// 支付预约的请求参数类型
export interface PayReservationRequest {
  orderId: string
  paymentMethod: string
}

// 支付预约的 API
export const payReservation = (data: PayReservationRequest) => {
  return request<void>({
    url: '/api/reservations/pay',
    method: 'post',
    data,
    validateStatus: (status: number) => {
      return status >= 200 && status < 300
    }
  })
}

// 校验预订参数类型
export interface ValidateReservationRequest {
  parkingLot: string
  spaceType: string
  zoneName: string
  spaceNo?: string
  quantity: number
  startTime: string
  endTime: string
}

// 校验结果类型
export interface ValidationResult {
  available: boolean
  availableQuantity?: number
  message?: string
}

// 校验预订的 API
export const validateReservation = (data: ValidateReservationRequest) => {
  return request<ValidationResult>({
    url: '/api/reservations/validate',
    method: 'post',
    data
  })
}

// 修改错误响应类型
export interface ApiError {
  code: string
  message: string
  details?: {
    availableQuantity?: number
    conflictTimes?: string[]
    [key: string]: any
  }
} 