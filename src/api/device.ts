import type { Device } from '@/types/device'
import { mockDevices } from '@/types/device'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 获取设备列表
export const getDevices = async () => {
  await delay(500)
  return mockDevices
}

// 获取设备详情
export const getDevice = async (id: string) => {
  await delay(300)
  const device = mockDevices.find(d => d.id === id)
  if (!device) {
    throw new Error('Device not found')
  }
  return device
}

// 创建设备
export const createDevice = async (data: Partial<Device>) => {
  await delay(800)
  const newDevice: Device = {
    id: `DEV${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    connected: true,
    ...data
  } as Device
  
  mockDevices.unshift(newDevice)
  return newDevice
}

// 更新设备
export const updateDevice = async (id: string, data: Partial<Device>) => {
  await delay(600)
  const index = mockDevices.findIndex(d => d.id === id)
  if (index === -1) {
    throw new Error('Device not found')
  }
  
  const updatedDevice = {
    ...mockDevices[index],
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  mockDevices[index] = updatedDevice
  return updatedDevice
}

// 删除设备
export const deleteDevice = async (id: string) => {
  await delay(500)
  const index = mockDevices.findIndex(d => d.id === id)
  if (index === -1) {
    throw new Error('Device not found')
  }
  mockDevices.splice(index, 1)
}

// 重启设备
export const restartDevice = async (id: string) => {
  await delay(1000)
  const device = mockDevices.find(d => d.id === id)
  if (!device) {
    throw new Error('Device not found')
  }
  // 模拟重启过程
  device.connected = false
  await delay(2000)
  device.connected = true
} 