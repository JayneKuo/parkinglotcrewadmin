export interface Merchant {
  id: string
  name: string
  contact: string
  phone: string
  plan: {
    id: string
    name: string
    status: 'active' | 'trial' | 'expired'
    parkingLotLimit: number
    staffLimit: number
    appFeatures: string[]
  }
}

export interface MerchantForm {
  name: string
  contact: string
  phone: string
  planId: string
}