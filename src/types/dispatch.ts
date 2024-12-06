export interface DispatchTask {
  id: string
  taskNo: string
  type: 'transfer' | 'maintenance' | 'emergency'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  parkingLot: string
  description: string
  assignee?: string
  createdAt: string
  completedAt?: string
}

export interface DispatchForm {
  type: string
  priority: string
  parkingLotId: string
  description: string
  assigneeId: string
}

export interface ParkingLotStatus {
  id: string
  name: string
  totalSpots: number
  occupiedSpots: number
  availableSpots: number
  maintenanceSpots: number
}