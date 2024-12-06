export interface Order {
  id: string
  orderNo: string
  plateNumber: string
  parkingLot: string
  entryTime: string
  exitTime: string | null
  duration: string
  amount: number
  status: 'unpaid' | 'paid' | 'cancelled'
  billingScheme: string
  payTime?: string
  payMethod?: 'cash' | 'wechat' | 'alipay'
}

export interface ParkingLot {
  id: string
  name: string
}

export interface SearchForm {
  orderNo: string
  plateNumber: string
  parkingLotId: string
  status: string
  timeRange: [Date, Date] | []
}