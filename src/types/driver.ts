// 司机状态
export enum DriverStatus {
  Active = 'active',      // 活跃用户
  Inactive = 'inactive',  // 不活跃
  Blocked = 'blocked'     // 黑名单
}

// 会员类型
export enum MembershipType {
  None = 'none',          // 非会员
  Regular = 'regular',    // 普通会员
  Premium = 'premium',    // 高级会员
  Corporate = 'corporate' // 企业用户
}

// 司机信息接口
export interface Driver {
  id: string
  name: string
  phone: string
  email?: string
  licenseNumber: string   // 驾驶证号
  status: DriverStatus
  membershipType: MembershipType
  membershipExpiry?: string
  vehicleInfo: {
    plateNumber: string   // 车牌号
    make: string         // 品牌
    model: string        // 型号
    color: string        // 颜色
    type: string         // 车型
  }[]
  parkingHistory: {
    totalVisits: number
    lastVisit: string
    favoriteLocation: string
  }
  paymentInfo: {
    preferredMethod?: string
    balance: number
    autoRecharge: boolean
  }
  notes?: string
  createdAt: string
  updatedAt: string
} 