export interface Plan {
  id: string
  name: string
  isTrial?: boolean
  trialDays?: number
  price?: number
  billingCycle?: 'monthly' | 'quarterly' | 'yearly'
  yearlyDiscount?: number
  parkingLotLimit: number
  staffLimit: number
  appFeatures: string[]
  description: string
  status: number
  autoRenew: boolean
}

export interface PlanFeature {
  key: string
  name: string
  description: string
}

export const APP_FEATURES: PlanFeature[] = [
  {
    key: 'qrCode',
    name: '扫码核销',
    description: '支持通过APP扫码进行车辆核销'
  },
  {
    key: 'payment',
    name: '在线支付',
    description: '支持微信、支付宝等在线支付方式'
  },
  {
    key: 'monthlyCard',
    name: '月卡管理',
    description: '支持月卡用户管理和续费'
  },
  {
    key: 'report',
    name: '报表查看',
    description: '支持查看经营数据和统计报表'
  },
  {
    key: 'notification',
    name: '消息通知',
    description: '支持短信、APP推送等通知服务'
  },
  {
    key: 'api',
    name: 'API接口',
    description: '提供API接口进行系统集成'
  }
]