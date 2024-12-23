export interface DispatchTask {
  id: string
  taskNo: string
  type: 'transfer' | 'maintenance' | 'emergency'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  parkingLot: string
  description: string
  assignee?: string
  createdAt: string
  completedAt?: string
}

export interface DispatchForm {
  type: string
  priority: string
  parkingLotId: string
  description: string
  assigneeId: string
}

export interface ParkingLotStatus {
  id: string
  name: string
  totalSpots: number
  occupiedSpots: number
  availableSpots: number
  maintenanceSpots: number
}

// 车位状态枚举
export enum SpotStatus {
  Available = 'Available',
  Occupied = 'Occupied',
  Reserved = 'Reserved',
  Locked = 'Locked'
}

// 车位信息接口
export interface ParkingSpot {
  id: string
  status: SpotStatus
  vehiclePlate: string
  duration: number
  overtime: number
  isOvertime: boolean
  isPaid?: boolean
  entryTime?: string
  exitTime?: string
  driver?: {
    name: string
    phone: string
  }
  reservationTime?: string
  reservedFor?: string
  notes?: string
  reservations: ReservationHistory[]
  nextReservation?: {
    startTime: string
    endTime: string
    timeUntil: string
    maxAvailableDuration: number
  }
}

// 区域信息接口
export interface ParkingArea {
  id: string
  name: string
  parkingLotId: string
  spots: ParkingSpot[]
}

// 停车场信息接口
export interface ParkingLot {
  id: string
  name: string
  areas: string[]
  address: string
  capacity: number
}

export enum ReservationStatus {
  Upcoming = 'Upcoming',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// 添加预约时长类型
export enum ReservationDurationType {
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year'
}

// 修改预约历史接口
export interface ReservationHistory {
  startTime: string
  endTime: string
  reservedFor: string
  phone: string
  status: ReservationStatus
  durationType: ReservationDurationType
  duration: number // 预约时长(对应durationType的单位)
  notes?: string
}

// 添加可用性配置接口
export interface SpotAvailabilityConfig {
  warningThreshold: number // 预警阈值(0-1之间,表示剩余时间占最小预约时间的比例)
  minReservationTime: {
    [ReservationDurationType.Minute]: number // 最小分钟数
    [ReservationDurationType.Hour]: number   // 最小小时数
    [ReservationDurationType.Day]: number    // 最小天数
    [ReservationDurationType.Week]: number   // 最小周数
    [ReservationDurationType.Month]: number  // 最小月数
    [ReservationDurationType.Year]: number   // 最小年数
  }
}