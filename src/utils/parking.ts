// Generate space number with prefix and padding
export const generateSpaceNumber = (prefix: string, index: number, padLength = 3): string => {
  return `${prefix}${String(index).padStart(padLength, '0')}`
}

// Increment space number
export const incrementSpaceNumber = (currentNumber: string): string => {
  const prefix = currentNumber.replace(/\d+$/, '')
  const number = parseInt(currentNumber.match(/\d+$/)?.[0] || '0')
  return generateSpaceNumber(prefix, number + 1)
}

// Validate space number format
export const validateSpaceNumber = (number: string): boolean => {
  return /^[A-Za-z0-9\u4e00-\u9fa5-]+\d{3,}$/.test(number)
}

// Check space capacity
export const checkSpaceCapacity = (
  currentCount: number,
  addCount: number,
  capacity: number
): boolean => {
  return (currentCount + addCount) <= capacity
}

// Generate default zone name (A, B, C, ...)
export const generateDefaultZoneName = (index: number): string => {
  return String.fromCharCode(65 + index)
}

// Generate default space number (A-001, A-002, ...)
export const generateDefaultSpaceNumber = (zoneName: string, index: number): string => {
  return generateSpaceNumber(zoneName, index)
}

// 简化配置接口
export interface SpotAvailabilityConfig {
  warningThreshold: number // 预警阈值(小时),小于这个时间显示警告
}

const DEFAULT_CONFIG: SpotAvailabilityConfig = {
  warningThreshold: 2 // 默认2小时内显示警告
}

// 计算可用时间(返回小时数和分钟数)
const calculateAvailableTime = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime()
  const totalMinutes = Math.floor(diff / (1000 * 60))
  
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes
  }
}

export const checkSpotAvailability = (
  spot: ParkingSpot,
  config: Partial<SpotAvailabilityConfig> = {}
) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  const now = new Date()

  // 获取未来的预约
  const upcomingReservations = (spot.reservations || [])
    .filter(r => {
      const reservationTime = new Date(r.startTime)
      return r.status === ReservationStatus.Upcoming && reservationTime > now
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // 基础返回信息
  const result = {
    hasUpcomingReservation: upcomingReservations.length > 0,
    currentStatus: spot.status,
    nextReservation: null as any,
    availableTime: null as any
  }

  // 如果有未来预约
  if (upcomingReservations.length > 0) {
    const nextReservation = upcomingReservations[0]
    const reservationStart = new Date(nextReservation.startTime)
    const availableTime = calculateAvailableTime(now, reservationStart)
    
    result.nextReservation = {
      startTime: nextReservation.startTime,
      reservedFor: nextReservation.reservedFor,
      timeUntil: formatTimeUntil(reservationStart)
    }
    
    result.availableTime = {
      hours: availableTime.hours,
      minutes: availableTime.minutes,
      formatted: `${availableTime.hours}h ${availableTime.minutes}m`,
      isLimited: availableTime.totalMinutes <= (fullConfig.warningThreshold * 60)
    }
  }

  return result
}

// 格式化时间间隔
const formatTimeUntil = (date: Date): string => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} days`
  }
  
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  }
  
  return `in ${minutes}m`
}