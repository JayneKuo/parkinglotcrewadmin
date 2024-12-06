import request from '@/utils/request'
import type { DispatchTask, ParkingLotStatus } from '@/types/dispatch'

// 获取调度任务列表
export function getDispatchTasks(params: any) {
  return request<{
    list: DispatchTask[]
    total: number
  }>({
    url: '/dispatch/tasks',
    method: 'get',
    params
  })
}

// 创建调度任务
export function createDispatchTask(data: any) {
  return request<DispatchTask>({
    url: '/dispatch/tasks',
    method: 'post',
    data
  })
}

// 更新任务状态
export function updateTaskStatus(taskId: string, status: string) {
  return request({
    url: `/dispatch/tasks/${taskId}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取停车场实时状态
export function getParkingLotStatus() {
  return request<ParkingLotStatus[]>({
    url: '/dispatch/parking-status',
    method: 'get'
  })
} 