// 预约状态枚举
export enum DockAppointmentStatus {
  REQUEST = 'request',
  SCHEDULED = 'scheduled',
  ARRIVED = 'arrived',
  LOADING = 'loading',
  LOADED = 'loaded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 预约类型
export interface DockAppointment {
  id: string
  appointmentId: string
  // 基本信息
  carrier: string
  driverName: string
  driverPhone: string
  vehiclePlate: string
  // 位置信息
  parkingLotName: string
  dockNumbers: string[]
  parkingSpots: number
  // 预约信息
  type: 'Inbound' | 'Outbound'
  startDate: string
  startTime: string
  endTime: string
  estimatedDuration: number
  // 货物信息
  containerNumber?: string
  poNumber?: string
  cargoType?: string
  totalWeight?: number
  palletCount?: number
  // 状态信息
  status: DockAppointmentStatus
  dwellTime: number
  billingType: 'hourly' | 'fixed' | 'daily'
  // 支付信息
  paymentStatus?: 'unpaid' | 'paid'
  paymentAmount?: number
  // 取消信息
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
}

// 状态操作映射
export const STATUS_ACTIONS = {
  [DockAppointmentStatus.REQUEST]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'approve', label: 'Approve Request', icon: 'Check' },
    { action: 'modify', label: 'Modify Request', icon: 'Edit' },
    { action: 'reject', label: 'Reject Request', icon: 'Close' }
  ],
  [DockAppointmentStatus.SCHEDULED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'modify', label: 'Modify Appointment', icon: 'Edit' },
    { action: 'cancel', label: 'Cancel Appointment', icon: 'Close' }
  ],
  [DockAppointmentStatus.ARRIVED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'assign-dock', label: 'Assign Dock', icon: 'Location' },
    { action: 'start-loading', label: 'Start Loading', icon: 'Van' }
  ],
  [DockAppointmentStatus.LOADING]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'monitor-progress', label: 'Monitor Progress', icon: 'Timer' },
    { action: 'complete-loading', label: 'Complete Loading', icon: 'Check' }
  ],
  [DockAppointmentStatus.LOADED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'send-reminder', label: 'Send Payment Reminder', icon: 'Message' },
    { action: 'mark-paid', label: 'Mark as Paid', icon: 'Check' }
  ],
  [DockAppointmentStatus.COMPLETED]: [
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.CANCELLED]: [
    { action: 'view', label: 'View Details', icon: 'View' }
  ]
} as const

// 状态显示配置
export const STATUS_CONFIG = {
  [DockAppointmentStatus.REQUEST]: {
    label: 'Request',
    type: 'info',
    color: '#909399'
  },
  [DockAppointmentStatus.SCHEDULED]: {
    label: 'Scheduled',
    type: 'primary',
    color: '#409EFF'
  },
  [DockAppointmentStatus.ARRIVED]: {
    label: 'Arrived',
    type: 'warning',
    color: '#E6A23C'
  },
  [DockAppointmentStatus.LOADING]: {
    label: 'Loading',
    type: 'warning',
    color: '#F56C6C'
  },
  [DockAppointmentStatus.LOADED]: {
    label: 'Loaded',
    type: 'success',
    color: '#67C23A'
  },
  [DockAppointmentStatus.COMPLETED]: {
    label: 'Completed',
    type: 'success',
    color: '#67C23A'
  },
  [DockAppointmentStatus.CANCELLED]: {
    label: 'Cancelled',
    type: 'info',
    color: '#909399'
  }
} as const 