export enum ValetStatus {
  Reserved = 'reserved',     // 已预约
  CheckedIn = 'checkedIn',   // 已到达
  Pending = 'pending',       // 等待泊车
  Parked = 'parked',        // 已泊车
  Requested = 'requested',   // 请求取车
  OnTheWay = 'onTheWay',    // 取车中
  Ready = 'ready',          // 车辆就绪
  Paid = 'paid',            // 已支付
  Closed = 'closed'         // 已完成
}

export enum ValetSource {
  Online = 'online',     // 线上预定
  Offline = 'offline'    // 线下预定
}

export interface ValetOrder {
  id: string
  orderNo: string
  customerName: string
  phone: string
  plateNo: string
  carModel: string
  carColor: string
  status: ValetStatus
  source: ValetSource
  parkingLot: string
  zoneName?: string
  spaceNo?: string
  spaceType?: string
  rateType?: string
  rate?: number
  driverId?: string
  driverName?: string
  driverPhone?: string
  driverStatus?: string
  driverAssignedAt?: string
  createdAt: string
  checkedInAt?: string
  parkedAt?: string
  requestedAt?: string
  readyAt?: string
  paidAt?: string
  closedAt?: string
  parkingFee?: number
  serviceFee?: number
  tax?: number
  amount: number
  paymentMethod?: string
  transactionId?: string
  photos?: Record<string, string>
  notes?: string
  paymentStatus: 'unpaid' | 'paid' // 支付状态
}

export interface ValetDriver {
  id: string
  name: string
  phone: string
  status: 'available' | 'busy' | 'offline'
  rating: number
  totalOrders: number
}

export interface ValetSearchForm {
  keyword?: string
  status?: ValetStatus
  dateRange?: [Date, Date]
  parkingLot?: string
}

