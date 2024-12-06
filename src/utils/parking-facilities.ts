import type { ParkingFacility } from '@/types/parking'

export const defaultFacilities: ParkingFacility[] = [
  {
    id: 'camera',
    name: '监控摄像',
    icon: 'VideoCamera',
    description: '24小时视频监控系统'
  },
  {
    id: 'lighting',
    name: '照明系统',
    icon: 'Light',
    description: 'LED照明设备'
  },
  {
    id: 'elevator',
    name: '电梯',
    icon: 'UploadFilled',
    description: '客用电梯'
  },
  {
    id: 'charging',
    name: '充电桩',
    icon: 'Lightning',
    description: '电动车充电设施'
  },
  {
    id: 'washroom',
    name: '洗手间',
    icon: 'House',
    description: '公共卫生间'
  },
  {
    id: 'payment',
    name: '自助缴费',
    icon: 'Money',
    description: '自助缴费终端'
  },
  {
    id: 'wifi',
    name: 'WiFi',
    icon: 'Connection',
    description: '免费无线网络'
  },
  {
    id: 'security',
    name: '安保人员',
    icon: 'User',
    description: '24小时安保值守'
  }
]