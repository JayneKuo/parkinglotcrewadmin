import type { RFID, RFIDStatus } from '@/types/rfid'

// 模拟RFID数据
export const mockRFIDs: RFID[] = [
  {
    id: 'R001',
    tagId: 'RFID-001',
    vehiclePlate: 'ABC123',
    driverName: 'John Smith',
    status: 'active',
    bindTime: '2024-01-01',
    expireTime: '2024-12-31',
    lastUsed: '2024-03-15 14:30',
    notes: 'Primary vehicle',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z'
  },
  {
    id: 'R002',
    tagId: 'RFID-002',
    vehiclePlate: 'XYZ789',
    driverName: 'Sarah Johnson',
    status: 'active',
    bindTime: '2024-02-01',
    expireTime: '2024-12-31',
    lastUsed: '2024-03-14 09:15',
    notes: 'Secondary vehicle',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-14T09:15:00Z'
  },
  {
    id: 'R003',
    tagId: 'RFID-003',
    vehiclePlate: 'DEF456',
    driverName: 'Mike Wilson',
    status: 'inactive',
    bindTime: '2023-06-15',
    expireTime: '2024-06-14',
    lastUsed: '2024-02-28 16:45',
    createdAt: '2023-06-15T14:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z'
  }
]

// 模拟API响应
export const mockRFIDResponse = (params: any) => {
  const { keyword, status, page = 1, pageSize = 10 } = params

  let filteredRFIDs = [...mockRFIDs]

  // 关键词搜索
  if (keyword) {
    const searchText = keyword.toLowerCase()
    filteredRFIDs = filteredRFIDs.filter(rfid => 
      rfid.tagId.toLowerCase().includes(searchText) ||
      rfid.vehiclePlate.toLowerCase().includes(searchText) ||
      rfid.driverName.toLowerCase().includes(searchText)
    )
  }

  // 状态筛选
  if (status) {
    filteredRFIDs = filteredRFIDs.filter(rfid => rfid.status === status)
  }

  // 计算分页
  const total = filteredRFIDs.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = filteredRFIDs.slice(start, end)

  return {
    items,
    total,
    page,
    pageSize
  }
}

// 创建RFID
export const mockCreateRFID = (data: Partial<RFID>): RFID => {
  const newRFID: RFID = {
    id: `R${String(mockRFIDs.length + 1).padStart(3, '0')}`,
    status: 'active',
    bindTime: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  } as RFID

  mockRFIDs.push(newRFID)
  return newRFID
}

// 更新RFID
export const mockUpdateRFID = (id: string, data: Partial<RFID>): RFID => {
  const index = mockRFIDs.findIndex(r => r.id === id)
  if (index === -1) {
    throw new Error('RFID not found')
  }

  mockRFIDs[index] = {
    ...mockRFIDs[index],
    ...data,
    updatedAt: new Date().toISOString()
  }

  return mockRFIDs[index]
}

// 删除RFID
export const mockDeleteRFID = (id: string): void => {
  const index = mockRFIDs.findIndex(r => r.id === id)
  if (index === -1) {
    throw new Error('RFID not found')
  }

  mockRFIDs.splice(index, 1)
} 