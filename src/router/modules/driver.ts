import { RouteRecordRaw } from 'vue-router'

const driverRoutes: RouteRecordRaw[] = [
  {
    path: '/driver',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: '',
        name: 'Driver',
        component: () => import('@/views/driver/index.vue'),
        meta: {
          title: 'Driver Management',
          icon: 'User'
        }
      }
    ]
  }
]

export default driverRoutes 