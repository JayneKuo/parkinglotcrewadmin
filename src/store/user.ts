import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: string
  username: string
  role: 'admin' | 'merchant-admin' | 'merchant-staff'
  permissions: string[]
  merchantId?: string
  plan?: {
    id: string
    name: string
    expireTime: string
    status: 'active' | 'expired' | 'trial'
  }
}

// 预设用户数据
const predefinedUsers = {
  admin: {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    permissions: ['*']
  },
  merchant: {
    id: 'merchant1',
    username: 'merchant',
    password: 'merchant123',
    role: 'merchant-admin',
    merchantId: 'merchant1',
    permissions: [
      'parking:*',
      'order:*',
      'report:*',
      'reservation:*',
      'valet:*',
      'dispatch:*',
      'staff:*',
      'driver:*',
      'finance:*',
      'device:*',
      'settings:*'
    ],
    plan: {
      id: '3',
      name: '免费体验版',
      expireTime: '2024-03-01',
      status: 'trial'
    }
  }
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo>({
    id: '',
    username: '',
    role: 'merchant-staff',
    permissions: []
  })

  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const user = Object.values(predefinedUsers).find(
        u => u.username === username && u.password === password
      )

      if (user) {
        const { password: _, ...info } = user
        userInfo.value = info as UserInfo
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  const hasPermission = (permission: string): boolean => {
    // 系统管理员拥有所有权限
    if (userInfo.value.role === 'admin') return true

    // 检查套餐是否过期
    if (userInfo.value.plan && userInfo.value.plan.status === 'expired') {
      return false
    }

    // 通配符权限检查
    if (userInfo.value.permissions.includes('*')) return true

    // 模块级权限检查 (例如: 'parking:*')
    const modulePermission = permission.split(':')[0] + ':*'
    if (userInfo.value.permissions.includes(modulePermission)) return true

    return userInfo.value.permissions.includes(permission)
  }

  const isPlanExpired = (): boolean => {
    if (!userInfo.value.plan) return false
    if (userInfo.value.role === 'admin') return false

    const expireTime = new Date(userInfo.value.plan.expireTime).getTime()
    const now = new Date().getTime()
    return now > expireTime
  }

  const clearUserInfo = () => {
    userInfo.value = {
      id: '',
      username: '',
      role: 'merchant-staff',
      permissions: []
    }
  }

  return {
    userInfo,
    login,
    hasPermission,
    isPlanExpired,
    clearUserInfo
  }
})