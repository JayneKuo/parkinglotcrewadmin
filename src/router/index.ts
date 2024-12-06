import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import deviceRoutes from './modules/device'
import driverRoutes from './modules/driver'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { 
      title: 'Login',
      hidden: true,
      public: true  // 标记为公开路由
    }
  },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: '/parking',
        name: 'Parking',
        component: () => import('@/views/parking/index.vue'),
        meta: {
          title: 'Parking Lots'
        }
      },
      {
        path: '/parking/add',
        name: 'ParkingAdd',
        component: () => import('@/views/parking/add.vue'),
        meta: {
          title: 'Add Parking Lot'
        }
      },
      {
        path: '/reservation',
        name: 'Reservation',
        component: () => import('@/views/reservation/index.vue'),
        meta: {
          title: 'Reservations'
        }
      },
      {
        path: '/reservation/detail/:id',
        name: 'ReservationDetail',
        component: () => import('@/views/reservation/detail.vue'),
        meta: {
          title: 'Reservation Detail'
        }
      },
      {
        path: '/valet',
        name: 'Valet',
        component: () => import('@/views/valet/index.vue'),
        meta: {
          title: 'Valet Service'  
        }
      },
      {
        path: '/valet/detail/:id',
        name: 'ValetDetail',
        component: () => import('@/views/valet/detail.vue'),
        meta: {
          title: 'Valet Order Detail'
        }
      },
      {
        path: '/dispatch',
        name: 'Dispatch',
        component: () => import('@/views/dispatch/index.vue'),
        meta: {
          title: 'Dispatch Management'
        }
      },
      {
        path: '/staff',
        name: 'Staff',
        component: () => import('@/views/staff/index.vue'),
        meta: {
          title: 'Staff Management'
        }
      }
    ]
  },
  ...deviceRoutes,
  ...driverRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  // 获取 token
  const token = localStorage.getItem('token')
  
  // 如果是访问登录页
  if (to.path === '/login') {
    if (token) {
      // 已登录则跳转到首页
      next('/')
    } else {
      // 未登录则允许访问登录页
      next()
    }
    return
  }

  // 如果是公开页面，直接通过
  if (to.meta.public) {
    next()
    return
  }

  // 其他页面需要验证登录状态
  if (!token) {
    // 未登录则跳转到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }  // 保存原目标路径
    })
    return
  }

  next()
})

export default router