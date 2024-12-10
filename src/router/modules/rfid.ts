import { RouteRecordRaw } from 'vue-router'

const rfidRoutes: RouteRecordRaw[] = [
  {
    path: '/rfid',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: '',
        name: 'RFID',
        component: () => import('@/views/rfid/index.vue'),
        meta: {
          title: 'RFID Management',
          icon: 'Key',
          order: 15
        }
      }
    ]
  }
]

export default rfidRoutes 