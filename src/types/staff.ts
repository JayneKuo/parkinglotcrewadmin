export type StaffRole = 'admin' | 'manager' | 'operator' | 'valet' | 'security'
export type StaffStatus = 'active' | 'inactive' | 'leave' | 'suspended'

export interface Staff {
  id: string
  name: string
  phone: string
  role: StaffRole
  parkingLotId: string
  parkingLotName?: string
  joinDate: string
  status: StaffStatus
  permissions?: string[]
  avatar?: string
  email?: string
  lastLoginTime?: string
  statusHistory?: {
    status: StaffStatus
    time: string
    reason?: string
    operator: string
  }[]
}

export interface StaffForm {
  name: string
  phone: string
  role: string
  parkingLotId: string
  joinDate: string
  status: 'active' | 'inactive'
  password: string
}