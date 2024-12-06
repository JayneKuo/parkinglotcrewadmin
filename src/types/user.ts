export interface User {
  id: string
  username: string
  role: 'admin' | 'merchant-admin' | 'merchant-staff'
  merchant?: string
  merchantId?: string
  lastLoginTime?: string
  lastLoginIp?: string
  status: 'active' | 'inactive'
}

export interface UserForm {
  username: string
  password?: string
  role: string
  merchantId?: string
  status: 'active' | 'inactive'
}