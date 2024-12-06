import { Driver, DriverStatus, MembershipType } from '@/types/driver'

// 模拟司机数据
export const mockDrivers: Driver[] = [
  {
    id: 'D001',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    licenseNumber: 'DL123456789',
    status: DriverStatus.Active,
    membershipType: MembershipType.Premium,
    membershipExpiry: '2024-12-31',
    vehicleInfo: [
      {
        plateNumber: 'ABC123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver'
      },
      {
        plateNumber: 'XYZ789',
        make: 'Honda',
        model: 'CR-V',
        year: 2021,
        color: 'Black'
      }
    ],
    parkingHistory: {
      totalVisits: 156,
      lastVisit: '2024-03-15 14:30',
      favoriteLocation: 'Main Entrance'
    },
    paymentInfo: {
      balance: 235.50,
      autoRecharge: true,
      paymentMethods: [
        {
          type: 'card',
          last4: '4567',
          expiry: '12/25'
        }
      ]
    },
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z'
  },
  {
    id: 'D002',
    name: 'Sarah Johnson',
    phone: '(555) 234-5678',
    email: 'sarah.j@email.com',
    licenseNumber: 'DL987654321',
    status: DriverStatus.Active,
    membershipType: MembershipType.VIP,
    membershipExpiry: '2024-12-31',
    vehicleInfo: [
      {
        plateNumber: 'VIP001',
        make: 'Tesla',
        model: 'Model S',
        year: 2023,
        color: 'White'
      }
    ],
    parkingHistory: {
      totalVisits: 89,
      lastVisit: '2024-03-14 09:15',
      favoriteLocation: 'VIP Section'
    },
    paymentInfo: {
      balance: 1000.00,
      autoRecharge: true,
      paymentMethods: [
        {
          type: 'card',
          last4: '8901',
          expiry: '03/26'
        }
      ]
    },
    createdAt: '2023-03-01T10:00:00Z',
    updatedAt: '2024-03-14T09:15:00Z'
  },
  {
    id: 'D003',
    name: 'Mike Wilson',
    phone: '(555) 345-6789',
    licenseNumber: 'DL456789123',
    status: DriverStatus.Inactive,
    membershipType: MembershipType.Regular,
    vehicleInfo: [
      {
        plateNumber: 'REG789',
        make: 'Ford',
        model: 'Focus',
        year: 2019,
        color: 'Blue'
      }
    ],
    parkingHistory: {
      totalVisits: 45,
      lastVisit: '2024-02-28 16:45',
      favoriteLocation: 'South Gate'
    },
    paymentInfo: {
      balance: 15.75,
      autoRecharge: false
    },
    createdAt: '2023-06-15T14:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z'
  },
  {
    id: 'D004',
    name: 'Emily Brown',
    phone: '(555) 456-7890',
    email: 'emily.b@email.com',
    licenseNumber: 'DL789123456',
    status: DriverStatus.Blocked,
    membershipType: MembershipType.None,
    vehicleInfo: [
      {
        plateNumber: 'BLK456',
        make: 'BMW',
        model: '320i',
        year: 2018,
        color: 'Red'
      }
    ],
    parkingHistory: {
      totalVisits: 12,
      lastVisit: '2024-01-15 11:30',
      favoriteLocation: 'East Wing'
    },
    paymentInfo: {
      balance: 0,
      autoRecharge: false
    },
    createdAt: '2023-09-01T09:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z'
  }
]

// 模拟API响应
export const mockDriversResponse = (params: any) => {
  const { keyword, status, membershipType, page = 1, pageSize = 10 } = params

  let filteredDrivers = [...mockDrivers]

  // 关键词搜索
  if (keyword) {
    const searchText = keyword.toLowerCase()
    filteredDrivers = filteredDrivers.filter(driver => 
      driver.name.toLowerCase().includes(searchText) ||
      driver.phone.includes(searchText) ||
      driver.licenseNumber.toLowerCase().includes(searchText) ||
      driver.vehicleInfo.some(v => v.plateNumber.toLowerCase().includes(searchText))
    )
  }

  // 状态筛选
  if (status) {
    filteredDrivers = filteredDrivers.filter(driver => driver.status === status)
  }

  // 会员类型筛选
  if (membershipType) {
    filteredDrivers = filteredDrivers.filter(driver => driver.membershipType === membershipType)
  }

  // 计算分页
  const total = filteredDrivers.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = filteredDrivers.slice(start, end)

  return {
    items,
    total,
    page,
    pageSize
  }
}

// 添加司机
export const mockCreateDriver = (driver: Partial<Driver>): Driver => {
  const newDriver: Driver = {
    id: `D${String(mockDrivers.length + 1).padStart(3, '0')}`,
    status: DriverStatus.Active,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...driver
  } as Driver

  mockDrivers.push(newDriver)
  return newDriver
} 