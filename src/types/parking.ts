import type { LatLng } from '@/types/map'

export enum ParkingLotStatus {
  Active = 'active',
  Inactive = 'inactive',
  Maintenance = 'maintenance'
}

export interface ParkingLot {
  id: string
  name: string
  address: string
  status: ParkingLotStatus
  capacity: number
  availableSpaces: number
  totalSpaces: number
  city: string
  state: string
  zipCode: string
  currentOccupancy?: number
  operatingHours?: {
    open: string
    close: string
  }
}

export interface PriceRule {
  type: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
  duration: number
  amount: number
}

export type ParkingStatus = 'active' | 'maintenance' | 'full' | 'closed'

export interface ParkingSearchForm {
  keyword: string
  state: string
  city: string
  status: ParkingStatus | ''
}

export interface ParkingSpace {
  id?: string
  number: string
  type: 'car' | 'truck'
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
  business: string[]
  currentVehicle?: {
    plateNumber: string
    entryTime: string
  }
}

export interface ParkingZone {
  id: string
  name: string
  floor: string
  type: 'standard' | 'compact' | 'handicap' | 'ev'
  hourlyRate: number
  totalSpots: number
  spots: ParkingSpot[]
}

export interface BatchSpaceForm {
  prefix: string
  start: number
  end: number
  type: 'car' | 'truck'
  business: string[]
}

export interface State {
  value: string
  label: string
}

export interface City {
  value: string
  label: string
  zipCodes: string[]
}

export interface ParkingFacility {
  id: string
  name: string
  icon: string
  description: string
}

export interface ParkingSpot {
  id: string
  spotNo: string
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'locked' | 'closed'
  vehicleInfo?: {
    plateNo: string
    brand?: string
    color?: string
    enterTime: string
    entryImage?: string
    exitImage?: string
    operator?: string
    driverName?: string
    phone?: string
  }
  maintenanceInfo?: {
    reason: string
    startTime: string
    endTime?: string
    operator?: string
  }
  statusHistory?: {
    status: string
    time: string
    operator: string
    reason?: string
  }[]
  lockInfo?: {
    reason: string
    lockTime: string
    plannedUnlockTime?: string
    operator: string
  }
}

export interface ParkingLayout {
  id: string
  name: string
  zones: ParkingZone[]
}