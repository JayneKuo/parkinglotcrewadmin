export type RFIDStatus = 'active' | 'inactive' | 'lost'

export interface RFID {
  id: string
  tagId: string
  vehiclePlate: string
  driverName: string
  status: RFIDStatus
  bindTime: string
  expireTime: string
  lastUsed?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface RFIDSearchForm {
  keyword: string
  status: RFIDStatus | ''
} 