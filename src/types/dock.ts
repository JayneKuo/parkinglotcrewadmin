// 预约状态枚举
export enum DockAppointmentStatus {
  REQUESTED = 'requested',
  SCHEDULED = 'scheduled',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  LOADING_COMPLETED = 'loading_completed',
  PAYMENT_PENDING = 'payment_pending',
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
  [DockAppointmentStatus.REQUESTED]: [
    { action: 'approve', label: 'Approve Request', icon: 'Check' },
    { action: 'modify', label: 'Modify Request', icon: 'Edit' },
    { action: 'reject', label: 'Reject Request', icon: 'Close' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.SCHEDULED]: [
    { action: 'modify', label: 'Modify Appointment', icon: 'Edit' },
    { action: 'cancel', label: 'Cancel Appointment', icon: 'Delete' },
    { action: 'check-in', label: 'Check In', icon: 'Timer' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.ARRIVED]: [
    { action: 'assign-dock', label: 'Assign Dock', icon: 'Location' },
    { action: 'start-loading', label: 'Start Loading', icon: 'Timer' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.IN_PROGRESS]: [
    { action: 'monitor-progress', label: 'Monitor Progress', icon: 'Loading' },
    { action: 'complete-loading', label: 'Mark as Loading Completed', icon: 'Check' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.LOADING_COMPLETED]: [
    { action: 'verify-bill', label: 'Verify Bill', icon: 'Document' },
    { action: 'mark-unpaid', label: 'Mark as Payment Pending', icon: 'Money' },
    { action: 'await-payment', label: 'Await Payment', icon: 'Timer' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.PAYMENT_PENDING]: [
    { action: 'send-reminder', label: 'Send Payment Reminder', icon: 'Bell' },
    { action: 'mark-paid', label: 'Mark as Paid', icon: 'Check' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.COMPLETED]: [
    { action: 'confirm-departure', label: 'Confirm Departure', icon: 'Van' },
    { action: 'close-order', label: 'Close Order', icon: 'Finished' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ],
  [DockAppointmentStatus.CANCELLED]: [
    { action: 'record-reason', label: 'Record Cancellation Reason', icon: 'Document' },
    { action: 'release-resources', label: 'Release Resources', icon: 'Delete' },
    { action: 'view', label: 'View Details', icon: 'View' }
  ]
} as const

// 状态显示配置
export const STATUS_CONFIG = {
  [DockAppointmentStatus.REQUESTED]: {
    label: 'Requested',
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
  [DockAppointmentStatus.IN_PROGRESS]: {
    label: 'In Progress',
    type: 'warning',
    color: '#F56C6C'
  },
  [DockAppointmentStatus.LOADING_COMPLETED]: {
    label: 'Loading Completed',
    type: 'success',
    color: '#67C23A'
  },
  [DockAppointmentStatus.PAYMENT_PENDING]: {
    label: 'Payment Pending',
    type: 'danger',
    color: '#F56C6C'
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