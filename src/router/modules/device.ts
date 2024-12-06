import { RouteRecordRaw } from 'vue-router'

const deviceRoutes: RouteRecordRaw[] = [
  {
    path: '/device',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: '',
        name: 'Device',
        component: () => import('@/views/device/index.vue'),
        meta: {
          title: 'Device Management',
          icon: 'Cpu'
        }
      },
      {
        path: 'monitor',
        name: 'DeviceMonitor',
        component: () => import('@/views/device/monitor.vue'),
        meta: {
          title: 'Device Monitor',
          hidden: true
        }
      },
      {
        path: 'add',
        name: 'AddDevice',
        component: () => import('@/views/device/DeviceForm.vue'),
        meta: {
          title: 'Add Device',
          hidden: true
        }
      },
      {
        path: 'edit/:id',
        name: 'EditDevice',
        component: () => import('@/views/device/DeviceForm.vue'),
        meta: {
          title: 'Edit Device',
          hidden: true
        }
      }
    ]
  }
]

export default deviceRoutes 