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
          title: 'Driver Management'
        }
      },
      {
        path: 'add',
        name: 'DriverAdd',
        component: () => import('@/views/driver/add.vue'),
        meta: {
          title: 'Add Driver'
        }
      },
      {
        path: ':id/edit',
        name: 'DriverEdit',
        component: () => import('@/views/driver/edit.vue'),
        meta: {
          title: 'Edit Driver'
        }
      },
      {
        path: ':id/vehicles',
        name: 'DriverVehicles',
        component: () => import('@/views/driver/vehicles.vue'),
        meta: {
          title: 'Vehicle Management'
        }
      },
      {
        path: ':id/history',
        name: 'DriverHistory',
        component: () => import('@/views/driver/history.vue'),
        meta: {
          title: 'Parking History'
        }
      }
    ]
  }
]

export default driverRoutes 