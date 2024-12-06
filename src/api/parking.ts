import type { ParkingLot } from '@/types/parking'
import { ParkingLotStatus } from '@/types/parking'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟数据
const mockParkingLots: ParkingLot[] = [
  {
    id: '1',
    name: 'Main Parking Lot',
    address: '123 Main Street',
    status: ParkingLotStatus.Active,
    capacity: 200,
    availableSpaces: 150,
    totalSpaces: 200,
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    operatingHours: {
      open: '06:00',
      close: '23:00'
    }
  },
  {
    id: '2',
    name: 'West Wing Parking',
    address: '456 West Avenue',
    status: ParkingLotStatus.Active,
    capacity: 150,
    availableSpaces: 100,
    totalSpaces: 150,
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    operatingHours: {
      open: '00:00',
      close: '24:00'
    }
  }
]

// 获取停车场列表
export const getParkingLots = async (): Promise<ParkingLot[]> => {
  await delay(300)
  return mockParkingLots
}

// 获取单个停车场
export const getParkingLot = async (id: string): Promise<ParkingLot | undefined> => {
  await delay(300)
  return mockParkingLots.find(lot => lot.id === id)
} 