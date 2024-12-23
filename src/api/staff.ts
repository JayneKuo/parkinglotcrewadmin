import request from '@/utils/request'

// 重置密码
export function resetPassword(data: {
  staffId: string
  newPassword: string
}) {
  return request({
    url: '/staff/reset-password',
    method: 'post',
    data
  })
}

// 发送密码邮件
export function sendPasswordEmail(data: {
  to: string
  password: string
  type: 'reset' | 'initial'
}) {
  return request({
    url: '/staff/send-password-email',
    method: 'post',
    data
  })
}

// 获取员工列表
export function getStaffList(params: {
  name?: string
  phone?: string
  role?: string
  status?: string
  workShift?: string
  parkingLotId?: string
}) {
  return request({
    url: '/staff/list',
    method: 'get',
    params
  })
}

// 新增员工
export function addStaff(data: {
  name: string
  phone: string
  email: string
  role: string
  parkingLotId: string
  status: string
  joinDate: string
  password: string
}) {
  return request({
    url: '/staff',
    method: 'post',
    data
  })
}

// 更新员工信息
export function updateStaff(id: string, data: {
  name?: string
  phone?: string
  email?: string
  role?: string
  parkingLotId?: string
  status?: string
  joinDate?: string
}) {
  return request({
    url: `/staff/${id}`,
    method: 'put',
    data
  })
} 