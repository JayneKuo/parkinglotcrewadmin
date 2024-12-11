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
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'approve', label: 'Approve Request', icon: 'Check' },
    { action: 'modify', label: 'Modify Request', icon: 'Edit' },
    { action: 'reject', label: 'Reject Request', icon: 'Close' }
  ],
  [DockAppointmentStatus.SCHEDULED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'modify', label: 'Modify Appointment', icon: 'Edit' },
    { action: 'cancel', label: 'Cancel Appointment', icon: 'Close' },
    { action: 'monitor-checkin', label: 'Monitor Check-In', icon: 'Timer' }
  ],
  [DockAppointmentStatus.ARRIVED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'assign-dock', label: 'Assign Dock', icon: 'Location' },
    { action: 'start-loading', label: 'Start Unloading/Loading', icon: 'Van' }
  ],
  [DockAppointmentStatus.IN_PROGRESS]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'monitor-progress', label: 'Monitor Progress', icon: 'Timer' },
    { action: 'complete-loading', label: 'Mark as Loading Completed', icon: 'Check' }
  ],
  [DockAppointmentStatus.LOADING_COMPLETED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'verify-bill', label: 'Verify Bill', icon: 'Document' },
    { action: 'await-payment', label: 'Await Payment', icon: 'Timer' },
    { action: 'mark-unpaid', label: 'Mark as Payment Pending', icon: 'Money' }
  ],
  [DockAppointmentStatus.PAYMENT_PENDING]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'send-reminder', label: 'Send Payment Reminder', icon: 'Message' },
    { action: 'mark-paid', label: 'Mark as Paid', icon: 'Check' }
  ],
  [DockAppointmentStatus.COMPLETED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'confirm-departure', label: 'Confirm Departure', icon: 'Right' },
    { action: 'close-order', label: 'Close Order', icon: 'CircleCheck' }
  ],
  [DockAppointmentStatus.CANCELLED]: [
    { action: 'view', label: 'View Details', icon: 'View' },
    { action: 'record-reason', label: 'Record Cancellation Reason', icon: 'Edit' },
    { action: 'release-resources', label: 'Release Resources', icon: 'Delete' }
  ]
} as const

// 状态显示配置
export const STATUS_CONFIG = {
  [DockAppointmentStatus.REQUESTED]: {
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
  [DockAppointmentStatus.IN_PROGRESS]: {
    label: 'Loading',
    type: 'warning',
    color: '#F56C6C'
  },
  [DockAppointmentStatus.LOADING_COMPLETED]: {
    label: 'Loaded',
    type: 'success',
    color: '#67C23A'
  },
  [DockAppointmentStatus.PAYMENT_PENDING]: {
    label: 'Unpaid',
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