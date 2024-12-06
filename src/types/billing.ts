<content>export interface BillingScheme {
  id: string
  name: string
  type: 'time' | 'count'
  firstPrice?: number
  firstHours?: number
  additionalPrice?: number
  perPrice?: number
  status: number
}

export interface BillingRule {
  id: string
  schemeId: string
  startTime?: string
  endTime?: string
  weekdays?: number[]
  price: number
}</content>