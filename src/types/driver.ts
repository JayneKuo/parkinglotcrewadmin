// 司机状态枚举
export enum DriverStatus {
  Active = 'active',
  Inactive = 'inactive',
  Blocked = 'blocked'
}

// 会员类型枚举
export enum MembershipType {
  None = 'none',
  Regular = 'regular',
  Premium = 'premium',
  VIP = 'vip'
}

// 车辆信息接口
export interface VehicleInfo {
  plateNumber: string
  make: string
  model: string
  year?: number
  color?: string
}

// 停车历史接口
export interface ParkingHistory {
  totalVisits: number
  lastVisit: string
  favoriteLocation: string
}

// 支付信息接口
export interface PaymentInfo {
  balance: number
  autoRecharge: boolean
  paymentMethods?: {
    type: 'card' | 'wallet'
    last4?: string
    expiry?: string
  }[]
}

// 司机信息接口
export interface Driver {
  id: string
  name: string
  phone: string
  email?: string
  licenseNumber: string
  status: DriverStatus
  membershipType: MembershipType
  membershipExpiry?: string
  vehicleInfo: VehicleInfo[]
  parkingHistory: ParkingHistory
  paymentInfo: PaymentInfo
  createdAt: string
  updatedAt: string
}

// 搜索表单接口
export interface DriverSearchForm {
  keyword: string
  status: DriverStatus | ''
  membershipType: MembershipType | ''
} 