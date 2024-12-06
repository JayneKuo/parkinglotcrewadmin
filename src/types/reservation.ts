export enum ReservationStatus {
  /** 订单待支付 */
  Pending = 0,
  
  /** 待使用 - 支付成功后等待进场 */
  AwaitingUse = 1,
  
  /** 使用中 - 已进场 */
  InUse = 2,
  
  /** 已完成 - 正常完成或超时完成 */
  Used = 3,
  
  /** 订单已取消 */
  Cancelled = 4,
  
  /** 订单已退款 */
  Refunded = 5,
  
  /** 订单已过期 - 未按时进场 */
  Expired = 6,
  
  /** 支付失败 */
  PaymentFailed = 7,
  
  /** 退款失败 */
  RefundFailed = 8,
  
  /** 申请退款 */
  RefundRequested = 9,
  
  /** 退款处理中 */
  RefundInProcess = 10,

  /** 超时未离场 */
  Overdue = 11
}

// 状态显示文本
export const statusMap: Record<ReservationStatus, string> = {
  [ReservationStatus.Pending]: 'Pending Payment',
  [ReservationStatus.AwaitingUse]: 'Ready to Use',
  [ReservationStatus.InUse]: 'In Use',
  [ReservationStatus.Used]: 'Used',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.Refunded]: 'Refunded',
  [ReservationStatus.Expired]: 'Expired',
  [ReservationStatus.PaymentFailed]: 'Payment Failed',
  [ReservationStatus.RefundFailed]: 'Refund Failed',
  [ReservationStatus.RefundRequested]: 'Refund Requested',
  [ReservationStatus.RefundInProcess]: 'Processing Refund',
  [ReservationStatus.Overdue]: 'Overdue'
}

// 状态对应的操作按钮
export const getActions = (status: ReservationStatus): string[] => {
  switch (status) {
    case ReservationStatus.Pending:
      return ['confirm_payment', 'cancel', 'view'] // 确认支付、取消、查看
    case ReservationStatus.PaymentFailed:
      return ['retry_payment', 'cancel', 'view'] // 重试支付、取消、查看
    case ReservationStatus.AwaitingUse:
      return ['check_in', 'cancel', 'refund', 'view'] // 进场、取消、退款、查看
    case ReservationStatus.InUse:
      return ['check_out', 'view'] // 离场、查看
    case ReservationStatus.Overdue:
      return ['check_out', 'add_penalty', 'view'] // 离场(含罚金)、查看
    case ReservationStatus.Used:
      return ['refund', 'view'] // 退款、查看
    case ReservationStatus.RefundRequested:
    case ReservationStatus.RefundInProcess:
      return ['view'] // 只能查看
    case ReservationStatus.RefundFailed:
      return ['retry_refund', 'view'] // 重试退款、查看
    case ReservationStatus.Cancelled:
    case ReservationStatus.Refunded:
    case ReservationStatus.Expired:
      return ['view'] // 能查看
    default:
      return ['view']
  }
}

// 状态标签类型
export const getStatusType = (status: ReservationStatus): string => {
  const types: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'warning', // 黄色警告
    [ReservationStatus.AwaitingUse]: 'success', // 绿色正常
    [ReservationStatus.InUse]: 'primary', // 蓝色进行中
    [ReservationStatus.Used]: 'success', // 绿色完成
    [ReservationStatus.Cancelled]: 'info', // 灰色取消
    [ReservationStatus.Refunded]: 'info', // 灰色退款
    [ReservationStatus.Expired]: 'danger', // 红色过期
    [ReservationStatus.PaymentFailed]: 'danger', // 红色支付失败
    [ReservationStatus.RefundFailed]: 'danger', // 红色退款失败
    [ReservationStatus.RefundRequested]: 'warning', // 黄色申请退款
    [ReservationStatus.RefundInProcess]: 'warning', // 黄色退款处理中
    [ReservationStatus.Overdue]: 'danger' // 红色超时
  }
  return types[status] || 'info'
}

export interface Reservation {
  id: string
  orderNo: string
  customerName: string
  phone: string
  email: string
  plateNo: string
  parkingLot: string
  spaceType: 'standard' | 'large' | 'valet'
  spaceNo?: string
  startTime: string
  endTime: string
  duration: number
  amount: number
  status: ReservationStatus
  createdAt: string
  updatedAt: string
  
  // 支付相关
  paymentMethod?: string
  paymentTime?: string
  transactionId?: string
  
  // 费用明细
  parkingFee?: number
  serviceFee?: number
  tax?: number
  overdueFee?: number
  
  // 进出场相关
  checkInTime?: string
  checkOutTime?: string
  overdueMinutes?: number
  
  // 退款相关
  refundAmount?: number
  refundTime?: string
  refundReason?: string
  refundTransactionId?: string
  refundMethod?: string
  refundStatus?: string
  
  // 其他
  notes?: string
  zoneName?: string  // 区域名称
}

export interface ReservationSearchForm {
  orderNo?: string
  customerName?: string
  phone?: string
  parkingLot?: string
  status?: ReservationStatus | ''
  dateRange?: [Date, Date] | null
  spaceType?: string
}