// 模拟数据源
export const mockValetOrders: Record<string, ValetOrder> = {
  // 线上预约 - Reserved
  'online-reserved': {
    id: 'online-reserved',
    orderNo: 'V20240215001',
    customerName: 'John Doe',
    phone: '(123) 456-7890',
    plateNo: 'ABC123',
    carModel: 'Tesla Model 3',
    carColor: 'White',
    status: ValetStatus.Reserved,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: 'A101',
    rateType: 'hourly',
    rate: 15,
    createdAt: '2024-02-15T10:00:00Z',
    parkingFee: 15.00,
    serviceFee: 10.00,
    tax: 5.00,
    amount: 30.00,
    paymentStatus: 'unpaid'
  },

  // 线上预约 - CheckedIn
  'online-checkedin': {
    id: 'online-checkedin',
    orderNo: 'V20240215002',
    customerName: 'Sarah Wilson',
    phone: '(234) 567-8901',
    plateNo: 'XYZ789',
    carModel: 'BMW X5',
    carColor: 'Black',
    status: ValetStatus.CheckedIn,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: 'B205',
    rateType: 'hourly',
    rate: 20,
    createdAt: '2024-02-15T11:00:00Z',
    checkedInAt: '2024-02-15T11:05:00Z',
    parkingFee: 20.00,
    serviceFee: 15.00,
    tax: 5.00,
    amount: 40.00,
    paymentStatus: 'unpaid'
  },

  // 线上预约 - Pending
  'online-pending': {
    id: 'online-pending',
    orderNo: 'V20240215003',
    customerName: 'Mike Johnson',
    phone: '(345) 678-9012',
    plateNo: 'DEF456',
    carModel: 'Mercedes C300',
    carColor: 'Silver',
    status: ValetStatus.Pending,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: 'C103',
    rateType: 'hourly',
    rate: 15,
    driverId: 'D001',
    driverName: 'Tom Wilson',
    driverPhone: '(111) 222-3333',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T12:10:00Z',
    createdAt: '2024-02-15T12:00:00Z',
    checkedInAt: '2024-02-15T12:05:00Z',
    parkingFee: 15.00,
    serviceFee: 20.00,
    tax: 5.00,
    amount: 40.00,
    paymentStatus: 'unpaid',
    photos: {
      front: '/mock/photos/front.jpg',
      rear: '/mock/photos/rear.jpg',
      left: '/mock/photos/left.jpg',
      right: '/mock/photos/right.jpg',
      license: '/mock/photos/license.jpg'
    }
  },

  // 线上预约 - Parked
  'online-parked': {
    id: 'online-parked',
    orderNo: 'V20240215004',
    customerName: 'David Lee',
    phone: '(456) 789-0123',
    plateNo: 'GHI789',
    carModel: 'Audi Q5',
    carColor: 'Blue',
    status: ValetStatus.Parked,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'D',
    spaceNo: 'D108',
    rateType: 'hourly',
    rate: 15,
    driverId: 'D002',
    driverName: 'Jack Brown',
    driverPhone: '(222) 333-4444',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T13:10:00Z',
    createdAt: '2024-02-15T13:00:00Z',
    checkedInAt: '2024-02-15T13:05:00Z',
    parkedAt: '2024-02-15T13:15:00Z',
    parkingFee: 15.00,
    serviceFee: 20.00,
    tax: 5.00,
    amount: 40.00,
    paymentStatus: 'unpaid',
    photos: {
      front: '/mock/photos/front.jpg',
      rear: '/mock/photos/rear.jpg',
      left: '/mock/photos/left.jpg',
      right: '/mock/photos/right.jpg',
      license: '/mock/photos/license.jpg',
      parked_space: '/mock/photos/parked_space.jpg',
      parked_full: '/mock/photos/parked_full.jpg'
    }
  },

  // 线上预约 - Requested
  'online-requested': {
    id: 'online-requested',
    orderNo: 'V20240215005',
    customerName: 'Emma Brown',
    phone: '(567) 890-1234',
    plateNo: 'JKL012',
    carModel: 'Lexus RX',
    carColor: 'Red',
    status: ValetStatus.Requested,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'E',
    spaceNo: 'E110',
    rateType: 'hourly',
    rate: 15,
    driverId: 'D003',
    driverName: 'David Lee',
    driverPhone: '(333) 444-5555',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T14:10:00Z',
    createdAt: '2024-02-15T14:00:00Z',
    checkedInAt: '2024-02-15T14:05:00Z',
    parkedAt: '2024-02-15T14:15:00Z',
    requestedAt: '2024-02-15T16:00:00Z',
    parkingFee: 30.00,
    serviceFee: 20.00,
    tax: 5.00,
    amount: 55.00,
    paymentStatus: 'unpaid',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg',
      parked_front: 'url/to/parked_front.jpg',
      parked_full: 'url/to/parked_full.jpg'
    }
  },

  // 线上预约 - OnTheWay
  'online-ontheway': {
    id: 'online-ontheway',
    orderNo: 'V20240215006',
    customerName: 'Lisa Davis',
    phone: '(678) 901-2345',
    plateNo: 'MNO345',
    carModel: 'Porsche Cayenne',
    carColor: 'Red',
    status: ValetStatus.OnTheWay,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'F',
    spaceNo: 'F115',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D004',
    driverName: 'Michael Chen',
    driverPhone: '(444) 555-6666',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T15:10:00Z',
    createdAt: '2024-02-15T15:00:00Z',
    checkedInAt: '2024-02-15T15:05:00Z',
    parkedAt: '2024-02-15T15:15:00Z',
    requestedAt: '2024-02-15T17:00:00Z',
    parkingFee: 40.00,
    serviceFee: 25.00,
    tax: 6.50,
    amount: 71.50,
    paymentStatus: 'unpaid',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg',
      parked_front: 'url/to/parked_front.jpg',
      parked_full: 'url/to/parked_full.jpg'
    }
  },

  // 线上预约 - Ready
  'online-ready': {
    id: 'online-ready',
    orderNo: 'V20240215007',
    customerName: 'David Miller',
    phone: '(789) 012-3456',
    plateNo: 'PQR678',
    carModel: 'Range Rover',
    carColor: 'Green',
    status: ValetStatus.Ready,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'G',
    spaceNo: 'G120',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D005',
    driverName: 'William Taylor',
    driverPhone: '(555) 666-7777',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T16:10:00Z',
    createdAt: '2024-02-15T16:00:00Z',
    checkedInAt: '2024-02-15T16:05:00Z',
    parkedAt: '2024-02-15T16:15:00Z',
    requestedAt: '2024-02-15T18:00:00Z',
    readyAt: '2024-02-15T18:15:00Z',
    parkingFee: 45.00,
    serviceFee: 25.00,
    tax: 7.00,
    amount: 77.00,
    paymentStatus: 'unpaid',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg',
      parked_front: 'url/to/parked_front.jpg',
      parked_full: 'url/to/parked_full.jpg'
    }
  },

  // 线上预约 - Paid
  'online-paid': {
    id: 'online-paid',
    orderNo: 'V20240215008',
    customerName: 'Emma Wilson',
    phone: '(890) 123-4567',
    plateNo: 'STU901',
    carModel: 'Volvo XC90',
    carColor: 'White',
    status: ValetStatus.Paid,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'H',
    spaceNo: 'H125',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D006',
    driverName: 'James Anderson',
    driverPhone: '(666) 777-8888',
    driverStatus: 'available',
    driverAssignedAt: '2024-02-15T17:10:00Z',
    createdAt: '2024-02-15T17:00:00Z',
    checkedInAt: '2024-02-15T17:05:00Z',
    parkedAt: '2024-02-15T17:15:00Z',
    requestedAt: '2024-02-15T19:00:00Z',
    readyAt: '2024-02-15T19:15:00Z',
    paidAt: '2024-02-15T19:30:00Z',
    parkingFee: 50.00,
    serviceFee: 25.00,
    tax: 7.50,
    amount: 82.50,
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN123456789',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg',
      parked_front: 'url/to/parked_front.jpg',
      parked_full: 'url/to/parked_full.jpg'
    }
  },

  // 线上预约 - Closed
  'online-closed': {
    id: 'online-closed',
    orderNo: 'V20240215009',
    customerName: 'James Lee',
    phone: '(901) 234-5678',
    plateNo: 'VWX234',
    carModel: 'Land Rover',
    carColor: 'Black',
    status: ValetStatus.Closed,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'I',
    spaceNo: 'I130',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D007',
    driverName: 'Oliver Brown',
    driverPhone: '(777) 888-9999',
    driverStatus: 'available',
    driverAssignedAt: '2024-02-15T18:10:00Z',
    createdAt: '2024-02-15T18:00:00Z',
    checkedInAt: '2024-02-15T18:05:00Z',
    parkedAt: '2024-02-15T18:15:00Z',
    requestedAt: '2024-02-15T20:00:00Z',
    readyAt: '2024-02-15T20:15:00Z',
    paidAt: '2024-02-15T20:30:00Z',
    closedAt: '2024-02-15T20:45:00Z',
    parkingFee: 55.00,
    serviceFee: 25.00,
    tax: 8.00,
    amount: 88.00,
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN234567890',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg',
      parked_front: 'url/to/parked_front.jpg',
      parked_full: 'url/to/parked_full.jpg'
    }
  },

  // 线下到店 - Pending (直接创建为 Pending 状态)
  'offline-pending': {
    id: 'offline-pending',
    orderNo: 'V20240215010',
    customerName: 'Alex Thompson',
    phone: '(012) 345-6789',
    plateNo: 'YZA567',
    carModel: 'Honda CR-V',
    carColor: 'Gray',
    status: ValetStatus.Pending,
    source: ValetSource.Offline,
    parkingLot: 'Downtown Parking',
    rateType: 'hourly',
    rate: 15,
    driverId: 'D008',
    driverName: 'Ryan Wilson',
    driverPhone: '(888) 999-0000',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T21:00:00Z',
    createdAt: '2024-02-15T21:00:00Z',
    checkedInAt: '2024-02-15T21:00:00Z',
    parkingFee: 15.00,
    serviceFee: 10.00,
    tax: 2.50,
    amount: 27.50,
    paymentStatus: 'unpaid',
    photos: {
      front: 'url/to/front.jpg',
      rear: 'url/to/rear.jpg',
      left: 'url/to/left.jpg',
      right: 'url/to/right.jpg',
      license: 'url/to/license.jpg'
    }
  },

  // 已泊车 - 未支付
  'parked-unpaid': {
    id: 'parked-unpaid',
    orderNo: 'V20240215011',
    customerName: 'Robert Chen',
    phone: '(123) 456-7890',
    plateNo: 'BCD123',
    carModel: 'BMW 5 Series',
    carColor: 'Black',
    status: ValetStatus.Parked,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'D',
    spaceNo: 'D108',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D002',
    driverName: 'Jack Brown',
    driverPhone: '(222) 333-4444',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T13:10:00Z',
    createdAt: '2024-02-15T13:00:00Z',
    checkedInAt: '2024-02-15T13:05:00Z',
    parkedAt: '2024-02-15T13:15:00Z',
    parkingFee: 40.00,    // 2小时停车费
    serviceFee: 20.00,    // 服务费
    tax: 6.00,            // 税费
    amount: 66.00,        // 总金额
    paymentStatus: 'unpaid',
    photos: {
      front: '/mock/photos/front.jpg',
      rear: '/mock/photos/rear.jpg',
      left: '/mock/photos/left.jpg',
      right: '/mock/photos/right.jpg',
      license: '/mock/photos/license.jpg',
      parked_space: '/mock/photos/parked_space.jpg',
      parked_full: '/mock/photos/parked_full.jpg'
    }
  },

  // 已泊车 - 已支付
  'parked-paid': {
    id: 'parked-paid',
    orderNo: 'V20240215012',
    customerName: 'Jennifer Lee',
    phone: '(234) 567-8901',
    plateNo: 'CDE234',
    carModel: 'Mercedes E-Class',
    carColor: 'Silver',
    status: ValetStatus.Parked,
    source: ValetSource.Online,
    parkingLot: 'Downtown Parking',
    zoneName: 'E',
    spaceNo: 'E110',
    rateType: 'hourly',
    rate: 20,
    driverId: 'D003',
    driverName: 'David Lee',
    driverPhone: '(333) 444-5555',
    driverStatus: 'busy',
    driverAssignedAt: '2024-02-15T14:10:00Z',
    createdAt: '2024-02-15T14:00:00Z',
    checkedInAt: '2024-02-15T14:05:00Z',
    parkedAt: '2024-02-15T14:15:00Z',
    parkingFee: 60.00,    // 3小时停车费
    serviceFee: 25.00,    // 服务费
    tax: 8.50,            // 税费
    amount: 93.50,        // 总金额
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN345678901',
    photos: {
      front: '/mock/photos/front.jpg',
      rear: '/mock/photos/rear.jpg',
      left: '/mock/photos/left.jpg',
      right: '/mock/photos/right.jpg',
      license: '/mock/photos/license.jpg',
      parked_space: '/mock/photos/parked_space.jpg',
      parked_full: '/mock/photos/parked_full.jpg'
    }
  }
}