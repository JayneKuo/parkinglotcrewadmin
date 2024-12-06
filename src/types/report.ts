export interface ReportData {
  date: string
  totalOrders: number
  totalAmount: number
  avgParkingTime: string
  peakHourFlow: number
  turnoverRate: number
}

export interface OverviewCard {
  title: string
  value: string
  trend?: number
}

export interface FilterForm {
  parkingLotId: string
  timeRange: [string, string] | []
}

export interface ChartData {
  xAxis: string[]
  series: number[]
}